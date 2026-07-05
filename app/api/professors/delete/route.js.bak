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
  const id = parseInt(formData.get("id"), 10);
  if (isNaN(id)) {
    return NextResponse.redirect(new URL("/professors", request.url), { status: 303 });
  }

  const professorCheck = await db
    .select()
    .from(schema.professors)
    .where(and(eq(schema.professors.id, id), eq(schema.professors.user_id, 1)));
  if (!professorCheck.length) {
    return NextResponse.redirect(new URL("/professors", request.url), { status: 303 });
  }

  await db.delete(schema.professor_subjects).where(eq(schema.professor_subjects.professor_id, id));
  await db.delete(schema.professor_attendance).where(eq(schema.professor_attendance.professor_id, id));
  await db.delete(schema.assignments).where(eq(schema.assignments.professor_id, id));
  await db.delete(schema.professors).where(eq(schema.professors.id, id));

  await setFlash("success", "Professor deleted successfully!");
  return NextResponse.redirect(new URL("/professors", request.url), { status: 303 });
}