// app/api/attendance/save/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/flash";

export async function POST(request) {
  // ─── Auth: accept admin session OR professor session ───────────────────
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("session")?.value;
  const professorToken = cookieStore.get("professor_session")?.value;
  if (!adminToken && !professorToken) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  let userId = null;
  let isProfessor = false;

  if (adminToken) {
    const session = await getSession(adminToken);
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
    }
    const userResult = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, session.email));
    userId = userResult[0]?.id;
  } else if (professorToken) {
    const professorSession = await getSession(professorToken);
    if (!professorSession) {
      return NextResponse.redirect(new URL("/professor-login", request.url), { status: 303 });
    }
    const professorResult = await db
      .select()
      .from(schema.professors)
      .where(eq(schema.professors.id, professorSession.professorId));
    userId = professorResult[0]?.user_id;
    isProfessor = true;
  }

  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  // ─── Parse form ────────────────────────────────────────────────────────
  const formData = await request.formData();
  const date = formData.get("date");
  const studentIds = formData.getAll("student_id");
  const presentIds = formData.getAll("present");

  if (!date) {
    await setFlash("error", "Date is required");
    return NextResponse.redirect(
      new URL(isProfessor ? "/professor/attendance" : "/attendance", request.url),
      { status: 303 },
    );
  }

  // ─── Ownership pre-fetch: which student_ids actually belong to user? ──
  // This prevents marking attendance for students not in this college
  const owned = await db
    .select({ id: schema.students.id })
    .from(schema.students)
    .where(eq(schema.students.user_id, userId));
  const ownedIds = new Set(owned.map((s) => s.id));

  // ─── Pre-fetch existing attendance for this date+user ─────────────────
  // Single query instead of one per student — faster, fewer round trips
  const existingRows = await db
    .select({
      student_id: schema.attendance.student_id,
      status: schema.attendance.status,
    })
    .from(schema.attendance)
    .where(
      and(
        eq(schema.attendance.date, date),
        eq(schema.attendance.user_id, userId),
      ),
    );
  const existingByStudent = new Map(
    existingRows.map((r) => [r.student_id, r.status]),
  );

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const idRaw of studentIds) {
    const studentId = parseInt(idRaw, 10);
    if (isNaN(studentId) || !ownedIds.has(studentId)) {
      skipped++;
      continue;
    }

    const status = presentIds.includes(idRaw) ? "present" : "absent";

    if (existingByStudent.has(studentId)) {
      // Already has entry for this date — UPDATE (idempotent)
      // Skip update if status hasn't changed (small optimization)
      if (existingByStudent.get(studentId) === status) {
        continue;
      }
      await db
        .update(schema.attendance)
        .set({ status })
        .where(
          and(
            eq(schema.attendance.student_id, studentId),
            eq(schema.attendance.date, date),
            eq(schema.attendance.user_id, userId),
          ),
        );
      updated++;
    } else {
      // No existing entry — INSERT
      // DB-level unique index will also catch race-condition duplicates
      await db.insert(schema.attendance).values({
        student_id: studentId,
        date,
        status,
        user_id: userId,
      });
      inserted++;
    }
  }

  await setFlash(
    "success",
    `Attendance saved: ${inserted} new, ${updated} updated${skipped > 0 ? `, ${skipped} skipped` : ""}.`,
  );

  return NextResponse.redirect(
    new URL(isProfessor ? "/professor/attendance" : "/attendance", request.url),
    { status: 303 },
  );
}