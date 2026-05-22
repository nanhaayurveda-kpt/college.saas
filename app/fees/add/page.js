export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { students, fee_structures, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import FeeAddForm from "@/components/FeeAddForm";
import { fee_concessions } from "@/lib/schema";

export default async function AddFeePage() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/login");

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));
  const user = userResult[0];

  const allStudents = await db
    .select()
    .from(students)
    .where(eq(students.user_id, user.id))
    .orderBy(students.name);

  const feeStructures = await db
    .select()
    .from(fee_structures)
    .where(eq(fee_structures.user_id, user.id));

  const allConcessions = await db
    .select()
    .from(fee_concessions)
    .where(eq(fee_concessions.user_id, user.id));
  const studentIds = allStudents.map((s) => s.id);
  const concessions = allConcessions.filter((c) =>
    studentIds.includes(c.student_id),
  );
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toLocaleString("en-IN", { month: "long" });
  const now = new Date();
  const baseYear =
    now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  const currentAcademicYear = `${baseYear}-${String(baseYear + 1).slice(-2)}`;

  const months = [
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
  ];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Record Fee Payment</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Record student fee payment here
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <FeeAddForm
          allStudents={allStudents}
          feeStructures={feeStructures}
          concessions={concessions}
          today={today}
          currentMonth={currentMonth}
          currentAcademicYear={currentAcademicYear}
          months={months}
        />
      </div>
    </div>
  );
}
