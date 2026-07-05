import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and, ne } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/flash";
import { MASTER_USER_ID } from "@/lib/config";

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url), { status: 303 });

  const session = await getSession(token);
  if (!session) return NextResponse.redirect(new URL("/login", request.url), { status: 303 });

  const userResult = await db.select().from(schema.users).where(eq(schema.users.email, session.email));
  const user = userResult[0];
  if (!user) return NextResponse.redirect(new URL("/login", request.url), { status: 303 });

  const formData = await request.formData();
  const idRaw = formData.get("id");
  const id = parseInt(idRaw, 10);
  if (isNaN(id)) {
    await setFlash("error", "Invalid student id");
    return NextResponse.redirect(new URL("/students", request.url), { status: 303 });
  }

  const studentCheck = await db.select().from(schema.students).where(
    and(eq(schema.students.id, id), eq(schema.students.user_id, MASTER_USER_ID)),
  );
  if (!studentCheck.length) return NextResponse.redirect(new URL("/students", request.url), { status: 303 });

  const newName = formData.get("name");
  const newFaculty = formData.get("faculty");
  const newCourse = formData.get("course");
  const newSemester = formData.get("semester") || null;
  const newSection = formData.get("section") || null;
  const newRoll = formData.get("roll_number");
  const newScholarNo = formData.get("scholar_no") || null;
  const newEnrolmentNo = formData.get("enrolment_no") || null;

  if (newRoll) {
    const rollConflict = await db.select().from(schema.students).where(
      and(
        eq(schema.students.user_id, MASTER_USER_ID),
        eq(schema.students.faculty, newFaculty),
        eq(schema.students.course, newCourse),
        eq(schema.students.semester, newSemester || ""),
        eq(schema.students.roll_number, newRoll),
        ne(schema.students.id, id),
      ),
    );
    if (rollConflict.length > 0) {
      await setFlash("error", `Roll No. ${newRoll} already exists in ${newCourse} ${newSemester || ""} (${rollConflict[0].name})`);
      return NextResponse.redirect(new URL(`/students/${id}/edit`, request.url), { status: 303 });
    }
  }

  if (newScholarNo) {
    const scholarConflict = await db.select().from(schema.students).where(
      and(
        eq(schema.students.user_id, MASTER_USER_ID),
        eq(schema.students.scholar_no, newScholarNo),
        ne(schema.students.id, id),
      ),
    );
    if (scholarConflict.length > 0) {
      await setFlash("error", `Scholar No. ${newScholarNo} already exists (${scholarConflict[0].name} — ${scholarConflict[0].course})`);
      return NextResponse.redirect(new URL(`/students/${id}/edit`, request.url), { status: 303 });
    }
  }

  const updateData = {
    name: newName,
    faculty: newFaculty,
    course: newCourse,
    semester: newSemester,
    section: newSection,
    roll_number: newRoll,
    scholar_no: newScholarNo,
    enrolment_no: newEnrolmentNo,
    father_name: formData.get("father_name") || null,
    mother_name: formData.get("mother_name") || null,
    guardian_name: formData.get("guardian_name") || null,
    phone: formData.get("phone") || null,
    alt_phone: formData.get("alt_phone") || null,
    fee_status: formData.get("fee_status"),
    gender: formData.get("gender") || null,
    dob: formData.get("dob") || null,
    address: formData.get("address") || null,
    religion: formData.get("religion") || null,
    caste: formData.get("caste") || null,
    aadhaar: formData.get("aadhaar") || null,
    academic_year: formData.get("academic_year") || null,
    pen: formData.get("pen") || null,
    photo_url: formData.get("photo_url") || null,
    admission_date: formData.get("admission_date") ? new Date(formData.get("admission_date")) : undefined,
  };

  await db.update(schema.students).set(updateData).where(
    and(eq(schema.students.id, id), eq(schema.students.user_id, MASTER_USER_ID)),
  );

  await setFlash("success", "Student updated successfully!");
  return NextResponse.redirect(new URL(`/students/${id}`, request.url), { status: 303 });
}