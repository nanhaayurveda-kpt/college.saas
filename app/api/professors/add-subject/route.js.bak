// app/api/professors/add-subject/route.js
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
  const professorIdRaw = formData.get("professor_id");
  const professor_id = parseInt(professorIdRaw, 10);
  const subject = formData.get("subject");
  const course = formData.get("course");
  const semester = formData.get("semester") || null;

  if (isNaN(professor_id)) {
    await setFlash("error", "Invalid professor");
    return NextResponse.redirect(new URL("/professors", request.url), { status: 303 });
  }
  if (!subject || !course) {
    await setFlash("error", "Subject and course are required");
    return NextResponse.redirect(new URL(`/professors/${professor_id}`, request.url), { status: 303 });
  }

  // ─── Ownership check ───────────────────────────────────────────────────
  const professorCheck = await db
    .select()
    .from(schema.professors)
    .where(
      and(
        eq(schema.professors.id, professor_id),
        eq(schema.professors.user_id, 1),
      ),
    );
  if (!professorCheck.length) {
    return NextResponse.redirect(new URL("/professors", request.url), { status: 303 });
  }

  // ─── Duplicate check: same professor + subject + course + semester ─────
  const conditions = [
    eq(schema.professor_subjects.user_id, 1),
    eq(schema.professor_subjects.professor_id, professor_id),
    eq(schema.professor_subjects.subject, subject),
    eq(schema.professor_subjects.course, course),
  ];
  if (semester) {
    conditions.push(eq(schema.professor_subjects.semester, semester));
  }
  const existing = await db
    .select()
    .from(schema.professor_subjects)
    .where(and(...conditions));
  if (existing.length > 0) {
    await setFlash(
      "error",
      `${subject} is already assigned for ${course}${semester ? ` ${semester}` : ""}.`,
    );
    return NextResponse.redirect(new URL(`/professors/${professor_id}`, request.url), { status: 303 });
  }

  // ─── Insert ────────────────────────────────────────────────────────────
  await db.insert(schema.professor_subjects).values({
    professor_id,
    subject,
    course,
    semester,
    user_id: 1,
  });

  await setFlash("success", "Subject assigned successfully!");
  return NextResponse.redirect(new URL(`/professors/${professor_id}`, request.url), { status: 303 });
}