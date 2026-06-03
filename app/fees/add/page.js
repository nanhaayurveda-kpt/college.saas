export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { students, fees, fee_packages, fee_package_items, fee_concessions, users } from "@/lib/schema";
import { eq, and, inArray } from "drizzle-orm";
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

  const allPackages = await db
    .select()
    .from(fee_packages)
    .where(eq(fee_packages.user_id, 1));

  const packageIds = allPackages.map((p) => p.id);
  const allItems = packageIds.length > 0
    ? await db.select().from(fee_package_items).where(inArray(fee_package_items.package_id, packageIds))
    : [];

  const packages = allPackages.map((pkg) => ({
    ...pkg,
    items: allItems.filter((i) => i.package_id === pkg.id),
  }));

  // Previous dues per student
  const allFees = await db
    .select({ student_id: fees.student_id, amount: fees.amount, paid_amount: fees.paid_amount, status: fees.status })
    .from(fees)
    .where(eq(fees.user_id, 1));

  const duesMap = {};
  for (const f of allFees) {
    if (f.status !== "paid") {
      const bal = (f.amount || 0) - (f.paid_amount || 0);
      if (bal > 0) duesMap[f.student_id] = (duesMap[f.student_id] || 0) + bal;
    }
  }

  const allConcessions = await db.select().from(fee_concessions).where(eq(fee_concessions.user_id, 1));
  const studentIds = allStudents.map((s) => s.id);
  const concessions = allConcessions.filter((c) => studentIds.includes(c.student_id));

  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const baseYear = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  const currentAcademicYear = `${baseYear}-${String(baseYear + 1).slice(-2)}`;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Record Fee</h1>
        <p className="text-gray-500 text-xs mt-0.5">Record student fee payment</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <FeeAddForm
          allStudents={allStudents}
          packages={packages}
          duesMap={duesMap}
          concessions={concessions}
          today={today}
          currentAcademicYear={currentAcademicYear}
        />
      </div>
    </div>
  );
}