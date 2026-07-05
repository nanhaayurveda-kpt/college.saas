import { db } from "@/lib/db";
import {
  students,
  professors,
  fees,
  attendance,
  results,
  certificates,
} from "@/lib/schema";
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

  const studentCheck = await db
    .select()
    .from(students)
    .where(and(eq(students.id, id), eq(students.user_id, professor.user_id)));
  if (!studentCheck.length) {
    return NextResponse.redirect(new URL("/professor/students", request.url), 303);
  }

  const feeRows = await db.select().from(fees).where(eq(fees.student_id, id));
  if (feeRows.length) {
    return NextResponse.redirect(
      new URL("/professor/students?error=has_fees", request.url),
      303,
    );
  }

  const attRows = await db
    .select()
    .from(attendance)
    .where(eq(attendance.student_id, id));
  if (attRows.length) {
    return NextResponse.redirect(
      new URL("/professor/students?error=has_attendance", request.url),
      303,
    );
  }

  const resultRows = await db
    .select()
    .from(results)
    .where(eq(results.student_id, id));
  if (resultRows.length) {
    return NextResponse.redirect(
      new URL("/professor/students?error=has_results", request.url),
      303,
    );
  }

  const certRows = await db
    .select()
    .from(certificates)
    .where(eq(certificates.student_id, id));
  if (certRows.length) {
    return NextResponse.redirect(
      new URL("/professor/students?error=has_certificates", request.url),
      303,
    );
  }

  await db.delete(students).where(eq(students.id, id));

  return NextResponse.redirect(new URL("/professor/students?deleted=1", request.url), 303);
}