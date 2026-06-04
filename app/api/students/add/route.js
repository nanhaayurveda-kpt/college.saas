import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/flash";
import { MASTER_USER_ID } from "@/lib/config";
import { z } from "zod";

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  faculty: z.string().min(1, "Faculty is required"),
  course: z.string().min(1, "Course is required"),
  semester: z.string().optional(),
  section: z.string().optional(),
  roll_number: z.string().optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  guardian_name: z.string().optional(),
  phone: z.string().optional(),
  alt_phone: z.string().optional(),
  scholar_no: z.string().optional(),
  enrolment_no: z.string().optional(),
  admission_date: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
  address: z.string().optional(),
  religion: z.string().optional(),
  caste: z.string().optional(),
  aadhaar: z.string().optional(),
  pen: z.string().optional(),
  photo_url: z.string().optional(),
  academic_year: z.string().optional(),
  admission_no: z.string().min(1, "Admission No is required"),
});

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token)
    return NextResponse.redirect(new URL("/login", request.url), {
      status: 303,
    });

  const session = await getSession(token);
  if (!session)
    return NextResponse.redirect(new URL("/login", request.url), {
      status: 303,
    });

  const userResult = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, session.email));
  const user = userResult[0];
  if (!user)
    return NextResponse.redirect(new URL("/login", request.url), {
      status: 303,
    });

  const formData = await request.formData();

  const raw = {
    name: formData.get("name"),
    faculty: formData.get("faculty"),
    course: formData.get("course"),
    semester: formData.get("semester") || undefined,
    section: formData.get("section") || undefined,
    roll_number: formData.get("roll_number") || undefined,
    father_name: formData.get("father_name") || undefined,
    mother_name: formData.get("mother_name") || undefined,
    guardian_name: formData.get("guardian_name") || undefined,
    phone: formData.get("phone") || undefined,
    alt_phone: formData.get("alt_phone") || undefined,
    scholar_no: formData.get("scholar_no") || undefined,
    enrolment_no: formData.get("enrolment_no") || undefined,
    admission_date: formData.get("admission_date") || undefined,
    gender: formData.get("gender") || undefined,
    dob: formData.get("dob") || undefined,
    address: formData.get("address") || undefined,
    religion: formData.get("religion") || undefined,
    caste: formData.get("caste") || undefined,
    aadhaar: formData.get("aadhaar") || undefined,
    pen: formData.get("pen") || undefined,
    photo_url: formData.get("photo_url") || undefined,
    academic_year: formData.get("academic_year") || undefined,
    admission_no: formData.get("admission_no") || undefined,
  };

  const parsed = studentSchema.safeParse(raw);
  if (!parsed.success) {
    await setFlash(
      "error",
      "Invalid data: " + JSON.stringify(parsed.error.flatten().fieldErrors),
    );
    return NextResponse.redirect(new URL("/students/add", request.url), {
      status: 303,
    });
  }

  const data = parsed.data;

  if (data.roll_number) {
    const existingRoll = await db
      .select()
      .from(schema.students)
      .where(
        and(
          eq(schema.students.user_id, MASTER_USER_ID),
          eq(schema.students.faculty, data.faculty),
          eq(schema.students.course, data.course),
          eq(schema.students.semester, data.semester || ""),
          eq(schema.students.roll_number, data.roll_number),
        ),
      );
    if (existingRoll.length > 0) {
      await setFlash(
        "error",
        `Roll No. ${data.roll_number} already exists in ${data.course} ${data.semester || ""} (${existingRoll[0].name})`,
      );
      return NextResponse.redirect(new URL("/students/add", request.url), {
        status: 303,
      });
    }
  }
  if (data.admission_no) {
    const existingAdm = await db
      .select()
      .from(schema.students)
      .where(
        and(
          eq(schema.students.user_id, MASTER_USER_ID),
          eq(schema.students.admission_no, data.admission_no),
        ),
      );
    if (existingAdm.length > 0) {
      await setFlash(
        "error",
        `Admission No. ${data.admission_no} already exists (${existingAdm[0].name})`,
      );
      return NextResponse.redirect(new URL("/students/add", request.url), {
        status: 303,
      });
    }
  }

  if (data.scholar_no) {
    const existingScholar = await db
      .select()
      .from(schema.students)
      .where(
        and(
          eq(schema.students.user_id, MASTER_USER_ID),
          eq(schema.students.scholar_no, data.scholar_no),
        ),
      );
    if (existingScholar.length > 0) {
      await setFlash(
        "error",
        `Scholar No. ${data.scholar_no} already exists (${existingScholar[0].name} — ${existingScholar[0].course})`,
      );
      return NextResponse.redirect(new URL("/students/add", request.url), {
        status: 303,
      });
    }
  }

  await db.insert(schema.students).values({
    ...data,
    admission_date: data.admission_date
      ? new Date(data.admission_date)
      : new Date(),
    fee_status: "pending",
    user_id: MASTER_USER_ID,
  });

  await setFlash("success", "Student added successfully!");
  return NextResponse.redirect(new URL("/students", request.url), {
    status: 303,
  });
}
