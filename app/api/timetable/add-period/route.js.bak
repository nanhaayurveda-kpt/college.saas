// app/api/timetable/add-period/route.js
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
  const course = formData.get("course");
  const semester = formData.get("semester") || null;
  const day = formData.get("day");
  const period = parseInt(formData.get("period"), 10);
  const subject = formData.get("subject");
  const professor_name = formData.get("professor_name");
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");

  if (!course || !day || isNaN(period) || !subject) {
    await setFlash("error", "Course, day, period and subject are required");
    return NextResponse.redirect(new URL("/timetable/add", request.url), { status: 303 });
  }

  // Duplicate check: same course + semester + day + period already taken?
  const existing = await db
    .select()
    .from(schema.timetable)
    .where(
      and(
        eq(schema.timetable.user_id, 1),
        eq(schema.timetable.course, course),
        eq(schema.timetable.semester, semester || ""),
        eq(schema.timetable.day, day),
        eq(schema.timetable.period, period),
      ),
    );
  if (existing.length > 0) {
    await setFlash(
      "error",
      `${course} ${semester || ""} already has a period ${period} on ${day} (${existing[0].subject}). Delete it first to replace.`,
    );
    return NextResponse.redirect(new URL(`/timetable?course=${course}`, request.url), { status: 303 });
  }

  await db.insert(schema.timetable).values({
    course,
    semester,
    day,
    period,
    subject,
    professor_name: professor_name || null,
    start_time: start_time || "00:00",
    end_time: end_time || "00:00",
    user_id: 1,
  });

  await setFlash("success", "Period added successfully!");
  return NextResponse.redirect(new URL(`/timetable?course=${course}`, request.url), { status: 303 });
}