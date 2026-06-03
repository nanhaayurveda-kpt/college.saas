export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { fee_structures } from "@/lib/schema";
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

  const rows = await db
    .select()
    .from(fee_structures)
    .where(eq(fee_structures.user_id, 1))
    .orderBy(fee_structures.course);

  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.course]) grouped[row.course] = [];
    grouped[row.course].push(row);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fee Structure</h1>
          <p className="text-gray-500 text-xs mt-0.5">{rows.length} records</p>
        </div>
        <Link href="/fee-structure/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Add
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-400 text-sm">No fee structure defined yet.</p>
          <Link href="/fee-structure/add"
            className="inline-block mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Add Fee Structure
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([course, items]) => (
            <div key={course} className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-t-xl flex justify-between items-center">
                <span className="text-sm font-semibold">{course}</span>
                <span className="text-xs text-indigo-200">{items.length} fee type{items.length > 1 ? "s" : ""}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {FEE_TYPE_LABELS[item.fee_type] || item.fee_type}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.academic_year || "—"}
                        {item.discount > 0 && (
                          <span className="ml-2 text-green-600">Discount: ₹{item.discount}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-indigo-700">₹{item.amount}</span>
                      <form method="POST" action="/api/fee-structure/delete">
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className="text-xs text-red-500 font-medium">
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}