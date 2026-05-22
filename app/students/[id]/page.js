export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { students, fee_concessions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { deleteStudent, addConcession, deleteConcession } from "@/app/actions";

export default async function StudentDetailPage({ params }) {
  const { id } = await params;
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
  if (!user) redirect("/login");

  const result = await db
    .select()
    .from(students)
    .where(and(eq(students.id, Number(id)), eq(students.user_id, user.id)));
  if (result.length === 0) notFound();
  const s = result[0];

  const concessions = await db
    .select()
    .from(fee_concessions)
    .where(eq(fee_concessions.student_id, Number(id)));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Student Details</h1>
          <p className="text-gray-500 text-xs mt-0.5">{s.name}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/students/${id}/edit`}
            className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-medium"
          >
            Edit
          </Link>
          <form method="POST" action="/api/students/delete">
            <input type="hidden" name="id" value={s.id} />
            <button
              type="submit"
              className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-medium"
            >
              Delete
            </button>
          </form>
          <Link
            href="/students"
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Photo + Name */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full border-2 border-indigo-100 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
          {s.photo_url ? (
            <img
              src={s.photo_url}
              alt={s.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl">👤</span>
          )}
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">{s.name}</p>
          <p className="text-xs text-gray-500">
            {s.course} — Sem {s.semester}
          </p>
          <p className="text-xs text-gray-400">{s.faculty}</p>
          <span
            className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-medium ${s.fee_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
          >
            {s.fee_status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Roll Number
            </p>
            <p className="text-sm font-medium text-gray-900">
              {s.roll_number || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Scholar No.
            </p>
            <p className="text-sm font-medium text-gray-900">
              {s.admission_no || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              PEN
            </p>
            <p className="text-sm font-medium text-gray-900">{s.pen || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Aadhaar No.
            </p>
            <p className="text-sm font-medium text-gray-900">
              {s.aadhaar || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Father Name
            </p>
            <p className="text-sm font-medium text-gray-900">
              {s.father_name || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Mother Name
            </p>
            <p className="text-sm font-medium text-gray-900">
              {s.mother_name || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Phone
            </p>
            <p className="text-sm font-medium text-gray-900">
              {s.phone || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Alt Phone
            </p>
            <p className="text-sm font-medium text-gray-900">
              {s.alt_phone || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Gender
            </p>
            <p className="text-sm font-medium text-gray-900">
              {s.gender || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Date of Birth
            </p>
            <p className="text-sm font-medium text-gray-900">{s.dob || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Religion
            </p>
            <p className="text-sm font-medium text-gray-900">
              {s.religion || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Caste
            </p>
            <p className="text-sm font-medium text-gray-900">
              {s.caste || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Academic Year
            </p>
            <p className="text-sm font-medium text-gray-900">
              {s.academic_year || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Admission Date
            </p>
            <p className="text-sm font-medium text-gray-900">
              {s.admission_date
                ? new Date(s.admission_date).toLocaleDateString("en-IN")
                : "—"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Address
            </p>
            <p className="text-sm font-medium text-gray-900">
              {s.address || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Fee Concession */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">
          💸 Fee Concession
        </h2>
        {concessions.length > 0 ? (
          <div className="space-y-2 mb-4">
            {concessions.map((c) => (
              <div
                key={c.id}
                className="flex justify-between items-center bg-green-50 border border-green-100 rounded-lg px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {c.discount_type === "percent"
                      ? `${c.discount_value}% discount`
                      : `₹${c.discount_value} off`}
                  </p>
                  {c.reason && (
                    <p className="text-xs text-gray-500 mt-0.5">{c.reason}</p>
                  )}
                </div>
                <form method="POST" action="/api/concessions/delete">
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="student_id" value={s.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-500 font-medium"
                  >
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 mb-4">No concession set.</p>
        )}
        <form method="POST" action="/api/concessions/add" className="space-y-3">
          <input type="hidden" name="student_id" value={s.id} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="discount_type"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="amount">Fixed Amount (₹)</option>
                <option value="percent">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Value
              </label>
              <input
                type="number"
                name="discount_value"
                required
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Reason
            </label>
            <input
              type="text"
              name="reason"
              placeholder="e.g. Staff child, Merit"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium"
          >
            Add Concession
          </button>
        </form>
      </div>
    </div>
  );
}
