import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/bankService";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountNumber, password, rememberMe } = body;

    if (!accountNumber || !password) {
      return NextResponse.json(
        { success: false, error: "Account number and password are required." },
        { status: 400 }
      );
    }

    const parsedAccNo = parseInt(String(accountNumber).trim(), 10);
    if (isNaN(parsedAccNo)) {
      return NextResponse.json(
        { success: false, error: "Invalid account number format." },
        { status: 400 }
      );
    }

    const result = await authenticate(parsedAccNo, String(password));
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Invalid account number or password." },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: result.userId,
      accountNumber: result.accountNumber,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        accountNumber: result.accountNumber,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        balance: result.balance,
      },
    });

    setSessionCookie(response, token);

    if (rememberMe) {
      response.cookies.set({
        name: "acebank_remember",
        value: String(result.accountNumber),
        httpOnly: false, // Accessible to fill the form input
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
