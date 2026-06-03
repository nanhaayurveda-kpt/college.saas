// app/api/fee-structure/add/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/flash";

export async function POST(request) {
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

  const formData = await request.formData();
  const course = formData.get("course");
  const fee_type = formData.get("fee_type");
  const amount = parseInt(formData.get("amount"), 10);
  const discount = parseInt(formData.get("discount") || "0", 10);
  const academic_year = formData.get("academic_year") || null;

  if (!course || !fee_type || isNaN(amount) || amount <= 0) {
    await setFlash("error", "Course, fee type and valid amount are required");
    return NextResponse.redirect(new URL("/fee-structure/add", request.url), { status: 303 });
  }

  const conditions = [
    eq(schema.fee_structures.user_id, 1),
    eq(schema.fee_structures.course, course),
    eq(schema.fee_structures.fee_type, fee_type),
  ];
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
      `Fee structure for ${course} (${fee_type}) already exists with amount ₹${existing[0].amount}. Delete it first to replace.`,
    );
    return NextResponse.redirect(new URL("/fee-structure", request.url), { status: 303 });
  }

  await db.insert(schema.fee_structures).values({
    user_id: 1,
    course,
    fee_type,
    amount,
    discount,
    academic_year,
    created_at: new Date(),
  });

  await setFlash("success", "Fee structure saved!");
  return NextResponse.redirect(new URL("/fee-structure", request.url), { status: 303 });
}