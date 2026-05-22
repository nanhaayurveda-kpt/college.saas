import { google } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function redirectWithCookie(request, path, token) {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.cookies.set("session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  const codeVerifier = cookieStore.get("code_verifier")?.value;

  // ✅ Fix 2: !state भी check करो
  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  // ✅ Fix 1: पूरा logic try/catch में
  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();

    const googleRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    const googleUser = await googleRes.json();
    if (!googleUser.email) {
      return NextResponse.redirect(
        new URL("/login?error=invalid", request.url),
      );
    }

    let existing = await db
      .select()
      .from(users)
      .where(eq(users.email, googleUser.email));
    let user;

    if (existing.length === 0) {
      // नया user — trial पर insert करो
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);

      await db.insert(users).values({
        email: googleUser.email,
        name: googleUser.name || "",
        status: "trial",
        expiry_date: expiry.toISOString(),
        reminder_sent: 0,
      });

      existing = await db
        .select()
        .from(users)
        .where(eq(users.email, googleUser.email));
    }

    user = existing[0];

    const token = await createSession(
      user.id,
      user.email,
      user.name,
      user.status,
      user.expiry_date,
    );

    if (user.email === process.env.DEVELOPER_EMAIL) {
      return redirectWithCookie(request, "/dashboard", token);
    }
    if (user.status === "active") {
      return redirectWithCookie(request, "/dashboard", token);
    }

    const now = new Date();
    const expiryDate = user.expiry_date ? new Date(user.expiry_date) : null;

    if (user.status === "trial" && expiryDate && now < expiryDate) {
      return redirectWithCookie(request, "/dashboard", token);
    }

    return redirectWithCookie(request, "/expired", token);
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/login?error=failed", request.url));
  }
}
