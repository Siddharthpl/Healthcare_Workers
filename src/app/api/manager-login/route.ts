import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log('API route /api/manager-login POST called');
  // DEBUG: Log environment and request values
  const body = await req.json();
  const email = process.env.MANAGER_EMAIL;
  const password = process.env.MANAGER_PASSWORD;
  console.log('Manager Login Attempt:', { received: body, expected: { email, password } });

  // Extra debug logs
  if (!email || !password) {
    console.error('MANAGER_EMAIL or MANAGER_PASSWORD is undefined. Check .env.local and restart the dev server.');
  }
  if (body.email !== email) {
    console.warn('Email does not match:', { received: body.email, expected: email });
  }
  if (body.password !== password) {
    console.warn('Password does not match:', { received: body.password, expected: password });
  }

  if (
    body.email === email &&
    body.password === password
  ) {
    console.log('Manager login success, setting cookie and returning success response.');
    const res = NextResponse.json({ success: true });
    res.cookies.set("manager_auth", "1", { httpOnly: true, path: "/manager", maxAge: 60 * 60 });
    return res;
  }

  console.log('Manager login failed, returning invalid credentials response.');
  return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
}
