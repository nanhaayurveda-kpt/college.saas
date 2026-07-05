// app/actions.js
"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/flash";
import { z } from "zod";

// ─── Auth Helper ─────────────────────────────────────────────────────────────

async function getAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/login");
  const session = await getSession(token);
  if (!session) redirect("/login");
  return session;
}

async function getAuthUser() {
  const session = await getAuth();
  const userResult = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, session.email));
  const user = userResult[0];
  if (!user) redirect("/login");
  return user;
}

// ─── Students ─────────────────────────────────────────────────────────────────

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  faculty: z.string().min(1, "Faculty is required"),
  course: z.string().min(1, "Course is required"),
  semester: z.string().optional(),
  roll_number: z.string().optional(),
  father_name: z.string().optional(),
  phone: z.string().optional(),
  admission_no: z.string().optional(),
  admission_date: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
  mother_name: z.string().optional(),
  address: z.string().optional(),
  religion: z.string().optional(),
  caste: z.string().optional(),
  aadhaar: z.string().optional(),
  pen: z.string().optional(),
  photo_url: z.string().optional(),
  academic_year: z.string().optional(),
});

export async function addStudent(formData) {
  const user = await getAuthUser();

  const raw = {
    name: formData.get("name"),
    faculty: formData.get("faculty"),
    course: formData.get("course"),
    semester: formData.get("semester") || undefined,
    roll_number: formData.get("roll_number") || undefined,
    father_name: formData.get("father_name") || undefined,
    phone: formData.get("phone") || undefined,
    admission_no: formData.get("admission_no") || undefined,
    admission_date: formData.get("admission_date") || undefined,
    gender: formData.get("gender") || undefined,
    dob: formData.get("dob") || undefined,
    mother_name: formData.get("mother_name") || undefined,
    address: formData.get("address") || undefined,
    religion: formData.get("religion") || undefined,
    caste: formData.get("caste") || undefined,
    aadhaar: formData.get("aadhaar") || undefined,
    pen: formData.get("pen") || undefined,
    photo_url: formData.get("photo_url") || undefined,
    academic_year: formData.get("academic_year") || undefined,
  };

  const parsed = studentSchema.safeParse(raw);
  if (!parsed.success) {
    await setFlash(
      "error",
      "Invalid data: " + JSON.stringify(parsed.error.flatten().fieldErrors),
    );
    redirect("/students/add");
  }

  await db.insert(schema.students).values({
    ...parsed.data,
    admission_date: parsed.data.admission_date
      ? new Date(parsed.data.admission_date)
      : new Date(),
    fee_status: "pending",
    user_id: 1,
  });

  await setFlash("success", "Student added successfully!");
  redirect("/students");
}

export async function updateStudent(formData) {
  const user = await getAuthUser();
  const id = formData.get("id");

  const studentCheck = await db
    .select()
    .from(schema.students)
    .where(
      and(eq(schema.students.id, Number(id)), eq(schema.students.user_id, 1)),
    );
  if (!studentCheck.length) redirect("/students");

  const updateData = {
    name: formData.get("name"),
    faculty: formData.get("faculty"),
    course: formData.get("course"),
    semester: formData.get("semester") || null,
    roll_number: formData.get("roll_number"),
    father_name: formData.get("father_name") || undefined,
    phone: formData.get("phone") || undefined,
    fee_status: formData.get("fee_status"),
    admission_no: formData.get("admission_no") || null,
    gender: formData.get("gender") || null,
    dob: formData.get("dob") || null,
    mother_name: formData.get("mother_name") || null,
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

  await db
    .update(schema.students)
    .set(updateData)
    .where(
      and(eq(schema.students.id, Number(id)), eq(schema.students.user_id, 1)),
    );

  await setFlash("success", "Student updated successfully!");
  redirect(`/students/${id}`);
}

export async function importStudents(formData) {
  const user = await getAuthUser();

  const csvText = formData.get("csv_data");
  if (!csvText) {
    await setFlash("error", "No data found.");
    redirect("/students/import");
  }

  const faculty = formData.get("faculty");
  const course = formData.get("course");
  const semester = formData.get("semester");

  if (!faculty || !course) {
    await setFlash("error", "Please select faculty and course.");
    redirect("/students/import");
  }

  const lines = csvText.trim().split("\n").filter(Boolean);
  const dataLines = lines[0]?.toLowerCase().includes("name")
    ? lines.slice(1)
    : lines;

  let count = 0;
  for (const line of dataLines) {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const [name, roll_number, phone] = cols;
    if (!name) continue;
    try {
      await db.insert(schema.students).values({
        name,
        faculty,
        course,
        semester: semester || null,
        roll_number: roll_number || null,
        phone: phone || null,
        fee_status: "pending",
        user_id: 1,
      });
      count++;
    } catch {
      // skip duplicate
    }
  }

  await setFlash("success", `${count} students imported!`);
  redirect("/students");
}

export async function promoteStudents(formData) {
  const user = await getAuthUser();

  const from_semester = formData.get("from_semester");
  const to_semester = formData.get("to_semester");
  const new_academic_year = formData.get("new_academic_year");

  if (!from_semester || !to_semester || !new_academic_year)
    redirect("/promote");

  await db
    .update(schema.students)
    .set({
      semester: to_semester,
      academic_year: new_academic_year,
      fee_status: "pending",
    })
    .where(
      and(
        eq(schema.students.semester, from_semester),
        eq(schema.students.user_id, 1),
      ),
    );

  await setFlash(
    "success",
    `Semester ${from_semester} → Semester ${to_semester} promoted!`,
  );
  redirect("/promote");
}

// ─── Professors ───────────────────────────────────────────────────────────────

export async function addProfessor(formData) {
  const user = await getAuthUser();

  await db.insert(schema.professors).values({
    name: formData.get("name"),
    qualification: formData.get("qualification") || null,
    designation: formData.get("designation") || "assistant",
    phone: formData.get("phone") || null,
    email: formData.get("email") || null,
    pin: formData.get("pin"),
    user_id: 1,
  });

  await setFlash("success", "Professor added successfully!");
  redirect("/professors");
}

export async function updateProfessor(formData) {
  const user = await getAuthUser();
  const id = parseInt(formData.get("id"));

  const professorCheck = await db
    .select()
    .from(schema.professors)
    .where(and(eq(schema.professors.id, id), eq(schema.professors.user_id, 1)));
  if (!professorCheck.length) redirect("/professors");

  await db
    .update(schema.professors)
    .set({
      name: formData.get("name"),
      qualification: formData.get("qualification") || null,
      designation: formData.get("designation") || "assistant",
      phone: formData.get("phone") || null,
      email: formData.get("email") || null,
    })
    .where(and(eq(schema.professors.id, id), eq(schema.professors.user_id, 1)));

  await setFlash("success", "Professor updated successfully!");
  redirect(`/professors/${id}`);
}

export async function deleteProfessor(formData) {
  const user = await getAuthUser();
  const id = parseInt(formData.get("id"));

  const professorCheck = await db
    .select()
    .from(schema.professors)
    .where(and(eq(schema.professors.id, id), eq(schema.professors.user_id, 1)));
  if (!professorCheck.length) redirect("/professors");

  await db
    .delete(schema.professor_subjects)
    .where(eq(schema.professor_subjects.professor_id, id));
  await db.delete(schema.professors).where(eq(schema.professors.id, id));

  await setFlash("success", "Professor deleted successfully!");
  redirect("/professors");
}

export async function addProfessorSubject(formData) {
  const user = await getAuthUser();

  const professor_id = parseInt(formData.get("professor_id"));
  const subject = formData.get("subject");
  const course = formData.get("course");
  const semester = formData.get("semester") || null;

  if (!professor_id || !subject || !course)
    redirect(`/professors/${professor_id}`);

  await db.insert(schema.professor_subjects).values({
    professor_id,
    subject,
    course,
    semester,
    user_id: 1,
  });

  await setFlash("success", "Subject assigned successfully!");
  redirect(`/professors/${professor_id}`);
}

export async function deleteProfessorSubject(formData) {
  const user = await getAuthUser();
  const id = parseInt(formData.get("id"));

  const result = await db
    .select()
    .from(schema.professor_subjects)
    .where(eq(schema.professor_subjects.id, id));
  const professor_id = result[0]?.professor_id;

  const professorCheck = await db
    .select()
    .from(schema.professors)
    .where(
      and(
        eq(schema.professors.id, professor_id),
        eq(schema.professors.user_id, 1),
      ),
    );
  if (!professorCheck.length) redirect(`/professors/${professor_id}`);

  await db
    .delete(schema.professor_subjects)
    .where(eq(schema.professor_subjects.id, id));

  await setFlash("success", "Subject removed!");
  redirect(`/professors/${professor_id}`);
}

// ─── Fees ─────────────────────────────────────────────────────────────────────

const paymentSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  amount: z.string().min(1, "Amount is required"),
  due_date: z.string().min(1, "Due date is required"),
  fee_type: z.string().optional(),
  academic_year: z.string().optional(),
  month: z.string().optional(),
  receipt_no: z.string().optional(),
  paid_date: z.string().optional(),
});

export async function addPayment(formData) {
  const user = await getAuthUser();

  const raw = {
    student_id: formData.get("student_id"),
    amount: formData.get("amount"),
    due_date: formData.get("due_date"),
    fee_type: formData.get("fee_type") || undefined,
    academic_year: formData.get("academic_year") || undefined,
    month: formData.get("month") || undefined,
    receipt_no: formData.get("receipt_no") || undefined,
    paid_date: formData.get("paid_date") || undefined,
  };

  const parsed = paymentSchema.safeParse(raw);
  if (!parsed.success) {
    await setFlash(
      "error",
      "Invalid data: " + JSON.stringify(parsed.error.flatten().fieldErrors),
    );
    redirect("/fees/add");
  }

  const paidDate = parsed.data.paid_date || null;
  const net_amount =
    parseInt(formData.get("net_amount")) || parseFloat(parsed.data.amount);

  await db.insert(schema.fees).values({
    student_id: parseInt(parsed.data.student_id),
    amount: net_amount,
    due_date: new Date(parsed.data.due_date),
    paid_date: paidDate ? new Date(paidDate) : null,
    status: paidDate ? "paid" : "pending",
    paid_amount: paidDate ? parseFloat(parsed.data.amount) : 0,
    fee_type: parsed.data.fee_type || "monthly",
    academic_year: parsed.data.academic_year || null,
    month: parsed.data.month || null,
    receipt_no: parsed.data.receipt_no || null,
    user_id: 1,
  });

  await setFlash("success", "Fee record saved successfully!");
  redirect("/fees");
}

export async function markFeePaid(formData) {
  const user = await getAuthUser();
  const fee_id = parseInt(formData.get("fee_id"));
  const paid_date = formData.get("paid_date");
  const receipt_no = formData.get("receipt_no") || null;
  const paid_amount = parseInt(formData.get("paid_amount"));

  const feeResult = await db
    .select()
    .from(schema.fees)
    .where(and(eq(schema.fees.id, fee_id), eq(schema.fees.user_id, 1)));
  const fee = feeResult[0];
  if (!fee) redirect("/fees");

  const newPaidAmount = (fee.paid_amount || 0) + paid_amount;
  const newStatus = newPaidAmount >= fee.amount ? "paid" : "partial";

  await db
    .update(schema.fees)
    .set({
      status: newStatus,
      paid_date: newStatus === "paid" ? new Date(paid_date) : null,
      receipt_no: newStatus === "paid" ? receipt_no : null,
      paid_amount: newPaidAmount,
    })
    .where(and(eq(schema.fees.id, fee_id), eq(schema.fees.user_id, 1)));

  await setFlash("success", "Fee marked as paid!");
  redirect(`/fees/${fee_id}/receipt`);
}

export async function addConcession(formData) {
  const user = await getAuthUser();
  const student_id = parseInt(formData.get("student_id"));
  const reason = formData.get("reason") || null;
  const discount_type = formData.get("discount_type");
  const discount_value = parseInt(formData.get("discount_value"));

  if (!student_id || !discount_value) redirect(`/students/${student_id}`);

  await db.insert(schema.fee_concessions).values({
    student_id,
    reason,
    discount_type,
    discount_value,
    user_id: 1,
    created_at: new Date(),
  });

  await setFlash("success", "Concession added!");
  redirect(`/students/${student_id}`);
}

export async function deleteConcession(formData) {
  const user = await getAuthUser();
  const id = parseInt(formData.get("id"));
  const student_id = parseInt(formData.get("student_id"));

  await db
    .delete(schema.fee_concessions)
    .where(
      and(
        eq(schema.fee_concessions.id, id),
        eq(schema.fee_concessions.user_id, 1),
      ),
    );

  await setFlash("success", "Concession removed!");
  redirect(`/students/${student_id}`);
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export async function saveAttendance(formData) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("session")?.value;
  const professorToken = cookieStore.get("professor_session")?.value;
  if (!adminToken && !professorToken) redirect("/login");

  let userId = null;
  if (adminToken) {
    const session = await getSession(adminToken);
    if (!session) redirect("/login");
    const userResult = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, session.email));
    userId = userResult[0]?.id;
  } else if (professorToken) {
    const professorSession = await getSession(professorToken);
    if (!professorSession) redirect("/professor-login");
    const professorResult = await db
      .select()
      .from(schema.professors)
      .where(eq(schema.professors.id, professorSession.professorId));
    userId = professorResult[0]?.user_id;
  }

  if (!userId) redirect("/login");

  const date = formData.get("date");
  const studentIds = formData.getAll("student_id");
  const presentIds = formData.getAll("present");

  for (const id of studentIds) {
    const status = presentIds.includes(id) ? "present" : "absent";
    const existing = await db
      .select()
      .from(schema.attendance)
      .where(
        and(
          eq(schema.attendance.student_id, parseInt(id)),
          eq(schema.attendance.date, date),
          eq(schema.attendance.user_id, userId),
        ),
      );

    if (existing.length > 0) {
      await db
        .update(schema.attendance)
        .set({ status })
        .where(
          and(
            eq(schema.attendance.student_id, parseInt(id)),
            eq(schema.attendance.date, date),
            eq(schema.attendance.user_id, userId),
          ),
        );
    } else {
      await db.insert(schema.attendance).values({
        student_id: parseInt(id),
        date,
        status,
        user_id: userId,
      });
    }
  }

  await setFlash("success", "Attendance saved!");
  redirect("/attendance");
}

// ─── Exams ────────────────────────────────────────────────────────────────────

export async function createExam(formData) {
  const user = await getAuthUser();

  await db.insert(schema.exams).values({
    name: formData.get("name"),
    course: formData.get("course"),
    semester: formData.get("semester") || null,
    subject: formData.get("subject"),
    exam_date: formData.get("exam_date"),
    exam_type: formData.get("exam_type") || "internal",
    max_marks: parseInt(formData.get("max_marks")),
    passing_marks: parseInt(formData.get("passing_marks")),
    academic_year: formData.get("academic_year") || null,
    user_id: 1,
  });

  await setFlash("success", "Exam scheduled successfully!");
  redirect("/exams");
}

export async function saveResults(formData) {
  const user = await getAuthUser();
  const exam_id = parseInt(formData.get("exam_id"));
  const studentIds = formData.getAll("student_id");

  for (const sid of studentIds) {
    const marks = formData.get(`marks_${sid}`);
    if (marks === "" || marks === null) continue;

    const marksNum = parseFloat(marks);
    const remarks = formData.get(`remarks_${sid}`) || "";

    let grade = "F";
    if (marksNum >= 90) grade = "A+";
    else if (marksNum >= 75) grade = "A";
    else if (marksNum >= 60) grade = "B";
    else if (marksNum >= 45) grade = "C";
    else if (marksNum >= 33) grade = "D";

    const existing = await db
      .select()
      .from(schema.results)
      .where(
        and(
          eq(schema.results.exam_id, exam_id),
          eq(schema.results.student_id, parseInt(sid)),
          eq(schema.results.user_id, 1),
        ),
      );

    if (existing.length > 0) {
      await db
        .update(schema.results)
        .set({ marks_obtained: marksNum, grade, remarks })
        .where(
          and(
            eq(schema.results.exam_id, exam_id),
            eq(schema.results.student_id, parseInt(sid)),
            eq(schema.results.user_id, 1),
          ),
        );
    } else {
      await db.insert(schema.results).values({
        exam_id,
        student_id: parseInt(sid),
        marks_obtained: marksNum,
        grade,
        remarks,
        user_id: 1,
      });
    }
  }

  await setFlash("success", "Marks saved successfully!");
  redirect("/exams");
}

// ─── Exam Forms ───────────────────────────────────────────────────────────────

export async function addExamForm(formData) {
  const user = await getAuthUser();

  const student_id = parseInt(formData.get("student_id"));
  const academic_year = formData.get("academic_year");
  const semester = formData.get("semester");
  const exam_fee_paid = formData.get("exam_fee_paid") === "1" ? 1 : 0;

  if (!student_id || !academic_year || !semester) redirect("/exam-forms");

  await db.insert(schema.exam_forms).values({
    student_id,
    academic_year,
    semester,
    exam_fee_paid,
    form_status: exam_fee_paid ? "approved" : "pending",
    submitted_date: new Date().toISOString().split("T")[0],
    user_id: 1,
  });

  await setFlash("success", "Exam form submitted!");
  redirect("/exam-forms");
}

export async function updateExamFormStatus(formData) {
  const user = await getAuthUser();
  const id = parseInt(formData.get("id"));
  const form_status = formData.get("form_status");
  const exam_fee_paid = formData.get("exam_fee_paid") === "1" ? 1 : 0;

  await db
    .update(schema.exam_forms)
    .set({ form_status, exam_fee_paid })
    .where(and(eq(schema.exam_forms.id, id), eq(schema.exam_forms.user_id, 1)));

  await setFlash("success", "Exam form updated!");
  redirect("/exam-forms");
}

// ─── Notices ──────────────────────────────────────────────────────────────────

export async function createNotice(formData) {
  const user = await getAuthUser();

  await db.insert(schema.notices).values({
    title: formData.get("title"),
    content: formData.get("content"),
    category: formData.get("category"),
    priority: formData.get("priority"),
    user_id: 1,
  });

  await setFlash("success", "Notice posted successfully!");
  redirect("/notices");
}

// ─── Timetable ────────────────────────────────────────────────────────────────

export async function addPeriod(formData) {
  const user = await getAuthUser();

  const course = formData.get("course");

  await db.insert(schema.timetable).values({
    course,
    semester: formData.get("semester") || null,
    day: formData.get("day"),
    period: parseInt(formData.get("period")),
    subject: formData.get("subject"),
    professor_name: formData.get("professor_name") || null,
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    user_id: 1,
  });

  await setFlash("success", "Period added successfully!");
  redirect(`/timetable?course=${course}`);
}

// ─── Certificates ─────────────────────────────────────────────────────────────

export async function issueCertificate(formData) {
  const user = await getAuthUser();

  await db.insert(schema.certificates).values({
    student_id: parseInt(formData.get("student_id")),
    cert_type: formData.get("cert_type"),
    issue_date: formData.get("issue_date"),
    serial_no: formData.get("serial_no") || null,
    reason: formData.get("reason") || null,
    last_course: formData.get("last_course") || null,
    last_exam_passed: formData.get("last_exam_passed") || null,
    conduct: formData.get("conduct") || "Good",
    custom_content: formData.get("custom_content") || null,
    user_id: 1,
  });

  await setFlash("success", "Certificate issued successfully!");
  redirect("/certificates");
}

// ─── Settings ─────────────────────────────────────────────────────────────────

const settingsSchema = z.object({
  college_name: z.string().min(1, "College name is required"),
  university_name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  principal_name: z.string().optional(),
  affiliation_no: z.string().optional(),
  college_code: z.string().optional(),
});

export async function saveSettings(formData) {
  const user = await getAuthUser();

  const existing = await db
    .select()
    .from(schema.college_settings)
    .where(eq(schema.college_settings.user_id, 1));
  const current = existing[0] || {};

  let logo_url = current.logo_url || null;
  const logoFile = formData.get("logo");
  if (logoFile && logoFile.size > 0) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const fd = new FormData();
    fd.append("file", logoFile);
    fd.append("upload_preset", uploadPreset);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: fd },
    );
    const data = await res.json();
    logo_url = data.secure_url;
  }

  const raw = {
    college_name: formData.get("college_name"),
    university_name: formData.get("university_name") || undefined,
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    principal_name: formData.get("principal_name") || undefined,
    affiliation_no: formData.get("affiliation_no") || undefined,
    college_code: formData.get("college_code") || undefined,
  };

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    await setFlash(
      "error",
      "Invalid data: " + JSON.stringify(parsed.error.flatten().fieldErrors),
    );
    redirect("/settings");
  }

  const data = {
    user_id: 1,
    ...parsed.data,
    logo_url,
    updated_at: new Date(),
  };

  if (existing.length > 0) {
    await db
      .update(schema.college_settings)
      .set(data)
      .where(eq(schema.college_settings.user_id, 1));
  } else {
    await db.insert(schema.college_settings).values(data);
  }

  await setFlash("success", "Settings saved successfully!");
  redirect("/settings");
}

// ─── Delete Student ───────────────────────────────────────────────────────────

export async function deleteStudent(formData) {
  const user = await getAuthUser();
  const id = parseInt(formData.get("id"));

  const studentCheck = await db
    .select()
    .from(schema.students)
    .where(and(eq(schema.students.id, id), eq(schema.students.user_id, 1)));
  if (!studentCheck.length) redirect("/students");

  await db.delete(schema.fees).where(eq(schema.fees.student_id, id));
  await db
    .delete(schema.attendance)
    .where(eq(schema.attendance.student_id, id));
  await db.delete(schema.results).where(eq(schema.results.student_id, id));
  await db
    .delete(schema.exam_forms)
    .where(eq(schema.exam_forms.student_id, id));
  await db
    .delete(schema.certificates)
    .where(eq(schema.certificates.student_id, id));
  await db
    .delete(schema.fee_concessions)
    .where(eq(schema.fee_concessions.student_id, id));
  await db.delete(schema.students).where(eq(schema.students.id, id));

  await setFlash("success", "Student deleted successfully!");
  redirect("/students");
}
