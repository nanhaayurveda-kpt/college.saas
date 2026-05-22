export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { fees, students } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { users } from "@/lib/schema";

export default async function FeesPage({ searchParams }) {
  const params = await searchParams;
  const tab = params?.tab || "course";
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/login");
  const userResult = await db.select().from(users).where(eq(users.email, session.email));
  const user = userResult[0];

  const allFees = await db
    .select({
      id: fees.id,
      amount: fees.amount,
      due_date: fees.due_date,
      paid_date: fees.paid_date,
      status: fees.status,
      student_name: students.name,
      student_id: fees.student_id,
      course: students.course,
      semester: students.semester,
      parent_phone: students.phone,
      parent_name: students.father_name,
    })
    .from(fees)
    .leftJoin(students, eq(fees.student_id, students.id))
    .where(eq(students.user_id, user.id))
    .orderBy(fees.due_date);

  const summary = {
    pending_count: allFees.filter((f) => f.status === "pending").length,
    partial_count: allFees.filter((f) => f.status === "partial").length,
    paid_count: allFees.filter((f) => f.status === "paid").length,
    overdue_count: allFees.filter((f) => f.status === "overdue").length,
    total_pending: allFees.filter((f) => f.status === "pending").reduce((s, f) => s + (f.amount || 0), 0),
    total_partial: allFees.filter((f) => f.status === "partial").reduce((s, f) => s + ((f.amount || 0) - (f.paid_amount || 0)), 0),
    total_collected: allFees.filter((f) => f.status === "paid").reduce((s, f) => s + (f.amount || 0), 0),
    total_overdue: allFees.filter((f) => f.status === "overdue").reduce((s, f) => s + (f.amount || 0), 0),
  };

  const grouped = {};
  allFees.forEach((fee) => {
    const course = fee.course || "—";
    const sem = fee.semester || "—";
    if (!grouped[course]) grouped[course] = {};
    if (!grouped[course][sem]) grouped[course][sem] = [];
    grouped[course][sem].push(fee);
  });
  const sortedCourses = Object.keys(grouped).sort();

  const defaulters = allFees.filter(
    (f) => f.status === "pending" || f.status === "partial" || f.status === "overdue"
  );

  const FeeRow = ({ fee }) => {
    const phone = fee.parent_phone?.replace(/\D/g, "") || "";
    const fullPhone = phone.startsWith("91") ? phone : `91${phone}`;
    const msg = encodeURIComponent(
      `Dear ${fee.parent_name || "Parent"},\n\nFees of ₹${fee.amount} for ${fee.student_name} is pending. Please pay at the earliest.\n\n— College`
    );
    return (
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-gray-900 truncate">{fee.student_name}</p>
            <span className={`shrink-0 px-1.5 py-0.5 text-xs rounded-full font-medium ${
              fee.status === "paid" ? "bg-green-100 text-green-700" :
              fee.status === "partial" ? "bg-orange-100 text-orange-700" :
              fee.status === "overdue" ? "bg-red-100 text-red-700" :
              "bg-yellow-100 text-yellow-700"
            }`}>
              {fee.status === "paid" ? "Paid" : fee.status === "partial" ? "Partial" :
               fee.status === "overdue" ? "Overdue" : "Pending"}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Due: {new Date(fee.due_date).toLocaleDateString("en-IN")}
            {fee.paid_date && ` · Paid: ${new Date(fee.paid_date).toLocaleDateString("en-IN")}`}
          </p>
        </div>
        <div className="ml-3 shrink-0 text-right">
          <p className="text-sm font-bold text-gray-900">₹{fee.amount}</p>
          {(fee.status === "pending" || fee.status === "partial" || fee.status === "overdue") && (
            <div className="flex flex-col gap-0.5 items-end">
              <Link href={`/fees/${fee.id}/pay`} className="text-xs text-indigo-600 font-medium">
                Mark Paid
              </Link>
              {fee.parent_phone && (
                <a href={`https://wa.me/${fullPhone}?text=${msg}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs text-green-600 font-medium">
                  📲 Remind
                </a>
              )}
            </div>
          )}
          {fee.status === "paid" && (
            <Link href={`/fees/${fee.id}/receipt`} className="text-xs text-green-600 font-medium">
              🖨️ Receipt
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-500 text-xs mt-0.5">Course & semester-wise fee tracking</p>
        </div>
        <Link href="/fees/add" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Record
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-red-50 rounded-xl p-3 border border-red-100">
          <p className="text-xs text-red-500 font-medium">Pending</p>
          <p className="text-xl font-bold text-red-600 mt-1">₹{summary.total_pending || 0}</p>
          <p className="text-xs text-red-400 mt-0.5">{summary.pending_count || 0} records</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 border border-green-100">
          <p className="text-xs text-green-600 font-medium">Collected</p>
          <p className="text-xl font-bold text-green-700 mt-1">₹{summary.total_collected || 0}</p>
          <p className="text-xs text-green-500 mt-0.5">{summary.paid_count || 0} records</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
          <p className="text-xs text-orange-600 font-medium">Partial</p>
          <p className="text-xl font-bold text-orange-600 mt-1">₹{summary.total_partial || 0}</p>
          <p className="text-xs text-orange-400 mt-0.5">{summary.partial_count || 0} records</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 border border-red-200">
          <p className="text-xs text-red-700 font-medium">Overdue</p>
          <p className="text-xl font-bold text-red-700 mt-1">₹{summary.total_overdue || 0}</p>
          <p className="text-xs text-red-400 mt-0.5">{summary.overdue_count || 0} records</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <a href="/fees?tab=course"
          className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium ${tab === "course" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
          Course-wise
        </a>
        <a href="/fees?tab=defaulters"
          className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium ${tab === "defaulters" ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-red-600"}`}>
          🔴 Defaulters ({defaulters.length})
        </a>
        <a href="/fees?tab=all"
          className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium ${tab === "all" ? "bg-gray-700 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
          All
        </a>
      </div>

      {tab === "course" && (
        <div className="space-y-5">
          {sortedCourses.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">No records found.</div>
          ) : (
            sortedCourses.map((course) => {
              const semesters = Object.keys(grouped[course]).sort();
              const courseAllFees = semesters.flatMap((s) => grouped[course][s]);
              const coursePaid = courseAllFees.filter((f) => f.status === "paid").reduce((s, f) => s + (f.amount || 0), 0);
              const coursePending = courseAllFees.filter((f) => f.status === "pending").reduce((s, f) => s + (f.amount || 0), 0);
              return (
                <div key={course} className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
                  <div className="bg-indigo-600 px-4 py-2.5 flex justify-between items-center">
                    <span className="text-white font-bold text-sm">{course}</span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-green-200">✓ ₹{coursePaid}</span>
                      <span className="text-red-200">✗ ₹{coursePending}</span>
                    </div>
                  </div>
                  {semesters.map((sem) => {
                    const semFees = grouped[course][sem];
                    const semPaid = semFees.filter((f) => f.status === "paid").reduce((s, f) => s + (f.amount || 0), 0);
                    const semPending = semFees.filter((f) => f.status === "pending").reduce((s, f) => s + (f.amount || 0), 0);
                    return (
                      <div key={sem} className="border-t border-gray-100">
                        <div className="bg-indigo-50 px-4 py-2 flex justify-between items-center">
                          <span className="text-indigo-700 font-semibold text-xs">
                            Sem {sem} · {semFees.length} students
                          </span>
                          <div className="flex gap-3 text-xs">
                            <span className="text-green-600">₹{semPaid} paid</span>
                            <span className="text-red-500">₹{semPending} pending</span>
                          </div>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {semFees.map((fee) => <FeeRow key={fee.id} fee={fee} />)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "defaulters" && (
        <div>
          {defaulters.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">No defaulters. 🎉</div>
          ) : (
            <div className="space-y-3">
              {defaulters.map((fee) => {
                const phone = fee.parent_phone?.replace(/\D/g, "") || "";
                const fullPhone = phone.startsWith("91") ? phone : `91${phone}`;
                const msg = encodeURIComponent(
                  `Dear ${fee.parent_name || "Parent"},\n\nFees of ₹${fee.amount} for ${fee.student_name} is pending.\n\n— College`
                );
                return (
                  <div key={fee.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{fee.student_name}</p>
                        <p className="text-gray-500 text-xs">{fee.course} Sem {fee.semester}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          Due: {new Date(fee.due_date).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div className="ml-3 shrink-0 text-right space-y-1">
                        <p className="text-sm font-bold text-red-600">₹{fee.amount}</p>
                        <Link href={`/fees/${fee.id}/pay`} className="block text-xs font-medium text-indigo-600">
                          Mark Paid
                        </Link>
                        {fee.parent_phone && (
                          <a href={`https://wa.me/${fullPhone}?text=${msg}`}
                            target="_blank" rel="noopener noreferrer"
                            className="block text-xs font-medium text-green-600">
                            📲 Remind
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "all" && (
        <div className="space-y-3">
          {allFees.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">No records found.</div>
          ) : (
            allFees.map((fee) => {
              const phone = fee.parent_phone?.replace(/\D/g, "") || "";
              const fullPhone = phone.startsWith("91") ? phone : `91${phone}`;
              const msg = encodeURIComponent(
                `Dear ${fee.parent_name || "Parent"},\n\nFees of ₹${fee.amount} for ${fee.student_name} is pending.\n\n— College`
              );
              return (
                <div key={fee.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-sm truncate">{fee.student_name}</p>
                        <span className={`shrink-0 px-2 py-0.5 text-xs rounded-full font-medium ${
                          fee.status === "paid" ? "bg-green-100 text-green-700" :
                          fee.status === "overdue" ? "bg-red-100 text-red-700" :
                          fee.status === "partial" ? "bg-orange-100 text-orange-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {fee.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs">{fee.course} Sem {fee.semester}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Due: {new Date(fee.due_date).toLocaleDateString("en-IN")}
                        {fee.paid_date && ` · Paid: ${new Date(fee.paid_date).toLocaleDateString("en-IN")}`}
                      </p>
                    </div>
                    <div className="ml-3 shrink-0 text-right">
                      <p className="text-sm font-bold text-gray-900">₹{fee.amount}</p>
                      {fee.status === "paid" && (
                        <Link href={`/fees/${fee.id}/receipt`} className="text-xs text-green-600 font-medium">
                          🖨️ Receipt
                        </Link>
                      )}
                      {(fee.status === "pending" || fee.status === "partial" || fee.status === "overdue") && (
                        <div className="flex flex-col gap-0.5 items-end">
                          <Link href={`/fees/${fee.id}/pay`} className="text-xs text-indigo-600 font-medium">
                            Mark Paid
                          </Link>
                          {fee.parent_phone && (
                            <a href={`https://wa.me/${fullPhone}?text=${msg}`}
                              target="_blank" rel="noopener noreferrer"
                              className="text-xs text-green-600 font-medium">
                              📲 Remind
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}