// app/api/professor-attendance/save/route.js

import { db } from "@/lib/db";
import { professors, professor_attendance, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));
  const session = await getSession(token);
  if (!session) return NextResponse.redirect(new URL("/login", request.url));

  const userResult = await db.select().from(users).where(eq(users.email, session.email));
  const user = userResult[0];
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const formData = await request.formData();
  const date = formData.get("date");

  if (!date) return NextResponse.redirect(new URL("/professor-attendance", request.url));

  const allProfessors = await db.select().from(professors).where(eq(professors.user_id, 1));

  for (const p of allProfessors) {
    const status = formData.get(`status_${p.id}`) || "present";
    const note = formData.get(`note_${p.id}`) || null;

    const existing = await db
      .select()
      .from(professor_attendance)
      .where(
        and(
          eq(professor_attendance.professor_id, p.id),
          eq(professor_attendance.date, date)
        )
      );

    if (existing.length > 0) {
      await db
        .update(professor_attendance)
        .set({ status, note })
        .where(
          and(
            eq(professor_attendance.professor_id, p.id),
            eq(professor_attendance.date, date)
          )
        );
    } else {
      await db.insert(professor_attendance).values({
        professor_id: p.id,
        date,
        status,
        note,
        user_id: 1,
        created_at: new Date(),
      });
    }
  }

  return NextResponse.redirect(new URL(`/professor-attendance?date=${date}`, request.url));
}