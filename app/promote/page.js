export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { students, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";export default async function PromotePage() {
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

  const allStudents = await db
    .select()
    .from(students)
    .where(eq(students.user_id, 1));

  const semesters = ["1", "2", "3", "4", "5", "6"];

  const now = new Date();
  const baseYear =
    now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  const nextAcademicYear = `${baseYear + 1}-${String(baseYear + 2).slice(-2)}`;

  const semCounts = {};
  allStudents.forEach((s) => {
    semCounts[s.semester] = (semCounts[s.semester] || 0) + 1;
  });

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Student Promotion</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Semester-wise bulk promotion
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-xs text-yellow-800">
        ⚠️ This action will move all students of the selected semester to the
        next semester. This cannot be undone.
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <p className="text-xs font-medium text-gray-600 mb-3">
          Current Semesters
        </p>
        <div className="grid grid-cols-3 gap-2">
          {semesters.map((sem) => (
            <div
              key={sem}
              className="bg-indigo-50 border border-indigo-100 rounded-lg p-2 text-center"
            >
              <p className="text-sm font-bold text-indigo-700">Sem {sem}</p>
              <p className="text-xs text-indigo-500">
                {semCounts[sem] || 0} students
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-medium text-gray-600 mb-3">
          Promote Students
        </p>
        <form method="POST" action="/api/students/promote" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Semester <span className="text-red-500">*</span>
            </label>
            <select
              name="from_semester"
              required
              defaultValue=""
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select semester to promote...</option>
              {semesters.map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem} ({semCounts[sem] || 0} students)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Semester <span className="text-red-500">*</span>
            </label>
            <select
              name="to_semester"
              required
              defaultValue=""
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select destination semester...</option>
              {semesters.map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Academic Year <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="new_academic_year"
              required
              defaultValue={nextAcademicYear}
              placeholder="e.g. 2025-26"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium"
          >
            Promote Students →
          </button>
        </form>
      </div>
    </div>
  );
}
