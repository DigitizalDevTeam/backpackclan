import { NextResponse } from "next/server";
import {
  buildSessionCookieValue,
  createSessionToken,
  SESSION_COOKIE,
} from "@/lib/auth/session";
import { customerToAuthUser } from "@/lib/mock/auth";
import { laravelCustomerRegister, useLaravelApi } from "@/lib/api/auth-laravel";
import { createCustomer, findCustomerByEmail } from "@/lib/mock/customer-store";
import { findUserByEmail } from "@/lib/mock/user-store";

function setSessionCookie(response: NextResponse, user: Parameters<typeof buildSessionCookieValue>[0], token: string) {
  const cookieValue = buildSessionCookieValue(user, token);
  response.cookies.set(SESSION_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, errors: { form: "All fields are required" } },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, errors: { form: "Password must be at least 8 characters" } },
        { status: 400 }
      );
    }

    if (useLaravelApi()) {
      const result = await laravelCustomerRegister({
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        password: String(password),
      });

      if (!result.ok) {
        return NextResponse.json(
          { success: false, errors: result.errors },
          { status: 400 }
        );
      }

      const response = NextResponse.json({ success: true, data: { user: result.user } });
      setSessionCookie(response, result.user, result.token);
      return response;
    }

    if (findUserByEmail(email) || findCustomerByEmail(email)) {
      return NextResponse.json(
        { success: false, errors: { form: "An account with this email already exists" } },
        { status: 409 }
      );
    }

    const customer = createCustomer({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      password: String(password),
    });

    const user = customerToAuthUser(customer);
    const token = createSessionToken(user.id);
    const response = NextResponse.json({ success: true, data: { user } });
    setSessionCookie(response, user, token);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
