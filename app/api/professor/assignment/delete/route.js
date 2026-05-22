import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assignments } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("professor_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/professor-login", request.url), 303);
  }

  let payload;
  try {
    const verified = await jwtVerify(token, SECRET);
    payload = verified.payload;
  } catch {
    return NextResponse.redirect(new URL("/professor-login", request.url), 303);
  }

  const formData = await request.formData();
  const assignmentId = parseInt(formData.get("assignment_id"));
  if (!assignmentId) {
    return NextResponse.redirect(new URL("/professor/assignment", request.url), 303);
  }

  await db
    .delete(assignments)
    .where(
      and(
        eq(assignments.id, assignmentId),
        eq(assignments.professor_id, payload.professorId),
      ),
    );

  return NextResponse.redirect(new URL("/professor/assignment", request.url), 303);
}