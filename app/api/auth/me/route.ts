import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getBalance } from "@/lib/bankService";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const balance = await getBalance(session.accountNumber);

  return NextResponse.json({
    authenticated: true,
    user: {
      accountNumber: session.accountNumber,
      firstName: session.firstName,
      lastName: session.lastName,
      email: session.email,
      balance,
    },
  });
}
