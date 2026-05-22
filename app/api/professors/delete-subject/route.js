// app/api/professors/delete-subject/route.js
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

  // Fetch subject row to verify ownership via professor
  const subjectResult = await db
    .select()
    .from(schema.professor_subjects)
    .where(eq(schema.professor_subjects.id, id));
  const subjectRow = subjectResult[0];
  if (!subjectRow) {
    return NextResponse.redirect(new URL("/professors", request.url), { status: 303 });
  }

  const professor_id = subjectRow.professor_id;
  const professorOwner = await db
    .select()
    .from(schema.professors)
    .where(
      and(
        eq(schema.professors.id, professor_id),
        eq(schema.professors.user_id, 1),
      ),
    );
  if (!professorOwner.length) {
    return NextResponse.redirect(new URL("/professors", request.url), { status: 303 });
  }

  await db
    .delete(schema.professor_subjects)
    .where(eq(schema.professor_subjects.id, id));

  await setFlash("success", "Subject removed!");
  return NextResponse.redirect(new URL(`/professors/${professor_id}`, request.url), { status: 303 });
}