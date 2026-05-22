// app/api/professors/save-schedule/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/flash";

export async function POST(request) {
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

  const formData = await request.formData();
  const professorId = parseInt(formData.get("professor_id"), 10);
  if (isNaN(professorId)) {
    await setFlash("error", "Invalid professor");
    return NextResponse.redirect(new URL("/professors", request.url), { status: 303 });
  }

  const professorResult = await db
    .select()
    .from(schema.professors)
    .where(
      and(
        eq(schema.professors.id, professorId),
        eq(schema.professors.user_id, 1),
      ),
    );
  const professor = professorResult[0];
  if (!professor) {
    await setFlash("error", "Professor not found");
    return NextResponse.redirect(new URL("/professors", request.url), { status: 303 });
  }

  const totalPeriods = parseInt(formData.get("total_periods"), 10);
  if (isNaN(totalPeriods) || totalPeriods < 1) {
    await setFlash("error", "Invalid periods count");
    return NextResponse.redirect(
      new URL(`/professors/${professorId}/timetable`, request.url),
      { status: 303 },
    );
  }

  // Fetch period timings for this user
  const timings = await db
    .select()
    .from(schema.period_timings)
    .where(eq(schema.period_timings.user_id, 1));
  const timingMap = {};
  timings.forEach((t) => {
    timingMap[t.period_no] = { start: t.start_time, end: t.end_time };
  });

  // Delete existing periods for this professor (idempotent re-save)
  await db
    .delete(schema.timetable)
    .where(
      and(
        eq(schema.timetable.user_id, 1),
        eq(schema.timetable.professor_name, professor.name),
      ),
    );

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const getPeriodData = (day, p) => ({
    subject: formData.get(`subject_${day}_${p}`),
    course: formData.get(`course_${day}_${p}`),
    semester: formData.get(`semester_${day}_${p}`),
  });

  const buildDayRows = (sourceDay, targetDay) => {
    const rows = [];
    for (let p = 1; p <= totalPeriods; p++) {
      const { subject, course, semester } = getPeriodData(sourceDay, p);
      if (!subject || !course) continue;
      const timing = timingMap[p];
      rows.push({
        user_id: 1,
        course,
        semester: semester || null,
        day: targetDay,
        period: p,
        subject,
        professor_name: professor.name,
        start_time: timing?.start || "00:00",
        end_time: timing?.end || "00:00",
      });
    }
    return rows;
  };

  const allRows = [];
  for (const day of days) {
    const sameAsMonday = formData.get(`same_${day}`) === "1";
    const sourceDay =
      day === "Monday" ? "Monday" : sameAsMonday ? "Monday" : day;
    allRows.push(...buildDayRows(sourceDay, day));
  }

  if (allRows.length > 0) {
    await db.insert(schema.timetable).values(allRows);
  }

  await setFlash(
    "success",
    `Weekly timetable saved for ${professor.name} (${allRows.length} entries)`,
  );
  return NextResponse.redirect(
    new URL(`/professors/${professorId}`, request.url),
    { status: 303 },
  );
}