import { db } from "@/lib/db";
import { students, professors } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { setFlash } from "@/lib/flash";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("professor_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/professor-login", request.url), { status: 303 });
  }

  let payload;
  try {
    const verified = await jwtVerify(token, SECRET);
    payload = verified.payload;
  } catch {
    return NextResponse.redirect(new URL("/professor-login", request.url), { status: 303 });
  }

  const professorResult = await db
    .select()
    .from(professors)
    .where(eq(professors.id, payload.professorId));
  const professor = professorResult[0];
  if (!professor) {
    return NextResponse.redirect(new URL("/professor-login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const name = formData.get("name");
  const faculty = formData.get("faculty");
  const course = formData.get("course");
  const semester = formData.get("semester") || null;
  const roll_number = formData.get("roll_number");
  const phone = formData.get("phone");
  const admission_no = formData.get("admission_no") || null;

  if (!name || !faculty || !course || !roll_number || !phone) {
    await setFlash("error", "Name, faculty, course, roll number and phone are required");
    return NextResponse.redirect(
      new URL("/professor/students/add", request.url),
      { status: 303 },
    );
  }

  // ─── Duplicate check 1: same faculty + course + semester + roll_number ──
  const rollConflict = await db
    .select()
    .from(students)
    .where(
      and(
        eq(students.user_id, professor.user_id),
        eq(students.faculty, faculty),
        eq(students.course, course),
        eq(students.semester, semester || ""),
        eq(students.roll_number, roll_number),
      ),
    );
  if (rollConflict.length > 0) {
    await setFlash(
      "error",
      `Roll No. ${roll_number} already exists in ${course} ${semester || ""} (${rollConflict[0].name})`,
    );
    return NextResponse.redirect(
      new URL("/professor/students/add", request.url),
      { status: 303 },
    );
  }

  // ─── Duplicate check 2: same admission_no ──────────────────────────────
  if (admission_no) {
    const admConflict = await db
      .select()
      .from(students)
      .where(
        and(
          eq(students.user_id, professor.user_id),
          eq(students.admission_no, admission_no),
        ),
      );
    if (admConflict.length > 0) {
      await setFlash(
        "error",
        `Admission No. ${admission_no} already exists (${admConflict[0].name} — ${admConflict[0].course} ${admConflict[0].semester || ""})`,
      );
      return NextResponse.redirect(
        new URL("/professor/students/add", request.url),
        { status: 303 },
      );
    }
  }

  const admission_date = formData.get("admission_date");

  // ─── Insert ────────────────────────────────────────────────────────────
  await db.insert(students).values({
    name,
    faculty,
    course,
    semester,
    roll_number,
    phone,
    admission_no,
    admission_date: admission_date ? new Date(admission_date) : new Date(),
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
    fee_status: formData.get("fee_status") || "pending",
    user_id: professor.user_id,
  });

  await setFlash("success", "Student added successfully!");
  return NextResponse.redirect(
    new URL("/professor/students", request.url),
    { status: 303 },
  );
}