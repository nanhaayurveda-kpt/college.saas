import { db } from "@/lib/db";
import { professors } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function POST(request) {
  const formData = await request.formData();
  const pin = formData.get("pin");
  const phone = formData.get("phone");
  const email = formData.get("email");

  if (!pin || !phone || !email) {
    return NextResponse.redirect(new URL("/professor-login?error=1", request.url), { status: 303 });
  }

  const result = await db.select().from(professors).where(
    and(eq(professors.pin, pin), eq(professors.phone, phone), eq(professors.email, email))
  );
  const professor = result[0];

  if (!professor) {
    return NextResponse.redirect(new URL("/professor-login?error=1", request.url), { status: 303 });
  }

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