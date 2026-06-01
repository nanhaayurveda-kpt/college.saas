// app/api/fees/add/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/flash";
import { z } from "zod";

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

export async function POST(request) {
  // ─── Auth ──────────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url), {
      status: 303,
    });
  }
  const session = await getSession(token);
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), {
      status: 303,
    });
  }

  const userResult = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, session.email));
  const user = userResult[0];
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), {
      status: 303,
    });
  }

  // ─── Parse form ────────────────────────────────────────────────────────
  const formData = await request.formData();
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
    return NextResponse.redirect(new URL("/fees/add", request.url), {
      status: 303,
    });
  }

  const studentId = parseInt(parsed.data.student_id, 10);
  if (isNaN(studentId)) {
    await setFlash("error", "Invalid student");
    return NextResponse.redirect(new URL("/fees/add", request.url), {
      status: 303,
    });
  }

  // ─── Ownership check: student belongs to this user ─────────────────────
  const studentCheck = await db
    .select()
    .from(schema.students)
    .where(
      and(
        eq(schema.students.id, studentId),
        eq(schema.students.user_id, 1),
      ),
    );
  if (!studentCheck.length) {
    await setFlash("error", "Student not found");
    return NextResponse.redirect(new URL("/fees/add", request.url), {
      status: 303,
    });
  }

  const feeType = parsed.data.fee_type || "monthly";
  const month = parsed.data.month || null;
  const academicYear = parsed.data.academic_year || null;

  // ─── Duplicate check: same student + month + year + fee_type ───────────
  // Only check when month is provided (admission/one-time fees can repeat)
  if (month) {
    const conditions = [
      eq(schema.fees.user_id, 1),
      eq(schema.fees.student_id, studentId),
      eq(schema.fees.month, month),
      eq(schema.fees.fee_type, feeType),
    ];
    if (academicYear) {
      conditions.push(eq(schema.fees.academic_year, academicYear));
    }
    const existing = await db
      .select()
      .from(schema.fees)
      .where(and(...conditions));
    if (existing.length > 0) {
      const student = studentCheck[0];
      await setFlash(
        "error",
        `Fee for ${student.name} — ${month} ${academicYear || ""} (${feeType}) already exists. Use "Mark Paid" for additional payments.`,
      );
      return NextResponse.redirect(new URL("/fees/add", request.url), {
        status: 303,
      });
    }
  }

  // ─── Compute amounts ───────────────────────────────────────────────────
  const netAmountRaw = formData.get("net_amount");
  const parsedAmount = parseInt(parsed.data.amount, 10);
  const parsedNet = parseInt(netAmountRaw, 10);
  const net_amount = !isNaN(parsedNet) ? parsedNet : parsedAmount;

  const paidDate = parsed.data.paid_date || null;

  // ─── Insert fee row ────────────────────────────────────────────────────
  // Auto-generate receipt number: RCP-YYYYMMDD-XXXX
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const randPart = Math.floor(1000 + Math.random() * 9000);
  const receiptNo = parsed.data.receipt_no || `RCP-${datePart}-${randPart}`;

  await db.insert(schema.fees).values({
    student_id: studentId,
    amount: net_amount,
    due_date: new Date(parsed.data.due_date),
    paid_date: paidDate ? new Date(paidDate) : null,
    status: paidDate ? "paid" : "pending",
    paid_amount: paidDate ? net_amount : 0,
    fee_type: feeType,
    academic_year: academicYear,
    month: month,
    receipt_no: receiptNo,
    user_id: 1,
  });

  // ─── Find the inserted fee row (no .returning() on Turso) ──────────────
  // Match by exact fields rather than "last id" which is race-prone
  if (paidDate) {
    const findConditions = [
      eq(schema.fees.user_id, 1),
      eq(schema.fees.student_id, studentId),
      eq(schema.fees.fee_type, feeType),
    ];
    if (month) findConditions.push(eq(schema.fees.month, month));
    if (academicYear)
      findConditions.push(eq(schema.fees.academic_year, academicYear));

    const inserted = await db
      .select()
      .from(schema.fees)
      .where(and(...findConditions))
      .orderBy(schema.fees.id);
    const feeRow = inserted[inserted.length - 1];

    if (feeRow) {
      await db.insert(schema.fee_payments).values({
        fee_id: feeRow.id,
        student_id: studentId,
        user_id: 1,
        amount: net_amount,
        payment_mode: formData.get("payment_mode") || "cash",
        paid_date: new Date(paidDate),
        receipt_no: receiptNo,
      });
    }
  }

  await setFlash("success", "Fee record saved successfully!");
  return NextResponse.redirect(new URL("/fees", request.url), { status: 303 });
}
