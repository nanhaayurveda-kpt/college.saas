import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request) {
  const { roll_number, phone } = await request.json();

  if (!roll_number || !phone) {
    return NextResponse.json({ success: false, message: "Roll number and phone required" }, { status: 400 });
  }

  const result = await db
    .select()
    .from(students)
    .where(
      and(
        eq(students.roll_number, roll_number.trim()),
        eq(students.phone, phone.trim())
      )
    );

  if (result.length === 0) {
    return NextResponse.json({ success: false, message: "Invalid roll number or phone number" }, { status: 401 });
  }

  const student = result[0];

  const response = NextResponse.json({ success: true });
  response.cookies.set("student_session", String(student.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  });

  return response;
}