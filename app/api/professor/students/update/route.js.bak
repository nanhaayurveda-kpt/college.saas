import { db } from "@/lib/db";
import { students, professors } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("professor_session")?.value;
  if (!token) return NextResponse.redirect(new URL("/professor-login", request.url));

  let payload;
  try {
    const verified = await jwtVerify(token, SECRET);
    payload = verified.payload;
  } catch {
    return NextResponse.redirect(new URL("/professor-login", request.url));
  }

  const professorResult = await db
    .select()
    .from(professors)
    .where(eq(professors.id, payload.professorId));
  const professor = professorResult[0];
  if (!professor) return NextResponse.redirect(new URL("/professor-login", request.url));

  const formData = await request.formData();
  const id = parseInt(formData.get("id"));
  if (!id) return NextResponse.redirect(new URL("/professor/students", request.url), 303);

  // Scope check — student must belong to professor's college
  const studentCheck = await db
    .select()
    .from(students)
    .where(and(eq(students.id, id), eq(students.user_id, professor.user_id)));
  if (!studentCheck.length) {
    return NextResponse.redirect(new URL("/professor/students", request.url), 303);
  }

  const name = formData.get("name");
  const faculty = formData.get("faculty");
  const course = formData.get("course");
  const semester = formData.get("semester") || null;
  const roll_number = formData.get("roll_number");
  const phone = formData.get("phone");

  if (!name || !faculty || !course || !roll_number || !phone) {
    return NextResponse.redirect(
      new URL(`/professor/students/${id}/edit?error=missing`, request.url),
      303,
    );
  }

  const admission_date = formData.get("admission_date");

  await db
    .update(students)
    .set({
      name,
      faculty,
      course,
      semester,
      roll_number,
      phone,
      admission_no: formData.get("admission_no") || null,
      admission_date: admission_date ? new Date(admission_date) : undefined,
      gender: formData.get("gender") || null,
      dob: formData.get("dob") || null,
      father_name: formData.get("father_name") || null,
      mother_name: formData.get("mother_name") || null,
      guardian_name: formData.get("guardian_name") || null,
      alt_phone: formData.get("alt_phone") || null,
      religion: formData.get("religion") || null,
      caste: formData.get("caste") || null,
      address: formData.get("address") || null,
      academic_year: formData.get("academic_year") || null,
      fee_status: formData.get("fee_status") || undefined,
    })
    .where(and(eq(students.id, id), eq(students.user_id, professor.user_id)));

  return NextResponse.redirect(new URL("/professor/students?updated=1", request.url), 303);
}