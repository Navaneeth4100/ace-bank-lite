import prisma from "./prisma";
import { hashPassword, verifyPassword } from "./auth";
import { sendWelcomeEmailAsync, sendRecoveryEmailAsync } from "./mail";
import { Prisma } from "@prisma/client";

export const DAILY_LIMIT = 500.0;

export interface LoginResult {
  userId: number;
  accountNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
}

export interface ServiceResponse {
  success: boolean;
  message: string;
}

export interface TransactionItem {
  id: number;
  senderAccount: number | null;
  receiverAccount: number | null;
  amount: number;
  txType: "TRANSFER" | "DEPOSIT" | "WITHDRAWAL";
  remark: string | null;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// 1. Authentication
// -----------------------------------------------------------------------------
export async function authenticate(
  accountNo: number,
  plainPassword: string
): Promise<LoginResult | null> {
  const account = await prisma.account.findUnique({
    where: { accountNo },
    include: { user: true },
  });

  if (!account || !account.user) {
    return null;
  }

  const isMatch = await verifyPassword(plainPassword, account.user.passwordHash);
  if (!isMatch) {
    return null;
  }

  return {
    userId: account.user.id,
    accountNumber: account.accountNo,
    firstName: account.user.firstName,
    lastName: account.user.lastName,
    email: account.user.email,
    balance: Number(account.balance),
  };
}

// -----------------------------------------------------------------------------
// 2. User Registration
// -----------------------------------------------------------------------------
export async function registerUser(data: {
  firstName: string;
  lastName: string;
  aadhaarNo: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; result?: LoginResult; error?: string }> {
  // Check if email or Aadhaar already registered
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { aadhaarNo: data.aadhaarNo }],
    },
  });

  if (existingUser) {
    if (existingUser.email === data.email) {
      return { success: false, error: "An account with this email already exists." };
    }
    return { success: false, error: "An account with this Aadhaar number already exists." };
  }

  // Generate 8-digit unique account number
  let accountNumber = Math.floor(10000000 + Math.random() * 90000000);
  let attempts = 0;
  while (attempts < 10) {
    const existingAcc = await prisma.account.findUnique({
      where: { accountNo: accountNumber },
    });
    if (!existingAcc) break;
    accountNumber = Math.floor(10000000 + Math.random() * 90000000);
    attempts++;
  }

  const hashedPassword = await hashPassword(data.password);

  try {
    // Atomic Transaction for User + Account creation
    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          aadhaarNo: data.aadhaarNo.trim(),
          email: data.email.trim().toLowerCase(),
          passwordHash: hashedPassword,
        },
      });

      await tx.account.create({
        data: {
          accountNo: accountNumber,
          userId: user.id,
          balance: new Prisma.Decimal(0.0),
          status: "ACTIVE",
          accountType: "SAVINGS",
        },
      });

      return user;
    });

    // Send Welcome Email asynchronously
    sendWelcomeEmailAsync(createdUser.firstName, createdUser.email, accountNumber);

    return {
      success: true,
      result: {
        userId: createdUser.id,
        accountNumber,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        email: createdUser.email,
        balance: 0.0,
      },
    };
  } catch (error) {
    console.error("SignUp Error in Prisma:", error);
    return { success: false, error: "Could not create account. Please try again." };
  }
}

// -----------------------------------------------------------------------------
// 3. Balance & Dashboard Data
// -----------------------------------------------------------------------------
export async function getBalance(accountNo: number): Promise<number> {
  const account = await prisma.account.findUnique({
    where: { accountNo },
    select: { balance: true },
  });
  return account ? Number(account.balance) : 0.0;
}

export async function getDailyWithdrawalTotal(accountNo: number): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const withdrawals = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      senderAccount: accountNo,
      txType: "WITHDRAWAL",
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  return withdrawals._sum.amount ? Number(withdrawals._sum.amount) : 0.0;
}

// -----------------------------------------------------------------------------
// 4. Deposit Operation
// -----------------------------------------------------------------------------
export async function processDeposit(
  accountNo: number,
  amount: number
): Promise<ServiceResponse> {
  if (amount <= 0 || isNaN(amount)) {
    return { success: false, message: "Please enter a valid deposit amount greater than zero." };
  }

  const decAmount = new Prisma.Decimal(amount);

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Increment balance
      await tx.account.update({
        where: { accountNo },
        data: {
          balance: { increment: decAmount },
        },
      });

      // 2. Log Transaction
      await tx.transaction.create({
        data: {
          senderAccount: accountNo,
          receiverAccount: accountNo,
          amount: decAmount,
          txType: "DEPOSIT",
          remark: "Self",
        },
      });
    });

    return { success: true, message: `Successfully deposited ₹${amount.toFixed(2)}` };
  } catch (error) {
    console.error("Deposit Error:", error);
    return { success: false, message: "Failed to process deposit. Please try again." };
  }
}

// -----------------------------------------------------------------------------
// 5. Withdrawal Operation (with Daily Limit Check)
// -----------------------------------------------------------------------------
export async function processWithdraw(
  accountNo: number,
  amount: number
): Promise<ServiceResponse> {
  if (amount <= 0 || isNaN(amount)) {
    return { success: false, message: "Invalid amount." };
  }

  // Daily Limit Rule
  const alreadyWithdrawn = await getDailyWithdrawalTotal(accountNo);
  const projectedTotal = alreadyWithdrawn + amount;

  if (projectedTotal > DAILY_LIMIT) {
    const remaining = Math.max(0, DAILY_LIMIT - alreadyWithdrawn);
    return {
      success: false,
      message: `Limit exceeded. You can only withdraw ₹${remaining.toFixed(2)} more today.`,
    };
  }

  const decAmount = new Prisma.Decimal(amount);

  try {
    const success = await prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({
        where: { accountNo },
        select: { balance: true },
      });

      if (!account || Number(account.balance) < amount) {
        return false;
      }

      // Deduct balance
      await tx.account.update({
        where: { accountNo },
        data: {
          balance: { decrement: decAmount },
        },
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          senderAccount: accountNo,
          receiverAccount: accountNo,
          amount: decAmount,
          txType: "WITHDRAWAL",
          remark: "ATM/Counter Withdrawal",
        },
      });

      return true;
    });

    if (!success) {
      return { success: false, message: "Insufficient balance or account error." };
    }

    return { success: true, message: `Successfully withdrew ₹${amount.toFixed(2)}` };
  } catch (error) {
    console.error("Withdrawal Error:", error);
    return { success: false, message: "System error during withdrawal. Please try later." };
  }
}

// -----------------------------------------------------------------------------
// 6. Fund Transfer Operation (Atomic Multi-account Transaction)
// -----------------------------------------------------------------------------
export async function processTransfer(
  fromAcc: number,
  toAcc: number,
  amount: number
): Promise<ServiceResponse> {
  if (fromAcc === toAcc) {
    return { success: false, message: "You cannot transfer money to your own account." };
  }

  if (amount <= 0 || isNaN(amount)) {
    return { success: false, message: "Please enter a valid amount greater than zero." };
  }

  const recipient = await prisma.account.findUnique({
    where: { accountNo: toAcc },
  });

  if (!recipient) {
    return { success: false, message: `Recipient account number ${toAcc} not found.` };
  }

  const senderBalance = await getBalance(fromAcc);
  if (senderBalance < amount) {
    return {
      success: false,
      message: `Insufficient balance. Your current balance is ₹${senderBalance.toFixed(2)}.`,
    };
  }

  const decAmount = new Prisma.Decimal(amount);

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Deduct sender
      await tx.account.update({
        where: { accountNo: fromAcc },
        data: { balance: { decrement: decAmount } },
      });

      // 2. Credit recipient
      await tx.account.update({
        where: { accountNo: toAcc },
        data: { balance: { increment: decAmount } },
      });

      // 3. Log transaction
      await tx.transaction.create({
        data: {
          senderAccount: fromAcc,
          receiverAccount: toAcc,
          amount: decAmount,
          txType: "TRANSFER",
          remark: `Transfer to ${toAcc}`,
        },
      });
    });

    return { success: true, message: `Transfer Successful! Sent ₹${amount.toFixed(2)} to account ${toAcc}.` };
  } catch (error) {
    console.error("Transfer Error:", error);
    return { success: false, message: "Database connection error during transfer. Please try again." };
  }
}

// -----------------------------------------------------------------------------
// 7. Transaction History / Statement
// -----------------------------------------------------------------------------
export async function getTransactionHistory(accountNo: number): Promise<TransactionItem[]> {
  try {
    const list = await prisma.transaction.findMany({
      where: {
        OR: [{ senderAccount: accountNo }, { receiverAccount: accountNo }],
      },
      orderBy: { createdAt: "desc" },
    });

    return list.map((tx) => ({
      id: tx.id,
      senderAccount: tx.senderAccount,
      receiverAccount: tx.receiverAccount,
      amount: Number(tx.amount),
      txType: tx.txType as "TRANSFER" | "DEPOSIT" | "WITHDRAWAL",
      remark: tx.remark,
      createdAt: tx.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Statement Error:", error);
    return [];
  }
}

// -----------------------------------------------------------------------------
// 8. Password Change & Account Recovery
// -----------------------------------------------------------------------------
export async function changePassword(
  accountNo: number,
  oldPlain: string,
  newPlain: string
): Promise<ServiceResponse> {
  const account = await prisma.account.findUnique({
    where: { accountNo },
    include: { user: true },
  });

  if (!account || !account.user) {
    return { success: false, message: "Account not found." };
  }

  const isMatch = await verifyPassword(oldPlain, account.user.passwordHash);
  if (!isMatch) {
    return { success: false, message: "Current password does not match." };
  }

  if (newPlain.length < 10) {
    return { success: false, message: "New password must be at least 10 characters long." };
  }

  const newHash = await hashPassword(newPlain);

  await prisma.user.update({
    where: { id: account.user.id },
    data: { passwordHash: newHash },
  });

  return { success: true, message: "Password updated successfully." };
}

export async function recoverAccount(email: string): Promise<ServiceResponse> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { accounts: true },
  });

  if (!user || user.accounts.length === 0) {
    // Return friendly generic message for security
    return {
      success: true,
      message: "If an account exists with this email, recovery details have been sent.",
    };
  }

  const accNo = user.accounts[0].accountNo;
  await sendRecoveryEmailAsync(user.firstName, user.lastName, user.email, accNo);

  return {
    success: true,
    message: "Account recovery instructions have been sent to your email address.",
  };
}
