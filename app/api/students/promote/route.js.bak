// app/api/students/promote/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and, inArray } from "drizzle-orm";
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
  const from_semester = formData.get("from_semester");
  const to_semester = formData.get("to_semester");
  const new_academic_year = formData.get("new_academic_year");
  const student_ids = formData
    .getAll("student_ids")
    .map((v) => parseInt(v, 10))
    .filter((n) => !isNaN(n));

  if (!from_semester || !to_semester || !new_academic_year) {
    await setFlash("error", "All fields are required.");
    return NextResponse.redirect(new URL("/promote", request.url), { status: 303 });
  }

  if (from_semester === to_semester) {
    await setFlash("error", "From and To semester cannot be the same.");
    return NextResponse.redirect(new URL("/promote", request.url), { status: 303 });
  }

  if (student_ids.length === 0) {
    await setFlash("error", "Select at least one student to promote.");
    return NextResponse.redirect(new URL("/promote", request.url), { status: 303 });
  }

  // ─── Verify: चुने students उसी semester + इसी college के हों ──────────────
  const toPromote = await db
    .select({ id: schema.students.id })
    .from(schema.students)
    .where(
      and(
        inArray(schema.students.id, student_ids),
        eq(schema.students.semester, from_semester),
        eq(schema.students.user_id, 1),
      ),
    );

  if (toPromote.length === 0) {
    await setFlash("error", `No valid students in Semester ${from_semester} to promote.`);
    return NextResponse.redirect(new URL("/promote", request.url), { status: 303 });
  }

  // ─── Promote (सिर्फ चुने हुए) ─────────────────────────────────────────────
  await db
    .update(schema.students)
    .set({
      semester: to_semester,
      academic_year: new_academic_year,
      fee_status: "pending",
    })
    .where(
      and(
        inArray(schema.students.id, toPromote.map((s) => s.id)),
        eq(schema.students.user_id, 1),
      ),
    );

  await setFlash(
    "success",
    `${toPromote.length} students promoted: Semester ${from_semester} → Semester ${to_semester} (${new_academic_year})`,
  );
  return NextResponse.redirect(new URL("/promote", request.url), { status: 303 });
}