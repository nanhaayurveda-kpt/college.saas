export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { fee_packages, fee_package_items } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

const FEE_TYPE_LABELS = {
  semester: "Semester Fee",
  admission: "Admission Fee",
  practical: "Practical Fee",
  misc: "Miscellaneous",
};

export default async function FeeStructurePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/login");
  const session = await getSession(token);
  if (!session) redirect("/login");

  const packages = await db
    .select()
    .from(fee_packages)
    .where(eq(fee_packages.user_id, 1))
    .orderBy(fee_packages.course);

  const allItems = packages.length > 0
    ? await db.select().from(fee_package_items)
    : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fee Structure</h1>
          <p className="text-gray-500 text-xs mt-0.5">{packages.length} packages</p>
        </div>
        <Link href="/fee-structure/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Add
        </Link>
      </div>

      {packages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-400 text-sm">No fee packages defined yet.</p>
          <Link href="/fee-structure/add"
            className="inline-block mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Add Package
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {packages.map((pkg) => {
            const items = allItems.filter((i) => i.package_id === pkg.id);
            return (
              <div key={pkg.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-t-xl flex justify-between items-center">
                  <div>
                    <span className="text-sm font-semibold">{pkg.course}</span>
                    {pkg.semester && <span className="text-xs text-indigo-200 ml-2">· {pkg.semester}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-indigo-200">{pkg.academic_year}</span>
                    <form method="POST" action="/api/fee-structure/delete">
                      <input type="hidden" name="id" value={pkg.id} />
                      <button type="submit" className="text-xs text-red-300 font-medium">Delete</button>
                    </form>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.id} className="px-4 py-3 flex justify-between items-center">
                      <p className="text-sm text-gray-700">
                        {item.label || FEE_TYPE_LABELS[item.fee_type] || item.fee_type}
                      </p>
                      <span className="text-sm font-bold text-indigo-700">₹{item.amount}</span>
                    </div>
                  ))}
                  <div className="px-4 py-3 flex justify-between items-center bg-gray-50 rounded-b-xl">
                    <span className="text-sm font-semibold text-gray-700">Total</span>
                    <span className="text-sm font-bold text-indigo-900">₹{pkg.total_amount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}