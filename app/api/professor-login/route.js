import { db } from "@/lib/db";
import { professors } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);

// Best-effort in-memory limiter: per phone, 5 गलत कोशिशें / 10 मिनट
const failedAttempts = new Map();
const MAX_FAILS = 5;
const WINDOW_MS = 10 * 60 * 1000;

function isBlocked(phone) {
  const rec = failedAttempts.get(phone);
  if (!rec) return false;
  if (Date.now() - rec.first > WINDOW_MS) {
    failedAttempts.delete(phone);
    return false;
  }
  return rec.count >= MAX_FAILS;
}

function recordFail(phone) {
  const rec = failedAttempts.get(phone);
  if (!rec || Date.now() - rec.first > WINDOW_MS) {
    failedAttempts.set(phone, { count: 1, first: Date.now() });
  } else {
    rec.count++;
  }
}

export async function POST(request) {
  const formData = await request.formData();
  const pin = formData.get("pin");
  const phone = formData.get("phone");
  const email = formData.get("email");

  if (!pin || !phone || !email) {
    return NextResponse.redirect(new URL("/professor-login?error=1", request.url), { status: 303 });
  }

  if (isBlocked(phone)) {
    return NextResponse.redirect(new URL("/professor-login?error=blocked", request.url), { status: 303 });
  }

  const result = await db.select().from(professors).where(
    and(eq(professors.pin, pin), eq(professors.phone, phone), eq(professors.email, email))
  );
  const professor = result[0];

  if (!professor) {
    recordFail(phone);
    // गलत कोशिश को धीमा करो — brute force का खर्च हजार गुना
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.redirect(new URL("/professor-login?error=1", request.url), { status: 303 });
  }

  failedAttempts.delete(phone);

  const token = await new SignJWT({
    professorId: professor.id,
    professorName: professor.name,
    role: "professor",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("12h")
    .sign(SECRET);

  const response = NextResponse.redirect(new URL("/professor/dashboard", request.url), { status: 303 });
  response.cookies.set("professor_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  return response;
}