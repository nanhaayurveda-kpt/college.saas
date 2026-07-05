export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { students, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
export default async function IssueCertificatePage({ searchParams }) {
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
  const params = await searchParams;
  const selectedCourse = params?.course || "";

  const allStudents = selectedCourse
    ? await db
        .select()
        .from(students)
        .where(
          and(eq(students.course, selectedCourse)),
        )
        .orderBy(students.name)
    : await db
        .select()
        .from(students)
        
        .orderBy(students.name);

  const today = new Date().toISOString().split("T")[0];
  const courses = [
    "B.A.",
    "M.A.",
    "B.Com",
    "M.Com",
    "B.Sc.",
    "M.Sc.",
    "B.Sc. Ag.",
    "M.Sc. Ag.",
  ];

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Issue Certificate</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          TC · Character · Bonafide · Migration
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <form method="GET" action="/certificates/issue" className="flex gap-3">
          <select
            name="course"
            defaultValue={selectedCourse}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
          >
            Filter
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form
          method="POST"
          action="/api/certificates/issue"
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student <span className="text-red-500">*</span>
            </label>
            <select
              name="student_id"
              required
              defaultValue=""
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select student...</option>
              {allStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.course} {s.semester ? `Sem ${s.semester}` : ""}
                  {s.roll_number ? ` · Roll ${s.roll_number}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: "tc", label: "🔴 Transfer Certificate" },
                { val: "character", label: "🔵 Character Certificate" },
                { val: "bonafide", label: "🟢 Bonafide Certificate" },
                { val: "migration", label: "🟣 Migration Certificate" },
              ].map(({ val, label }) => (
                <label
                  key={val}
                  className="flex items-center gap-2 border border-gray-200 rounded-lg p-3 cursor-pointer has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50"
                >
                  <input
                    type="radio"
                    name="cert_type"
                    value={val}
                    required
                    className="accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="issue_date"
                defaultValue={today}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serial No
              </label>
              <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-500">
                Auto — e.g. TC/2026/001
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conduct
            </label>
            <select
              name="conduct"
              defaultValue="Good"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Satisfactory">Satisfactory</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Course Attended{" "}
              <span className="text-gray-400 font-normal text-xs">
                (for TC)
              </span>
            </label>
            <input
              type="text"
              name="last_course"
              placeholder="e.g. B.A. Final Year"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Exam Passed{" "}
              <span className="text-gray-400 font-normal text-xs">
                (for TC/Migration)
              </span>
            </label>
            <input
              type="text"
              name="last_exam_passed"
              placeholder="e.g. B.A. Annual Exam 2024"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason / Purpose{" "}
              <span className="text-gray-400 font-normal text-xs">
                (optional)
              </span>
            </label>
            <input
              type="text"
              name="reason"
              placeholder="e.g. Admission in another college"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes{" "}
              <span className="text-gray-400 font-normal text-xs">
                (optional)
              </span>
            </label>
            <textarea
              name="custom_content"
              rows={3}
              placeholder="Any additional details..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium"
            >
              Issue Certificate
            </button>
            <a
              href="/certificates"
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
