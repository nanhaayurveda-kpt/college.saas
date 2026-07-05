// app/api/fees/add/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/flash";

const FIXED_TYPES = ["semester", "admission", "practical", "misc"];

function slugify(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

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
  const studentId = parseInt(formData.get("student_id"), 10);
  const dueDate = formData.get("due_date");
  const paidDate = formData.get("paid_date") || null;
  const academicYear = formData.get("academic_year")?.trim() || null;
  const concessionAmount = parseInt(formData.get("concession_amount") || "0", 10);
  const amountPaidNowRaw = formData.get("amount_paid_now");
  const settlePrevious = formData.get("settle_previous_dues") === "on";

  if (!studentId || isNaN(studentId)) {
    await setFlash("error", "Student required");
    return NextResponse.redirect(new URL("/fees/add", request.url), { status: 303 });
  }
  if (!dueDate) {
    await setFlash("error", "Due date required");
    return NextResponse.redirect(new URL("/fees/add", request.url), { status: 303 });
  }

  const studentRows = await db.select().from(schema.students)
    .where(and(eq(schema.students.id, studentId), eq(schema.students.user_id, 1)));
  const student = studentRows[0];
  if (!student) {
    await setFlash("error", "Student not found");
    return NextResponse.redirect(new URL("/fees/add", request.url), { status: 303 });
  }

  const selectedSemestersRaw = formData.get("selected_semesters");
  const semesterItemsRaw = formData.get("semester_items");
  const semesterCheckedRaw = formData.get("semester_checked");

  let selectedSemesters = [];
  let semesterItemsMap = {};
  let semesterCheckedMap = {};

  try {
    selectedSemesters = JSON.parse(selectedSemestersRaw || "[]");
    semesterItemsMap = JSON.parse(semesterItemsRaw || "{}");
    semesterCheckedMap = JSON.parse(semesterCheckedRaw || "{}");
  } catch {
    await setFlash("error", "Invalid form data");
    return NextResponse.redirect(new URL("/fees/add", request.url), { status: 303 });
  }

  if (selectedSemesters.length === 0) {
    await setFlash("error", "Select at least one semester");
    return NextResponse.redirect(new URL("/fees/add", request.url), { status: 303 });
  }

  const rowsToInsert = [];

  for (const sem of selectedSemesters) {
    const items = semesterItemsMap[sem] || {};
    for (const feeType of FIXED_TYPES) {
      if (!semesterCheckedMap[sem]?.[feeType]) continue;
      const amt = parseInt(items[feeType] || "0", 10);
      if (isNaN(amt) || amt <= 0) continue;
      rowsToInsert.push({ feeType, amount: amt, semester: sem });
    }
  }

  const customCount = parseInt(formData.get("custom_count"), 10) || 0;
  const usedTypes = new Set(rowsToInsert.map((r) => `${r.semester}_${r.feeType}`));
  for (let i = 0; i < customCount; i++) {
    const nameRaw = formData.get(`custom_name_${i}`)?.trim();
    const amtRaw = formData.get(`custom_amount_${i}`);
    if (!nameRaw || !amtRaw) continue;
    const slug = slugify(nameRaw);
    if (!slug) continue;
    const amt = parseInt(amtRaw, 10);
    if (isNaN(amt) || amt <= 0) continue;
    rowsToInsert.push({ feeType: slug, amount: amt, semester: null });
  }

  if (rowsToInsert.length === 0) {
    await setFlash("error", "No valid fee items");
    return NextResponse.redirect(new URL("/fees/add", request.url), { status: 303 });
  }

  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const randPart = Math.floor(1000 + Math.random() * 9000);
  const receiptNo = `RCP-${datePart}-${randPart}`;

  const grossTotal = rowsToInsert.reduce((s, r) => s + r.amount, 0);
  const netDue = Math.max(0, grossTotal - concessionAmount);

  let paidNowTotal = 0;
  if (paidDate) {
    if (!amountPaidNowRaw || amountPaidNowRaw === "") {
      paidNowTotal = netDue;
    } else {
      paidNowTotal = Math.max(0, Math.min(netDue, parseInt(amountPaidNowRaw, 10) || 0));
    }
  }

  let remainingPaid = paidNowTotal;
  let inserted = 0;
  let skipped = 0;
  let firstRow = true;

  for (const row of rowsToInsert) {
    const conditions = [
      eq(schema.fees.user_id, 1),
      eq(schema.fees.student_id, studentId),
      eq(schema.fees.fee_type, row.feeType),
    ];
    if (academicYear) conditions.push(eq(schema.fees.academic_year, academicYear));
    if (row.semester) conditions.push(eq(schema.fees.semester, row.semester));

    const existing = await db.select({ id: schema.fees.id }).from(schema.fees).where(and(...conditions));
    if (existing.length > 0) { skipped++; continue; }

    const rowDiscount = firstRow ? concessionAmount : 0;
    const rowNet = row.amount - rowDiscount;
    const rowPaid = paidDate ? Math.min(rowNet, remainingPaid) : 0;
    remainingPaid = Math.max(0, remainingPaid - rowPaid);

    let status;
    if (!paidDate) status = "pending";
    else if (rowPaid >= rowNet) status = "paid";
    else if (rowPaid > 0) status = "partial";
    else status = "pending";

    await db.insert(schema.fees).values({
      student_id: studentId,
      user_id: 1,
      amount: row.amount,
      paid_amount: rowPaid,
      fee_type: row.feeType,
      semester: row.semester || null,
      academic_year: academicYear,
      due_date: new Date(dueDate),
      paid_date: paidDate && rowPaid > 0 ? new Date(paidDate) : null,
      status,
      receipt_no: receiptNo,
    });
    firstRow = false;

    if (paidDate && rowPaid > 0) {
      const findRows = await db.select({ id: schema.fees.id }).from(schema.fees)
        .where(and(...conditions)).orderBy(schema.fees.id);
      const feeRow = findRows[findRows.length - 1];
      if (feeRow) {
        await db.insert(schema.fee_payments).values({
          fee_id: feeRow.id,
          student_id: studentId,
          user_id: 1,
          amount: rowPaid,
          payment_mode: "cash",
          paid_date: new Date(paidDate),
          receipt_no: receiptNo,
        });
      }
    }
    inserted++;
  }

  // Settle previous dues
  let settledCount = 0;
  if (settlePrevious && paidDate) {
    const oldRows = await db
      .select({ id: schema.fees.id, amount: schema.fees.amount, paid_amount: schema.fees.paid_amount, receipt_no: schema.fees.receipt_no })
      .from(schema.fees)
      .where(and(
        eq(schema.fees.user_id, 1),
        eq(schema.fees.student_id, studentId),
        inArray(schema.fees.status, ["pending", "partial"]),
      ));
    for (const oldRow of oldRows) {
      if (oldRow.receipt_no === receiptNo) continue;
      const remaining = (oldRow.amount || 0) - (oldRow.paid_amount || 0);
      if (remaining <= 0) continue;
      await db.update(schema.fees).set({
        paid_amount: oldRow.amount,
        status: "paid",
        paid_date: new Date(paidDate),
      }).where(eq(schema.fees.id, oldRow.id));
      await db.insert(schema.fee_payments).values({
        fee_id: oldRow.id,
        student_id: studentId,
        user_id: 1,
        amount: remaining,
        payment_mode: "cash",
        paid_date: new Date(paidDate),
        receipt_no: oldRow.receipt_no || receiptNo,
      });
      settledCount++;
    }
  }

  if (inserted === 0 && settledCount === 0) {
    await setFlash("warning", `All ${skipped} entries already exist`);
  } else {
    const parts = [];
    if (inserted > 0) parts.push(`${inserted} entries added`);
    if (skipped > 0) parts.push(`${skipped} skipped`);
    if (settledCount > 0) parts.push(`${settledCount} previous dues cleared`);
    await setFlash("success", `${parts.join(", ")} — Receipt ${receiptNo}`);
  }

  return NextResponse.redirect(new URL("/fees", request.url), { status: 303 });
}