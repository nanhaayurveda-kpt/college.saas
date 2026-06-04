export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { students } from "@/lib/schema";
import Link from "next/link";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export default async function StudentsPage({ searchParams }) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/login");
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));
  const user = userResult[0];
  const params = await searchParams;
  const search = params?.search?.toLowerCase() || "";
  const selectedFaculty = params?.faculty || "";
  const selectedYear = params?.year || "";

  const allStudents = await db
    .select()
    .from(students)
    .where(eq(students.user_id, 1));

  const faculties = [...new Set(allStudents.map((s) => s.faculty))].sort();
  const years = [
    ...new Set(allStudents.map((s) => s.academic_year).filter(Boolean)),
  ]
    .sort()
    .reverse();

  const filtered = allStudents.filter((s) => {
    const matchSearch =
      !search ||
      s.name?.toLowerCase().includes(search) ||
      s.roll_number?.toLowerCase().includes(search) ||
      s.father_name?.toLowerCase().includes(search) ||
      s.phone?.includes(search);
    const matchFaculty = !selectedFaculty || s.faculty === selectedFaculty;
    const matchYear = !selectedYear || s.academic_year === selectedYear;
    return matchSearch && matchFaculty && matchYear;
  });

  // Faculty → Course → Semester grouped
  const grouped = {};
  filtered.forEach((s) => {
    const fac = s.faculty || "—";
    const course = s.course || "—";
    const sem = s.semester || "—";
    const sec = s.section || "";
    if (!grouped[fac]) grouped[fac] = {};
    if (!grouped[fac][course]) grouped[fac][course] = {};
    if (!grouped[fac][course][sem]) grouped[fac][course][sem] = {};
    if (!grouped[fac][course][sem][sec]) grouped[fac][course][sem][sec] = [];
    grouped[fac][course][sem][sec].push(s);
  });
  const sortedFaculties = Object.keys(grouped).sort();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Total enrolled: <strong>{allStudents.length}</strong> · Showing:{" "}
            {filtered.length}
          </p>
          <p className="text-amber-600 text-xs mt-1">
            Click on a student to view concession & details.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/students/import"
            className="bg-white border border-indigo-300 text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium"
          >
            📥 Import
          </Link>
          <Link
            href="/students/add"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-100">
          <div className="text-lg font-bold text-indigo-700">
            {allStudents.length}
          </div>
          <div className="text-xs text-indigo-500">Total</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
          <div className="text-lg font-bold text-green-700">
            {allStudents.filter((s) => s.fee_status === "paid").length}
          </div>
          <div className="text-xs text-green-500">Fees Paid</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-100">
          <div className="text-lg font-bold text-yellow-700">
            {allStudents.filter((s) => s.fee_status !== "paid").length}
          </div>
          <div className="text-xs text-yellow-600">Pending</div>
        </div>
      </div>

      {/* Filter */}
      <form
        method="GET"
        action="/students"
        className="bg-white rounded-xl border border-gray-100 p-3 mb-4 shadow-sm flex flex-col gap-2"
      >
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="🔍 Name, roll no, phone..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <div className="flex gap-2">
          <select
            name="faculty"
            defaultValue={selectedFaculty}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All Faculties</option>
            {faculties.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <select
            name="year"
            defaultValue={selectedYear}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Filter
          </button>
          {(search || selectedFaculty || selectedYear) && (
            <a
              href="/students"
              className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm"
            >
              ✕
            </a>
          )}
        </div>
      </form>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
          No students found.
        </div>
      ) : (
        <div className="space-y-5">
          {sortedFaculties.map((fac) => {
            const courses = Object.keys(grouped[fac]).sort();
            const facTotal = courses.reduce(
              (sum, course) =>
                sum +
                Object.values(grouped[fac][course]).reduce(
                  (s, arr) => s + arr.length,
                  0,
                ),
              0,
            );
            return (
              <div
                key={fac}
                className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden"
              >
                <div className="bg-indigo-600 px-4 py-2.5 flex justify-between items-center">
                  <span className="text-white font-bold text-sm">{fac}</span>
                  <span className="bg-white text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {facTotal} students
                  </span>
                </div>
                {courses.map((course) => {
                  const semesters = Object.keys(grouped[fac][course]).sort();
                  const courseTotal = semesters.reduce(
                    (sum, sem) => Object.values(grouped[fac][course][sem]).reduce((s2, arr) => s2 + arr.length, 0) + sum,
                    0,
                  );
                  return (
                    <div key={course} className="border-t border-gray-100">
                      <div className="bg-indigo-50 px-4 py-2 flex justify-between items-center">
                        <span className="text-indigo-700 font-semibold text-xs">
                          {course}
                        </span>
                        <span className="text-indigo-500 text-xs">
                          {courseTotal} students
                        </span>
                      </div>
                      {semesters.map((sem) => {
                        const sections = Object.keys(grouped[fac][course][sem]).sort();
                        const semTotal = sections.reduce((s2, sec) => s2 + grouped[fac][course][sem][sec].length, 0);
                        return (
                          <div key={sem} className="border-t border-gray-50">
                            <div className="bg-gray-50 px-4 py-1.5 flex justify-between items-center">
                              <span className="text-gray-500 font-medium text-xs">
                                Sem {sem}
                              </span>
                              <span className="text-gray-400 text-xs">
                                {semTotal} students
                              </span>
                            </div>
                            <div className="divide-y divide-gray-50">
                              {sections.flatMap((sec) => { return grouped[fac][course][sem][sec].map((student, idx) => (
                                <div
                                  key={student.id}
                                  className="px-4 py-2.5 flex justify-between items-center"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-xs text-gray-400 w-5 shrink-0">
                                      {idx + 1}.
                                    </span>
                                    <div className="min-w-0">
                                      <Link
                                        href={`/students/${student.id}`}
                                        className="text-sm font-medium text-gray-900 truncate hover:text-indigo-600"
                                      >
                                        {student.name}
                                      </Link>
                                      <p className="text-xs text-gray-400">
                                        Roll {student.roll_number || "—"} ·{" "}
                                        {student.phone || "—"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-2 shrink-0">
                                    <Link
                                      href={`/students/${student.id}/edit`}
                                      className="text-xs text-indigo-600 font-medium"
                                    >
                                      Edit
                                    </Link>
                                    <form
                                      method="POST"
                                      action="/api/students/delete"
                                      className="inline"
                                    >
                                      <input
                                        type="hidden"
                                        name="id"
                                        value={student.id}
                                      />
                                      <button
                                        type="submit"
                                        className="text-xs text-red-500 font-medium"
                                      >
                                        Delete
                                      </button>
                                    </form>
                                  </div>
                                </div>
                              )); })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}