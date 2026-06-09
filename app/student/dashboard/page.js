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
  const pendingFees = feeRecords.filter(
    (f) => f.status === "pending" || f.status === "partial",
  );

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
      <nav className="bg-indigo-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="font-bold text-lg">Nishant PG College — Student Portal</div>
        <div className="flex items-center gap-4">
          <span className="text-indigo-200 text-sm">{student.name}</span>
          <a href="/api/student/logout" className="text-red-300 text-sm hover:text-red-100">
            Logout
          </a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Profile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Profile</h2>
          <div className="flex items-center gap-4 mb-4">
            {student.photo_url ? (
              <img
                src={student.photo_url}
                alt={student.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl shrink-0">
                👤
              </div>
            )}
            <div>
              <p className="text-base font-bold text-gray-900">{student.name}</p>
              <p className="text-sm text-indigo-600">{student.course} — {student.semester}</p>
              <p className="text-xs text-gray-500 mt-0.5">Roll No: {student.roll_number}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm border-t border-gray-100 pt-3">
            {student.father_name && (
              <div>
                <span className="text-gray-400 text-xs">Father</span>
                <p className="font-medium text-gray-800">{student.father_name}</p>
              </div>
            )}
            {student.phone && (
              <div>
                <span className="text-gray-400 text-xs">Phone</span>
                <p className="font-medium text-gray-800">{student.phone}</p>
              </div>
            )}
            {student.admission_no && (
              <div>
                <span className="text-gray-400 text-xs">Admission No</span>
                <p className="font-medium text-gray-800">{student.admission_no}</p>
              </div>
            )}
            {student.academic_year && (
              <div>
                <span className="text-gray-400 text-xs">Academic Year</span>
                <p className="font-medium text-gray-800">{student.academic_year}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className={`text-2xl font-bold ${Number(attendancePercent) >= 75 ? "text-indigo-600" : "text-red-500"}`}>
              {attendancePercent}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Attendance</div>
            <div className="text-xs text-gray-400">{presentDays}/{totalDays} days</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">
              ₹{pendingFees.reduce((s, f) => s + ((f.amount || 0) - (f.paid_amount || 0)), 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Pending Fees</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{examResults.length}</div>
            <div className="text-xs text-gray-500 mt-1">Exams</div>
          </div>
        </div>

        {/* Fee Details */}
        {feeRecords.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-sm">Fee Details</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {feeRecords.map((f) => {
                const balance = (f.amount || 0) - (f.paid_amount || 0);
                return (
                  <div key={f.id} className="px-5 py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{f.fee_type || "Fee"}</p>
                      <p className="text-xs text-gray-400">
                        Due: {f.due_date ? new Date(Number(f.due_date) * 1000).toLocaleDateString("en-IN") : "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₹{f.amount}</p>
                      {f.paid_amount > 0 && <p className="text-xs text-indigo-600">Paid ₹{f.paid_amount}</p>}
                      {balance > 0 && <p className="text-xs text-red-500">Due ₹{balance}</p>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        f.status === "paid" ? "bg-indigo-100 text-indigo-700" :
                        f.status === "partial" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {f.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Exam Results */}
        {examResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-sm">Exam Results</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {examResults.map((r, i) => (
                <div key={i} className="px-5 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.exam_name}</p>
                    <p className="text-xs text-gray-500">{r.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{r.marks_obtained}/{r.max_marks}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r.grade === "A+" || r.grade === "A" ? "bg-indigo-100 text-indigo-700" :
                      r.grade === "B" ? "bg-blue-100 text-blue-700" :
                      r.grade === "C" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {r.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notices */}
        {allNotices.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-sm">Notices</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {allNotices.map((n) => (
                <div key={n.id} className="px-5 py-4">
                  <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                  <p className="text-gray-500 text-xs mt-1">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}