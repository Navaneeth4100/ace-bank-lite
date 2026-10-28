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
// Auto Schema Initializer (Ensures Tables Exist without Manual SQL)
// -----------------------------------------------------------------------------
export async function initDatabaseSchema(): Promise<{ success: boolean; message: string }> {
  if (!process.env.DATABASE_URL) {
    return {
      success: false,
      message: "DATABASE_URL is not defined in Vercel Environment Variables.",
    };
  }

  try {
    const isPostgres =
      process.env.DATABASE_URL.startsWith("postgres://") ||
      process.env.DATABASE_URL.startsWith("postgresql://");

    if (isPostgres) {
      // Create PostgreSQL Enum Types safely
      await prisma.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "AccountType" AS ENUM ('SAVINGS', 'CHECKING', 'LOAN');
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await prisma.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'CLOSED');
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await prisma.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "TransactionType" AS ENUM ('TRANSFER', 'DEPOSIT', 'WITHDRAWAL');
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);

      // Create Tables
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "USERS" (
          "USER_ID" SERIAL PRIMARY KEY,
          "FIRST_NAME" VARCHAR(255) NOT NULL,
          "LAST_NAME" VARCHAR(255) NOT NULL,
          "AADHAAR_NO" VARCHAR(12) UNIQUE NOT NULL,
          "EMAIL" VARCHAR(255) UNIQUE NOT NULL,
          "PASSWORD_HASH" VARCHAR(255) NOT NULL,
          "CREATED_AT" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ACCOUNTS" (
          "ACCOUNT_NO" INT PRIMARY KEY,
          "USER_ID" INT NOT NULL REFERENCES "USERS"("USER_ID") ON DELETE CASCADE,
          "ACCOUNT_TYPE" "AccountType" DEFAULT 'SAVINGS',
          "BALANCE" DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
          "STATUS" "AccountStatus" DEFAULT 'ACTIVE'
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "TRANSACTIONS" (
          "ID" SERIAL PRIMARY KEY,
          "SENDER_ACCOUNT" INT NULL REFERENCES "ACCOUNTS"("ACCOUNT_NO"),
          "RECEIVER_ACCOUNT" INT NULL REFERENCES "ACCOUNTS"("ACCOUNT_NO"),
          "AMOUNT" DECIMAL(15, 2) NOT NULL,
          "TX_TYPE" "TransactionType" NOT NULL,
          "REMARK" VARCHAR(255),
          "CREATED_AT" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else {
      // MySQL Table Creation
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS USERS (
          USER_ID INT AUTO_INCREMENT PRIMARY KEY,
          FIRST_NAME VARCHAR(255) NOT NULL,
          LAST_NAME VARCHAR(255) NOT NULL,
          AADHAAR_NO VARCHAR(12) UNIQUE NOT NULL,
          EMAIL VARCHAR(255) UNIQUE NOT NULL,
          PASSWORD_HASH VARCHAR(255) NOT NULL,
          CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS ACCOUNTS (
          ACCOUNT_NO INT PRIMARY KEY,
          USER_ID INT NOT NULL,
          ACCOUNT_TYPE ENUM('SAVINGS', 'CHECKING', 'LOAN') DEFAULT 'SAVINGS',
          BALANCE DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
          STATUS ENUM('ACTIVE', 'BLOCKED', 'CLOSED') DEFAULT 'ACTIVE',
          FOREIGN KEY (USER_ID) REFERENCES USERS(USER_ID) ON DELETE CASCADE
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS TRANSACTIONS (
          ID INT AUTO_INCREMENT PRIMARY KEY,
          SENDER_ACCOUNT INT NULL,
          RECEIVER_ACCOUNT INT NULL,
          AMOUNT DECIMAL(15, 2) NOT NULL,
          TX_TYPE ENUM('TRANSFER', 'DEPOSIT', 'WITHDRAWAL') NOT NULL,
          REMARK VARCHAR(255),
          CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    return { success: true, message: "Database tables verified/created successfully." };
  } catch (err: any) {
    console.error("Auto schema initialization failed:", err);
    return { success: false, message: err?.message || "Failed to initialize schema." };
  }
}

// -----------------------------------------------------------------------------
// 1. Authentication
// -----------------------------------------------------------------------------
export async function authenticate(
  accountNo: number,
  plainPassword: string
): Promise<LoginResult | null> {
  try {
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
  } catch (err: any) {
    console.error("Authentication error:", err);
    // If relation does not exist, try auto-init once
    if (String(err?.message).includes("does not exist")) {
      await initDatabaseSchema();
    }
    return null;
  }
}

// -----------------------------------------------------------------------------
// 2. User Registration (Self-Healing with Auto Table Creation)
// -----------------------------------------------------------------------------
export async function registerUser(
  data: {
    firstName: string;
    lastName: string;
    aadhaarNo: string;
    email: string;
    password: string;
  },
  hasRetried = false
): Promise<{ success: boolean; result?: LoginResult; error?: string }> {
  if (!process.env.DATABASE_URL) {
    return {
      success: false,
      error: "Database not connected. Please set DATABASE_URL in Vercel Project Settings > Environment Variables.",
    };
  }

  try {
    // 1. Check if email or Aadhaar already registered
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email.trim().toLowerCase() }, { aadhaarNo: data.aadhaarNo.trim() }],
      },
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === data.email.trim().toLowerCase()) {
        return { success: false, error: "An account with this email address already exists." };
      }
      return { success: false, error: "An account with this Aadhaar number already exists." };
    }

    // 2. Generate unique 8-digit account number
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

    // 3. Atomic Transaction for User + Account creation
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

    // 4. Send Welcome Email asynchronously
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
  } catch (error: any) {
    const errorMsg = String(error?.message || "");
    console.error("SignUp Error in Prisma:", errorMsg);

    // Self-healing: If tables don't exist yet, auto-create them and retry once
    if (!hasRetried && (errorMsg.includes("does not exist") || errorMsg.includes("relation") || errorMsg.includes("Table"))) {
      console.info("Tables missing in database. Auto-creating tables now...");
      const initResult = await initDatabaseSchema();
      if (initResult.success) {
        return registerUser(data, true); // Retry registration
      }
    }

    if (errorMsg.includes("Can't reach database") || errorMsg.includes("connect")) {
      return {
        success: false,
        error: "Cannot connect to database. Please check that DATABASE_URL in Vercel is correct.",
      };
    }

    return {
      success: false,
      error: `Signup failed: ${error?.message || "Please verify your input and try again."}`,
    };
  }
}

// -----------------------------------------------------------------------------
// 3. Balance & Dashboard Data
// -----------------------------------------------------------------------------
export async function getBalance(accountNo: number): Promise<number> {
  try {
    const account = await prisma.account.findUnique({
      where: { accountNo },
      select: { balance: true },
    });
    return account ? Number(account.balance) : 0.0;
  } catch {
    return 0.0;
  }
}

export async function getDailyWithdrawalTotal(accountNo: number): Promise<number> {
  try {
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
  } catch {
    return 0.0;
  }
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
  } catch (error: any) {
    console.error("Deposit Error:", error);
    return { success: false, message: `Failed to process deposit: ${error?.message || "Try again"}` };
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

      await tx.account.update({
        where: { accountNo },
        data: {
          balance: { decrement: decAmount },
        },
      });

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
  } catch (error: any) {
    console.error("Withdrawal Error:", error);
    return { success: false, message: `System error during withdrawal: ${error?.message || "Try again"}` };
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
      await tx.account.update({
        where: { accountNo: fromAcc },
        data: { balance: { decrement: decAmount } },
      });

      await tx.account.update({
        where: { accountNo: toAcc },
        data: { balance: { increment: decAmount } },
      });

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
  } catch (error: any) {
    console.error("Transfer Error:", error);
    return { success: false, message: `Database error during transfer: ${error?.message || "Please try again."}` };
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
  } catch {
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
