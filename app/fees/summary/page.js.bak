export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { fees, students, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function FeesSummaryPage({ searchParams }) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/login");

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));
  const user = userResult[0];
  if (!user) redirect("/login");

  const params = await searchParams;
  const status = params?.status || "pending";

  const allFees = await db
    .select({
      id: fees.id,
      amount: fees.amount,
      paid_amount: fees.paid_amount,
      status: fees.status,
      fee_type: fees.fee_type,
      due_date: fees.due_date,
      student_id: fees.student_id,
      student_name: students.name,
      faculty: students.faculty,
      course: students.course,
      semester: students.semester,
      roll_number: students.roll_number,
    })
    .from(fees)
    .leftJoin(students, eq(fees.student_id, students.id))
    .where(eq(students.user_id, 1))
    .orderBy(
      students.faculty,
      students.course,
      students.semester,
      students.name,
    );

  const filtered =
    status === "all"
      ? allFees
      : allFees.filter((f) =>
          status === "paid" ? f.status === "paid" : f.status !== "paid",
        );

  // Group: faculty → course → semester → students
  const grouped = {};
  filtered.forEach((f) => {
    const fac = f.faculty || "—";
    const course = f.course || "—";
    const sem = f.semester || "—";
    if (!grouped[fac]) grouped[fac] = {};
    if (!grouped[fac][course]) grouped[fac][course] = {};
    if (!grouped[fac][course][sem]) grouped[fac][course][sem] = [];
    grouped[fac][course][sem].push(f);
  });

  const faculties = Object.keys(grouped).sort();
  // Semester-wise grand total
  const semTotals = {};
  filtered.forEach((f) => {
    const key = (f.course || "—") + " Sem " + (f.semester || "—");
    if (!semTotals[key]) semTotals[key] = { total: 0, paid: 0, balance: 0 };
    semTotals[key].total += f.amount || 0;
    semTotals[key].paid += f.paid_amount || 0;
    semTotals[key].balance += (f.amount || 0) - (f.paid_amount || 0);
  });
  const semTotalKeys = Object.keys(semTotals).sort();
  const totalAmount = filtered.reduce((s, f) => s + (f.amount || 0), 0);
  const totalPaid = filtered.reduce((s, f) => s + (f.paid_amount || 0), 0);
  const totalBalance = totalAmount - totalPaid;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {status === "paid"
              ? "Collected Fees"
              : status === "all"
                ? "All Fees"
                : "Pending Fees"}
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {filtered.length} records
          </p>
        </div>
        <Link
          href="/dashboard"
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
        >
          ← Back
        </Link>
      </div>

      <div className="flex gap-2 mb-5">
        <Link
          href="/fees/summary?status=all"
          className={`px-4 py-2 rounded-lg text-xs font-medium ${status === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}
        >
          All
        </Link>
        <Link
          href="/fees/summary?status=pending"
          className={`px-4 py-2 rounded-lg text-xs font-medium ${status === "pending" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}
        >
          Pending
        </Link>
        <Link
          href="/fees/summary?status=paid"
          className={`px-4 py-2 rounded-lg text-xs font-medium ${status === "paid" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}
        >
          Collected
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">₹{totalAmount}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">₹{totalPaid}</p>
          <p className="text-xs text-gray-500">Paid</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-red-600">₹{totalBalance}</p>
          <p className="text-xs text-gray-500">Balance</p>
        </div>
      </div>
      {semTotalKeys.length > 0 && (
        <details className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
          <summary className="font-semibold text-gray-900 text-sm cursor-pointer">
            Semester-wise Grand Total —{" "}
            <span className="text-indigo-600 font-normal">click to view</span>
          </summary>
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-500 uppercase px-2 pb-1 border-b border-gray-100">
              <span>Course/Sem</span>
              <span className="text-right">Total</span>
              <span className="text-right">Paid</span>
              <span className="text-right">Balance</span>
            </div>
            {semTotalKeys.map((key) => (
              <div
                key={key}
                className="grid grid-cols-4 gap-2 px-2 py-1.5 rounded-lg bg-gray-50"
              >
                <span className="text-xs font-medium text-gray-700">{key}</span>
                <span className="text-xs text-right text-gray-900">
                  ₹{semTotals[key].total}
                </span>
                <span className="text-xs text-right text-green-600">
                  ₹{semTotals[key].paid}
                </span>
                <span className="text-xs text-right text-red-500">
                  ₹{semTotals[key].balance}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 text-sm mt-10">
          No records found.
        </p>
      ) : (
        <div className="space-y-5">
          {faculties.map((fac) => (
            <div
              key={fac}
              className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden"
            >
              <div className="bg-indigo-600 px-4 py-2.5">
                <span className="text-white font-bold text-sm">{fac}</span>
              </div>
              {Object.keys(grouped[fac])
                .sort()
                .map((course) => (
                  <div key={course}>
                    <div className="bg-indigo-50 px-4 py-2 border-t border-indigo-100">
                      <span className="text-indigo-700 font-semibold text-xs">
                        {course}
                      </span>
                    </div>
                    {Object.keys(grouped[fac][course])
                      .sort()
                      .map((sem) => (
                        <div key={sem}>
                          <div className="bg-gray-50 px-4 py-1.5 border-t border-gray-100">
                            <span className="text-gray-500 font-medium text-xs">
                              Sem {sem}
                            </span>
                          </div>
                          <div className="divide-y divide-gray-50">
                            {grouped[fac][course][sem].map((f) => {
                              const balance =
                                (f.amount || 0) - (f.paid_amount || 0);
                              return (
                                <div
                                  key={f.id}
                                  className="px-4 py-3 flex justify-between items-start"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {f.student_name || "—"}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Roll {f.roll_number || "—"} ·{" "}
                                      {f.fee_type || "—"}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">
                                      ₹{f.amount}
                                    </p>
                                    {f.paid_amount > 0 && (
                                      <p className="text-xs text-green-600">
                                        Paid ₹{f.paid_amount}
                                      </p>
                                    )}
                                    {balance > 0 && (
                                      <p className="text-xs text-red-500">
                                        Due ₹{balance}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
