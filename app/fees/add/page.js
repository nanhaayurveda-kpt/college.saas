export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { students, fee_packages, fee_package_items, users, fee_concessions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import FeeAddForm from "@/components/FeeAddForm";

export default async function AddFeePage() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/login");

  const userResult = await db.select().from(users).where(eq(users.email, session.email));
  const user = userResult[0];

  const allStudents = await db
    .select()
    .from(students)
    .where(eq(students.user_id, 1))
    .orderBy(students.name);

  const packages = await db
    .select()
    .from(fee_packages)
    .where(eq(fee_packages.user_id, 1));

  const allPackageItems = packages.length > 0
    ? await db.select().from(fee_package_items)
    : [];

  const allConcessions = await db
    .select()
    .from(fee_concessions)
    .where(eq(fee_concessions.user_id, 1));

  const studentIds = allStudents.map((s) => s.id);
  const concessions = allConcessions.filter((c) => studentIds.includes(c.student_id));

  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const baseYear = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  const currentAcademicYear = `${baseYear}-${String(baseYear + 1).slice(-2)}`;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Record Fee Payment</h1>
        <p className="text-gray-500 text-xs mt-0.5">Record student fee payment here</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <FeeAddForm
          allStudents={allStudents}
          feePackages={packages}
          feePackageItems={allPackageItems}
          concessions={concessions}
          today={today}
          currentAcademicYear={currentAcademicYear}
        />
      </div>
    </div>
  );
}