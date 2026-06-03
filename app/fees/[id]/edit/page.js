export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { fees, students, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import EditFeeForm from "./EditFeeForm";

export default async function EditFeePage({ params }) {
  const { id } = await params;
  const feeId = parseInt(id, 10);

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/login");
  const session = await getSession(token);
  if (!session) redirect("/login");

  const userResult = await db.select().from(users).where(eq(users.email, session.email));
  const user = userResult[0];
  if (!user) redirect("/login");

  const rows = await db
    .select({
      id: fees.id,
      amount: fees.amount,
      paid_amount: fees.paid_amount,
      fee_type: fees.fee_type,
      academic_year: fees.academic_year,
      due_date: fees.due_date,
      paid_date: fees.paid_date,
      status: fees.status,
      receipt_no: fees.receipt_no,
      student_name: students.name,
      course: students.course,
      semester: students.semester,
    })
    .from(fees)
    .leftJoin(students, eq(fees.student_id, students.id))
    .where(and(eq(fees.id, feeId), eq(fees.user_id, 1)));

  if (!rows.length) notFound();
  const fee = rows[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Edit Fee Record</h1>
        <p className="text-gray-500 text-xs mt-0.5">{fee.student_name}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <EditFeeForm fee={fee} />
      </div>
    </div>
  );
}