import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/bankService";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, aadharNumber, email, password } = body;

    // Validation matching Java Servlets and JSP constraints
    if (!firstName || !lastName || !aadharNumber || !email || !password) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 }
      );
    }

    const cleanAadhaar = String(aadharNumber).trim();
    if (!/^\d{12}$/.test(cleanAadhaar)) {
      return NextResponse.json(
        { success: false, error: "Aadhaar number must be exactly 12 digits." },
        { status: 400 }
      );
    }

    if (password.length < 10) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 10 characters long." },
        { status: 400 }
      );
    }

    const regResponse = await registerUser({
      firstName,
      lastName,
      aadhaarNo: cleanAadhaar,
      email,
      password,
    });

    if (!regResponse.success || !regResponse.result) {
      return NextResponse.json(
        { success: false, error: regResponse.error || "Signup failed." },
        { status: 400 }
      );
    }

    const result = regResponse.result;

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
    return response;
  } catch (error) {
    console.error("SignUp API Error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during signup." },
      { status: 500 }
    );
  }
}
