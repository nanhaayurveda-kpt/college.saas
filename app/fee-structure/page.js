export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { fee_packages, fee_package_items } from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

const FIXED_LABELS = {
  semester: "Semester Fee",
  admission: "Admission Fee",
  practical: "Practical Fee",
  misc: "Miscellaneous",
};

function labelOf(type) {
  if (FIXED_LABELS[type]) return FIXED_LABELS[type];
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function FeeStructurePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/login");
  const session = await getSession(token);
  if (!session) redirect("/login");

  const allPackages = await db
    .select()
    .from(fee_packages)
    .where(eq(fee_packages.user_id, 1))
    .orderBy(fee_packages.course);

  const packageIds = allPackages.map((p) => p.id);
  const allItems =
    packageIds.length > 0
      ? await db
          .select()
          .from(fee_package_items)
          .where(inArray(fee_package_items.package_id, packageIds))
      : [];

  const packagesWithItems = allPackages.map((pkg) => ({
    ...pkg,
    items: allItems.filter((item) => item.package_id === pkg.id),
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fee Packages</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Course-wise fee template
          </p>
        </div>
        <Link
          href="/fee-structure/packages/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Package
        </Link>
      </div>

      {packagesWithItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No packages defined yet. Create your first package.
        </div>
      ) : (
        <div className="space-y-4">
          {packagesWithItems.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden"
            >
              <div className="bg-indigo-600 px-4 py-2.5 flex justify-between items-center">
                <div>
                  <span className="text-white font-bold text-sm">
                    {pkg.course}
                  </span>
                  {pkg.semester && (
                    <span className="text-indigo-200 text-xs ml-2">
                      · {pkg.semester}
                    </span>
                  )}
                </div>
                <span className="text-indigo-200 text-xs">
                  {pkg.academic_year}
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {pkg.items.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-2.5 flex justify-between items-center"
                  >
                    <p className="text-sm text-gray-700">
                      {labelOf(item.fee_type)}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{item.amount}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 px-4 py-2.5 flex justify-between items-center">
                <span className="text-xs text-gray-500">Total</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-indigo-600">
                    ₹{pkg.total_amount}
                  </span>
                  <Link
                    href={`/fee-structure/packages/${pkg.id}/edit`}
                    className="text-xs text-indigo-600 font-medium"
                  >
                    Edit
                  </Link>
                  <form
                    method="POST"
                    action="/api/fee-structure/packages/delete"
                  >
                    <input type="hidden" name="id" value={pkg.id} />
                    <button
                      type="submit"
                      className="text-xs text-red-500 font-medium"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
