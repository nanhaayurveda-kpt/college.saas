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
  if (!token) return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  const session = await getSession(token);
  if (!session) return NextResponse.redirect(new URL("/login", request.url), { status: 303 });

  const userResult = await db.select().from(schema.users).where(eq(schema.users.email, session.email));
  const user = userResult[0];
  if (!user) return NextResponse.redirect(new URL("/login", request.url), { status: 303 });

  const formData = await request.formData();
  const course = formData.get("course");
  const semester = formData.get("semester") || null;
  const academic_year = formData.get("academic_year") || null;
  const total_amount = parseInt(formData.get("total_amount") || "0", 10);
  const itemsRaw = formData.get("items");

  if (!course || !academic_year) {
    await setFlash("error", "Course and academic year are required");
    return NextResponse.redirect(new URL("/fee-structure/add", request.url), { status: 303 });
  }

  let items = [];
  try {
    items = JSON.parse(itemsRaw || "[]");
  } catch {
    await setFlash("error", "Invalid fee items");
    return NextResponse.redirect(new URL("/fee-structure/add", request.url), { status: 303 });
  }

  // Duplicate check
  const conditions = [
    eq(schema.fee_packages.user_id, 1),
    eq(schema.fee_packages.course, course),
    eq(schema.fee_packages.academic_year, academic_year),
  ];
  if (semester) conditions.push(eq(schema.fee_packages.semester, semester));

  const existing = await db.select().from(schema.fee_packages).where(and(...conditions));
  if (existing.length > 0) {
    await setFlash("error", `Package for ${course} already exists. Delete it first.`);
    return NextResponse.redirect(new URL("/fee-structure", request.url), { status: 303 });
  }

  const [pkg] = await db.insert(schema.fee_packages).values({
    user_id: 1,
    course,
    semester,
    academic_year,
    total_amount,
    created_at: new Date(),
  }).returning({ id: schema.fee_packages.id });

  if (items.length > 0) {
    await db.insert(schema.fee_package_items).values(
      items.map((item) => ({
        package_id: pkg.id,
        fee_type: item.fee_type,
        label: item.label || null,
        amount: parseInt(item.amount) || 0,
      }))
    );
  }

  await setFlash("success", "Fee package saved!");
  return NextResponse.redirect(new URL("/fee-structure", request.url), { status: 303 });
}