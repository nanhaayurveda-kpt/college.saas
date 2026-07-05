// app/api/certificates/issue/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and, like } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/flash";

const SERIAL_PREFIX = {
  tc: "TC",
  character: "CC",
  bonafide: "BC",
  migration: "MC",
};

export async function POST(request) {
  // ─── Auth ──────────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }
  const session = await getSession(token);
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const userResult = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, session.email));
  const user = userResult[0];
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  // ─── Parse form ────────────────────────────────────────────────────────
  const formData = await request.formData();
  const studentIdRaw = formData.get("student_id");
  const student_id = parseInt(studentIdRaw, 10);
  const cert_type = formData.get("cert_type");
  const issue_date = formData.get("issue_date");
  const reason = formData.get("reason") || null;
  const last_course = formData.get("last_course") || null;
  const last_exam_passed = formData.get("last_exam_passed") || null;
  const conduct = formData.get("conduct") || "Good";
  const custom_content = formData.get("custom_content") || null;

  if (isNaN(student_id)) {
    await setFlash("error", "Invalid student");
    return NextResponse.redirect(new URL("/certificates", request.url), { status: 303 });
  }

  if (!cert_type || !issue_date) {
    await setFlash("error", "Certificate type and issue date are required");
    return NextResponse.redirect(new URL("/certificates", request.url), { status: 303 });
  }

  // ─── Ownership check ───────────────────────────────────────────────────
  const studentCheck = await db
    .select()
    .from(schema.students)
    .where(
      and(
        eq(schema.students.id, student_id),
      ),
    );
  if (!studentCheck.length) {
    return NextResponse.redirect(new URL("/students", request.url), { status: 303 });
  }

  // ─── Duplicate check: same student + cert_type + issue_date ────────────
  // Prevents accidental re-issue of the same certificate on the same day
  const conditions = [
    eq(schema.certificates.student_id, student_id),
    eq(schema.certificates.cert_type, cert_type),
    eq(schema.certificates.issue_date, issue_date),
  ];
  const existing = await db
    .select()
    .from(schema.certificates)
    .where(and(...conditions));
  if (existing.length > 0) {
    await setFlash(
      "error",
      `A ${cert_type} certificate was already issued to ${studentCheck[0].name} on ${issue_date}.`,
    );
    return NextResponse.redirect(new URL("/certificates", request.url), { status: 303 });
  }

  // ─── Auto serial: TC/2026/001 — type+year के हिसाब से अगला नंबर ─────────
  const prefix = SERIAL_PREFIX[cert_type] || "CERT";
  const year = String(issue_date).slice(0, 4);
  const serialBase = `${prefix}/${year}/`;

  const existingSerials = await db
    .select({ serial_no: schema.certificates.serial_no })
    .from(schema.certificates)
    .where(
      and(
        like(schema.certificates.serial_no, `${serialBase}%`),
      ),
    );

  let maxNum = 0;
  existingSerials.forEach((row) => {
    const num = parseInt(String(row.serial_no).slice(serialBase.length), 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  });
  const serial_no = `${serialBase}${String(maxNum + 1).padStart(3, "0")}`;

  // ─── Insert ────────────────────────────────────────────────────────────
  await db.insert(schema.certificates).values({
    student_id,
    cert_type,
    issue_date,
    serial_no,
    reason,
    last_course,
    last_exam_passed,
    conduct,
    custom_content,
  });

  await setFlash("success", `Certificate issued! Serial No: ${serial_no}`);
  return NextResponse.redirect(new URL("/certificates", request.url), { status: 303 });
}