export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import {
  exams,
  students,
  results,
  college_settings,
  users,
} from "@/lib/schema";
import { eq, and, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import PrintButton from "./PrintButton";

export default async function MarksheetViewPage({ searchParams }) {
  const params = await searchParams;
  const selectedCourse = params?.course || "";
  const selectedSemester = params?.semester || "";
  const selectedType = params?.type || "";
  const selectedYear = params?.year || "";

  if (!selectedCourse || !selectedType) notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) notFound();
  const session = await getSession(token);
  if (!session) notFound();

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));
  const user = userResult[0];
  if (!user) notFound();

  const settingsRows = await db
    .select()
    .from(college_settings)
    .where(eq(college_settings.user_id, 1));
  const college = settingsRows[0] || {};

  const studentConditions = [
    eq(students.course, selectedCourse),
    eq(students.user_id, 1),
  ];
  if (selectedSemester)
    studentConditions.push(eq(students.semester, selectedSemester));

  const courseStudents = await db
    .select()
    .from(students)
    .where(and(...studentConditions))
    .orderBy(students.roll_number, students.name);

  if (courseStudents.length === 0) {
    return (
      <div>
        <div className="print:hidden flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Marksheet</h1>
          <a
            href="/marksheet"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
          >
            ← Back
          </a>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
          No students found in {selectedCourse}.
        </div>
      </div>
    );
  }

  const conditions = [
    eq(exams.course, selectedCourse),
    eq(exams.exam_type, selectedType),
    eq(exams.user_id, 1),
  ];
  if (selectedSemester) conditions.push(eq(exams.semester, selectedSemester));
  if (selectedYear) conditions.push(eq(exams.academic_year, selectedYear));

  const courseExams = await db
    .select()
    .from(exams)
    .where(and(...conditions))
    .orderBy(exams.subject);

  if (courseExams.length === 0) {
    return (
      <div>
        <div className="print:hidden flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Marksheet</h1>
          <a
            href="/marksheet"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
          >
            ← Back
          </a>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
          No exams found for {selectedCourse} — {selectedType}
          {selectedYear ? ` (${selectedYear})` : ""}.
        </div>
      </div>
    );
  }

  const examIds = courseExams.map((e) => e.id);
  const allResults = await db
    .select()
    .from(results)
    .where(inArray(results.exam_id, examIds));

  const resultsMap = {};
  allResults.forEach((r) => {
    if (!resultsMap[r.student_id]) resultsMap[r.student_id] = {};
    resultsMap[r.student_id][r.exam_id] = r;
  });

  const examTypeLabel = {
    internal: "Internal Assessment",
    midterm: "Mid Term Examination",
    practical: "Practical Examination",
    annual: "Annual Examination",
  };

  return (
    <div>
      <div className="print:hidden flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Marksheet</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {selectedCourse} · {examTypeLabel[selectedType] || selectedType}
            {selectedYear ? ` · ${selectedYear}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton />
          <a
            href="/marksheet"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
          >
            ← Back
          </a>
        </div>
      </div>

      <div
        id="print-area"
        className="bg-white rounded-xl border border-gray-200 p-4 print:p-6 print:rounded-none print:border-0"
      >
        <div className="text-center mb-4 border-b border-gray-300 pb-3">
          {college.logo_url && (
            <img
              src={college.logo_url}
              alt="Logo"
              className="h-14 w-14 object-contain mx-auto mb-1"
            />
          )}
          <h2 className="text-lg font-bold text-gray-900 uppercase">
            {college.college_name || "College Name"}
          </h2>
          {college.university_name && (
            <p className="text-xs text-gray-400">{college.university_name}</p>
          )}
          {college.address && (
            <p className="text-xs text-gray-500">{college.address}</p>
          )}
          <h3 className="text-sm font-bold text-gray-800 mt-2 underline underline-offset-2">
            {examTypeLabel[selectedType] || selectedType} — {selectedCourse}
            {selectedSemester ? ` · ${selectedSemester}` : ""}
            {selectedYear ? ` (${selectedYear})` : ""}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-gray-300">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="border border-gray-300 px-2 py-2 text-left w-6">
                  #
                </th>
                <th className="border border-gray-300 px-2 py-2 text-left min-w-[120px]">
                  Student Name
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center w-12">
                  Roll
                </th>
                {courseExams.map((exam) => (
                  <th
                    key={exam.id}
                    className="border border-gray-300 px-2 py-2 text-center min-w-[60px]"
                  >
                    {exam.subject}
                    <div className="font-normal text-indigo-200">
                      ({exam.max_marks})
                    </div>
                  </th>
                ))}
                <th className="border border-gray-300 px-2 py-2 text-center w-16">
                  Total
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center w-12">
                  %
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center w-12">
                  Grade
                </th>
                <th className="border border-gray-300 px-2 py-2 text-center w-16">
                  Result
                </th>
              </tr>
            </thead>
            <tbody>
              {courseStudents.map((student, idx) => {
                const studentResults = resultsMap[student.id] || {};
                const totalMax = courseExams.reduce(
                  (sum, e) => sum + e.max_marks,
                  0,
                );
                const totalObtained = courseExams.reduce((sum, e) => {
                  const r = studentResults[e.id];
                  return sum + (r ? r.marks_obtained : 0);
                }, 0);
                const percentage =
                  totalMax > 0
                    ? ((totalObtained / totalMax) * 100).toFixed(1)
                    : null;

                let grade = "—";
                let passed = true;
                if (totalMax > 0) {
                  const pct = (totalObtained / totalMax) * 100;
                  if (pct >= 90) grade = "A+";
                  else if (pct >= 75) grade = "A";
                  else if (pct >= 60) grade = "B";
                  else if (pct >= 45) grade = "C";
                  else if (pct >= 36) grade = "D";
                  else {
                    grade = "F";
                    passed = false;
                  }
                }

                courseExams.forEach((e) => {
                  const r = studentResults[e.id];
                  if (r && r.marks_obtained < e.passing_marks) passed = false;
                });

                return (
                  <tr
                    key={student.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border border-gray-200 px-2 py-1.5 text-center text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center text-gray-600">
                      {student.roll_number || "—"}
                    </td>
                    {courseExams.map((exam) => {
                      const r = studentResults[exam.id];
                      const failed = r && r.marks_obtained < exam.passing_marks;
                      return (
                        <td
                          key={exam.id}
                          className={`border border-gray-200 px-2 py-1.5 text-center font-medium ${failed ? "text-red-600" : "text-gray-800"}`}
                        >
                          {r ? r.marks_obtained : "—"}
                        </td>
                      );
                    })}
                    <td className="border border-gray-200 px-2 py-1.5 text-center font-bold text-gray-900">
                      {totalObtained}/{totalMax}
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center text-gray-700">
                      {percentage !== null ? `${percentage}%` : "—"}
                    </td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center font-bold text-indigo-700">
                      {grade}
                    </td>
                    <td
                      className={`border border-gray-200 px-2 py-1.5 text-center font-bold text-xs ${passed ? "text-green-600" : "text-red-600"}`}
                    >
                      {passed ? "Pass" : "Fail"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-medium">
                <td
                  colSpan={3}
                  className="border border-gray-300 px-2 py-1.5 text-xs text-gray-600"
                >
                  Max Marks
                </td>
                {courseExams.map((exam) => (
                  <td
                    key={exam.id}
                    className="border border-gray-300 px-2 py-1.5 text-center text-xs text-gray-600"
                  >
                    {exam.max_marks}
                  </td>
                ))}
                <td
                  colSpan={4}
                  className="border border-gray-300 px-2 py-1.5 text-center text-xs text-gray-600"
                >
                  Total: {courseExams.reduce((s, e) => s + e.max_marks, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-8 flex justify-between items-end text-xs text-gray-500">
          <p>Generated: {new Date().toLocaleDateString("en-IN")}</p>
          <div className="text-center">
            <div className="border-t border-gray-400 w-32 mb-1" />
            <p>Class Teacher</p>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 w-32 mb-1" />
            <p>{college.principal_name || "Principal"}</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
