export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  students,
  attendance,
  fees,
  results,
  exams,
  notices,
} from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function StudentDashboardPage() {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("student_session")?.value;

  if (!studentId) redirect("/student/login");

  const studentResult = await db
    .select()
    .from(students)
    .where(eq(students.id, parseInt(studentId)));
  if (studentResult.length === 0) redirect("/student/login");
  const student = studentResult[0];

  const attendanceRecords = await db
    .select()
    .from(attendance)
    .where(eq(attendance.student_id, student.id));
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(
    (a) => a.status === "present",
  ).length;
  const attendancePercent =
    totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

  const feeRecords = await db
    .select()
    .from(fees)
    .where(eq(fees.student_id, student.id));
  const pendingFees = feeRecords.filter((f) => f.status === "pending");

  const allNotices = await db
    .select()
    .from(notices)
    .where(eq(notices.user_id, student.user_id))
    .orderBy(notices.created_at)
    .limit(5);

  const examResults = await db
    .select({
      marks_obtained: results.marks_obtained,
      grade: results.grade,
      exam_name: exams.name,
      subject: exams.subject,
      max_marks: exams.max_marks,
    })
    .from(results)
    .leftJoin(exams, eq(results.exam_id, exams.id))
    .where(eq(results.student_id, student.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-900 text-white px-8 py-4 flex justify-between items-center">
        <div className="font-bold text-lg">
          Nishant PG college — Students Portal
        </div>
        <div className="flex items-center gap-4">
          <span className="text-indigo-200 text-sm">{student.name}</span>
          <a
            href="/api/student/logout"
            className="text-red-300 text-sm hover:text-red-100"
          >
            Logout
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>{" "}
              <span className="font-medium">{student.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Course:</span>{" "}
              <span className="font-medium">
                {student.course} — Sem {student.semester}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Roll No:</span>{" "}
              <span className="font-medium">{student.roll_number}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600">
              {attendancePercent}%
            </div>
            <div className="text-sm text-gray-500 mt-1">Attendance</div>
            <div className="text-xs text-gray-400 mt-1">
              {presentDays} / {totalDays} days
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-yellow-500">
              {pendingFees.length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Pending Fees</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {examResults.length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Exams Appeared</div>
          </div>
        </div>

        {examResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Exam Results</h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Exam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Marks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {examResults.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {r.exam_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {r.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {r.marks_obtained} / {r.max_marks}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          r.grade === "A+" || r.grade === "A"
                            ? "bg-green-100 text-green-700"
                            : r.grade === "B"
                              ? "bg-blue-100 text-blue-700"
                              : r.grade === "C"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {allNotices.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Notices</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {allNotices.map((n) => (
                <div key={n.id} className="px-6 py-4">
                  <div className="font-medium text-gray-900 text-sm">
                    {n.title}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">{n.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
