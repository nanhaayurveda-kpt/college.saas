// app/api/exam-forms/update-status/route.js
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
  const id = parseInt(formData.get("id"), 10);
  const form_status = formData.get("form_status");
  const exam_fee_paid = formData.get("exam_fee_paid") === "1" ? 1 : 0;

  if (isNaN(id)) {
    return NextResponse.redirect(new URL("/exam-forms", request.url), { status: 303 });
  }

  await db
    .update(schema.exam_forms)
    .set({ form_status, exam_fee_paid })
    .where(
      and(
        eq(schema.exam_forms.id, id),
        eq(schema.exam_forms.user_id, 1),
      ),
    );

  await setFlash("success", "Exam form updated!");
  return NextResponse.redirect(new URL("/exam-forms", request.url), { status: 303 });
}