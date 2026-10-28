import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash("Password123!", salt);

  // 1. Create Demo User 1
  const user1 = await prisma.user.upsert({
    where: { email: "rahul.sharma@example.com" },
    update: {},
    create: {
      firstName: "Rahul",
      lastName: "Sharma",
      aadhaarNo: "123456789012",
      email: "rahul.sharma@example.com",
      passwordHash: hashedPassword,
    },
  });

  const account1 = await prisma.account.upsert({
    where: { accountNo: 10001000 },
    update: {},
    create: {
      accountNo: 10001000,
      userId: user1.id,
      balance: new Prisma.Decimal(25000.0),
      status: "ACTIVE",
      accountType: "SAVINGS",
    },
  });

  // 2. Create Demo User 2 (Recipient for transfer testing)
  const user2 = await prisma.user.upsert({
    where: { email: "priya.verma@example.com" },
    update: {},
    create: {
      firstName: "Priya",
      lastName: "Verma",
      aadhaarNo: "987654321098",
      email: "priya.verma@example.com",
      passwordHash: hashedPassword,
    },
  });

  const account2 = await prisma.account.upsert({
    where: { accountNo: 20002000 },
    update: {},
    create: {
      accountNo: 20002000,
      userId: user2.id,
      balance: new Prisma.Decimal(15000.0),
      status: "ACTIVE",
      accountType: "SAVINGS",
    },
  });

  // 3. Create initial transactions
  const txCount = await prisma.transaction.count();
  if (txCount === 0) {
    await prisma.transaction.createMany({
      data: [
        {
          senderAccount: account1.accountNo,
          receiverAccount: account1.accountNo,
          amount: new Prisma.Decimal(20000.0),
          txType: "DEPOSIT",
          remark: "Initial Opening Deposit",
        },
        {
          senderAccount: account1.accountNo,
          receiverAccount: account2.accountNo,
          amount: new Prisma.Decimal(2500.0),
          txType: "TRANSFER",
          remark: "Transfer to 20002000",
        },
        {
          senderAccount: account1.accountNo,
          receiverAccount: account1.accountNo,
          amount: new Prisma.Decimal(200.0),
          txType: "WITHDRAWAL",
          remark: "ATM/Counter Withdrawal",
        },
      ],
    });
  }

  console.log("Database seeded successfully!");
  console.log("-----------------------------------------");
  console.log("Demo User 1:");
  console.log("  Account Number: 10001000");
  console.log("  Password:       Password123!");
  console.log("Demo User 2 (Recipient):");
  console.log("  Account Number: 20002000");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
