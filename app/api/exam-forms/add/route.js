// app/api/exam-forms/add/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/flash";

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
  const student_id = parseInt(formData.get("student_id"), 10);
  const academic_year = formData.get("academic_year");
  const semester = formData.get("semester");
  const exam_fee_paid = formData.get("exam_fee_paid") === "1" ? 1 : 0;

  if (isNaN(student_id) || !academic_year || !semester) {
    await setFlash("error", "Student, academic year and semester are required");
    return NextResponse.redirect(new URL("/exam-forms", request.url), { status: 303 });
  }

  // ─── Ownership check: student belongs to this user ─────────────────────
  const studentCheck = await db
    .select()
    .from(schema.students)
    .where(
      and(
        eq(schema.students.id, student_id),
        eq(schema.students.user_id, 1),
      ),
    );
  if (!studentCheck.length) {
    return NextResponse.redirect(new URL("/exam-forms", request.url), { status: 303 });
  }

  // ─── Duplicate check: same student + academic_year + semester ──────────
  const existing = await db
    .select()
    .from(schema.exam_forms)
    .where(
      and(
        eq(schema.exam_forms.user_id, 1),
        eq(schema.exam_forms.student_id, student_id),
        eq(schema.exam_forms.academic_year, academic_year),
        eq(schema.exam_forms.semester, semester),
      ),
    );
  if (existing.length > 0) {
    await setFlash(
      "error",
      `An exam form for this student (${academic_year}, ${semester}) already exists.`,
    );
    return NextResponse.redirect(new URL("/exam-forms", request.url), { status: 303 });
  }

  // ─── Insert ────────────────────────────────────────────────────────────
  await db.insert(schema.exam_forms).values({
    student_id,
    academic_year,
    semester,
    exam_fee_paid,
    form_status: exam_fee_paid ? "approved" : "pending",
    submitted_date: new Date().toISOString().split("T")[0],
    user_id: 1,
  });

  await setFlash("success", "Exam form submitted!");
  return NextResponse.redirect(new URL("/exam-forms", request.url), { status: 303 });
}