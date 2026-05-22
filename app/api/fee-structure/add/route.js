// app/api/fee-structure/add/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and } from "drizzle-orm";
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
  const faculty = formData.get("faculty");
  const course = formData.get("course");
  const semester = formData.get("semester") || null;
  const fee_type = formData.get("fee_type");
  const amountRaw = formData.get("amount");
  const amount = parseInt(amountRaw, 10);
  const academic_year = formData.get("academic_year") || null;

  if (!faculty || !course || !fee_type || isNaN(amount) || amount <= 0) {
    await setFlash("error", "Faculty, course, fee type and valid amount are required");
    return NextResponse.redirect(new URL("/fee-structure/add", request.url), { status: 303 });
  }

  // ─── Duplicate check: same faculty + course + semester + fee_type + year ─
  const conditions = [
    eq(schema.fee_structures.user_id, user.id),
    eq(schema.fee_structures.faculty, faculty),
    eq(schema.fee_structures.course, course),
    eq(schema.fee_structures.fee_type, fee_type),
  ];
  if (semester) {
    conditions.push(eq(schema.fee_structures.semester, semester));
  }
  if (academic_year) {
    conditions.push(eq(schema.fee_structures.academic_year, academic_year));
  }
  const existing = await db
    .select()
    .from(schema.fee_structures)
    .where(and(...conditions));
  if (existing.length > 0) {
    await setFlash(
      "error",
      `Fee structure for ${course} ${semester || ""} (${fee_type}) already exists with amount ₹${existing[0].amount}. Delete it first to replace.`,
    );
    return NextResponse.redirect(new URL("/fee-structure", request.url), { status: 303 });
  }

  // ─── Insert ────────────────────────────────────────────────────────────
  await db.insert(schema.fee_structures).values({
    user_id: user.id,
    faculty,
    course,
    semester,
    fee_type,
    amount,
    academic_year,
    created_at: new Date(),
  });

  await setFlash("success", "Fee structure saved!");
  return NextResponse.redirect(new URL("/fee-structure", request.url), { status: 303 });
}