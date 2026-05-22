// app/api/students/update/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and, ne } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/flash";

export async function POST(request) {
  // ─── Auth ──────────────────────────────────────────────────────────────
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

  // ─── Parse form ────────────────────────────────────────────────────────
  const formData = await request.formData();
  const idRaw = formData.get("id");
  const id = parseInt(idRaw, 10);
  if (isNaN(id)) {
    await setFlash("error", "Invalid student id");
    return NextResponse.redirect(new URL("/students", request.url), { status: 303 });
  }

  // ─── Ownership check ───────────────────────────────────────────────────
  const studentCheck = await db
    .select()
    .from(schema.students)
    .where(
      and(
        eq(schema.students.id, id),
        eq(schema.students.user_id, 1),
      ),
    );
  if (!studentCheck.length) {
    return NextResponse.redirect(new URL("/students", request.url), { status: 303 });
  }

  // ─── Extract fields ────────────────────────────────────────────────────
  const newName = formData.get("name");
  const newFaculty = formData.get("faculty");
  const newCourse = formData.get("course");
  const newSemester = formData.get("semester") || null;
  const newRoll = formData.get("roll_number");
  const newAdmission = formData.get("admission_no") || null;
  const password = formData.get("password");

  // ─── Duplicate check 1: roll_number conflict (in target faculty+course+semester) ─
  if (newRoll) {
    const rollConflict = await db
      .select()
      .from(schema.students)
      .where(
        and(
          eq(schema.students.user_id, 1),
          eq(schema.students.faculty, newFaculty),
          eq(schema.students.course, newCourse),
          eq(schema.students.semester, newSemester || ""),
          eq(schema.students.roll_number, newRoll),
          ne(schema.students.id, id),
        ),
      );
    if (rollConflict.length > 0) {
      await setFlash(
        "error",
        `Roll No. ${newRoll} already exists in ${newCourse} ${newSemester || ""} (${rollConflict[0].name})`,
      );
      return NextResponse.redirect(new URL(`/students/${id}/edit`, request.url), { status: 303 });
    }
  }

  // ─── Duplicate check 2: admission_no conflict ──────────────────────────
  if (newAdmission) {
    const admConflict = await db
      .select()
      .from(schema.students)
      .where(
        and(
          eq(schema.students.user_id, 1),
          eq(schema.students.admission_no, newAdmission),
          ne(schema.students.id, id),
        ),
      );
    if (admConflict.length > 0) {
      await setFlash(
        "error",
        `Admission No. ${newAdmission} already exists (${admConflict[0].name} — ${admConflict[0].course} ${admConflict[0].semester || ""})`,
      );
      return NextResponse.redirect(new URL(`/students/${id}/edit`, request.url), { status: 303 });
    }
  }

  // ─── Build update data ─────────────────────────────────────────────────
  const updateData = {
    name: newName,
    faculty: newFaculty,
    course: newCourse,
    semester: newSemester,
    roll_number: newRoll,
    father_name: formData.get("father_name") || undefined,
    mother_name: formData.get("mother_name") || null,
    guardian_name: formData.get("guardian_name") || null,
    phone: formData.get("phone") || undefined,
    alt_phone: formData.get("alt_phone") || null,
    fee_status: formData.get("fee_status"),
    admission_no: newAdmission,
    gender: formData.get("gender") || null,
    dob: formData.get("dob") || null,
    address: formData.get("address") || null,
    religion: formData.get("religion") || null,
    caste: formData.get("caste") || null,
    aadhaar: formData.get("aadhaar") || null,
    academic_year: formData.get("academic_year") || null,
    pen: formData.get("pen") || null,
    photo_url: formData.get("photo_url") || null,
    admission_date: formData.get("admission_date")
      ? new Date(formData.get("admission_date"))
      : undefined,
  };

  if (password && password.trim() !== "") {
    updateData.password = password.trim();
  }

  // ─── Update ────────────────────────────────────────────────────────────
  await db
    .update(schema.students)
    .set(updateData)
    .where(
      and(
        eq(schema.students.id, id),
        eq(schema.students.user_id, 1),
      ),
    );

  await setFlash("success", "Student updated successfully!");
  return NextResponse.redirect(new URL(`/students/${id}`, request.url), { status: 303 });
}