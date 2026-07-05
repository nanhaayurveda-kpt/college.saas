export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { exam_forms, students, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
export default async function ExamFormsPage({ searchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/login");
  const session = await getSession(token);
  if (!session) redirect("/login");

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));
  const user = userResult[0];

  const params = await searchParams;
  const filterStatus = params?.status || "";

  const allForms = await db
    .select({
      id: exam_forms.id,
      student_id: exam_forms.student_id,
      academic_year: exam_forms.academic_year,
      semester: exam_forms.semester,
      exam_fee_paid: exam_forms.exam_fee_paid,
      form_status: exam_forms.form_status,
      submitted_date: exam_forms.submitted_date,
      student_name: students.name,
      course: students.course,
      roll_number: students.roll_number,
      phone: students.phone,
    })
    .from(exam_forms)
    .leftJoin(students, eq(exam_forms.student_id, students.id))
    
    .orderBy(exam_forms.submitted_date);

  const filtered = filterStatus
    ? allForms.filter((f) => f.form_status === filterStatus)
    : allForms;

  const summary = {
    total: allForms.length,
    pending: allForms.filter((f) => f.form_status === "pending").length,
    approved: allForms.filter((f) => f.form_status === "approved").length,
    rejected: allForms.filter((f) => f.form_status === "rejected").length,
    fee_paid: allForms.filter((f) => f.exam_fee_paid === 1).length,
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Exam Forms</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {summary.total} total · {summary.pending} pending
          </p>
        </div>
        <Link
          href="/exam-forms/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Add
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
          <p className="text-xs text-yellow-600 font-medium">Pending</p>
          <p className="text-xl font-bold text-yellow-700 mt-1">
            {summary.pending}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 border border-green-100">
          <p className="text-xs text-green-600 font-medium">Approved</p>
          <p className="text-xl font-bold text-green-700 mt-1">
            {summary.approved}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 border border-red-100">
          <p className="text-xs text-red-600 font-medium">Rejected</p>
          <p className="text-xl font-bold text-red-700 mt-1">
            {summary.rejected}
          </p>
        </div>
        <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
          <p className="text-xs text-indigo-600 font-medium">Exam Fee Paid</p>
          <p className="text-xl font-bold text-indigo-700 mt-1">
            {summary.fee_paid}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { value: "", label: "All" },
          { value: "pending", label: "Pending" },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
        ].map((tab) => (
          <a
            key={tab.value}
            href={`/exam-forms?status=${tab.value}`}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium ${
              filterStatus === tab.value
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
          No exam forms found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((form) => (
            <div
              key={form.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {form.student_name}
                    </p>
                    <span
                      className={`shrink-0 px-2 py-0.5 text-xs rounded-full font-medium ${
                        form.form_status === "approved"
                          ? "bg-green-100 text-green-700"
                          : form.form_status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {form.form_status}
                    </span>
                    {form.exam_fee_paid === 1 && (
                      <span className="shrink-0 px-2 py-0.5 text-xs rounded-full font-medium bg-indigo-100 text-indigo-700">
                        Fee Paid
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {form.course} · Sem {form.semester} · {form.academic_year}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Roll: {form.roll_number || "—"} · Submitted:{" "}
                    {form.submitted_date || "—"}
                  </p>
                </div>

                {/* Quick Status Update */}
                <div className="ml-3 shrink-0 flex flex-col gap-1 items-end">
                  {form.form_status === "pending" && (
                    <>
                      <form
                        method="POST"
                        action="/api/exam-forms/update-status"
                      >
                        <input type="hidden" name="id" value={form.id} />
                        <input
                          type="hidden"
                          name="form_status"
                          value="approved"
                        />
                        <input
                          type="hidden"
                          name="exam_fee_paid"
                          value={form.exam_fee_paid ? "1" : "0"}
                        />
                        <button
                          type="submit"
                          className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg"
                        >
                          ✓ Approve
                        </button>
                      </form>
                      <form
                        method="POST"
                        action="/api/exam-forms/update-status"
                      >
                        <input type="hidden" name="id" value={form.id} />
                        <input
                          type="hidden"
                          name="form_status"
                          value="rejected"
                        />
                        <input
                          type="hidden"
                          name="exam_fee_paid"
                          value={form.exam_fee_paid ? "1" : "0"}
                        />
                        <button
                          type="submit"
                          className="text-xs font-medium text-red-500 bg-red-50 px-3 py-1.5 rounded-lg"
                        >
                          ✗ Reject
                        </button>
                      </form>
                    </>
                  )}
                  {form.form_status !== "pending" && (
                    <ResetForm
                      id={form.id}
                      examFeePaid={form.exam_fee_paid}
                      studentName={form.student_name}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
