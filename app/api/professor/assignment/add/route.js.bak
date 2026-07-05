// app/api/professor/assignment/add/route.js

import { db } from "@/lib/db";
import { assignments, professors } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("professor_session")?.value;
  if (!token) return NextResponse.redirect(new URL("/professor-login", request.url), { status: 303 });

  let payload;
  try {
    const verified = await jwtVerify(token, SECRET);
    payload = verified.payload;
  } catch {
    return NextResponse.redirect(new URL("/professor-login", request.url), { status: 303 });
  }

  const professorResult = await db.select().from(professors).where(eq(professors.id, payload.professorId));
  const professor = professorResult[0];
  if (!professor) return NextResponse.redirect(new URL("/professor-login", request.url), { status: 303 });

  const formData = await request.formData();
  const subject_course = formData.get("subject_course");
  const title = formData.get("title");
  const description = formData.get("description") || null;
  const due_date = formData.get("due_date");

  if (!subject_course || !title || !due_date) {
    return NextResponse.redirect(new URL("/professor/assignment/add", request.url), { status: 303 });
  }

  const [subject, faculty, course, semester] = subject_course.split("||");

  await db.insert(assignments).values({
    professor_id: payload.professorId,
    faculty: faculty || "",
    course: course || "",
    semester: semester || null,
    subject,
    title,
    description,
    due_date,
    user_id: professor.user_id,
    created_at: new Date(),
  });

  return NextResponse.redirect(new URL("/professor/assignment", request.url), { status: 303 });
}