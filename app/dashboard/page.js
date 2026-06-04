// app/dashboard/page.js
export const dynamic = "force-dynamic";

import Link from "next/link";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  students,
  professors,
  fees,
  attendance,
  professor_attendance,
  exams,
  notices,
  college_settings,
  exam_forms,
  users,
} from "@/lib/schema";
import AttendanceSnapshot from "./AttendanceSnapshot";
import { sql, eq, and } from "drizzle-orm";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/login");

  const today = new Date().toISOString().split("T")[0];
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));
  const user = userResult[0];

  const [
    [studentCount],
    [professorCount],
    [pendingFees],
    [paidFees],
    [examCount],
    [noticeCount],
    [pendingExamForms],
    allStudents,
    recentNotices,
    upcomingExams,
    settingsRows,
  ] = await Promise.all([
    db
      .select({ count: sql`COUNT(*)` })
      .from(students)
      .where(eq(students.user_id, 1)),

    db
      .select({ count: sql`COUNT(*)` })
      .from(professors)
      .where(eq(professors.user_id, 1)),

    db
      .select({ total: sql`SUM(amount)`, count: sql`COUNT(*)` })
      .from(fees)
      .where(and(sql`status = 'pending'`, eq(fees.user_id, 1))),

    db
      .select({ total: sql`SUM(amount)` })
      .from(fees)
      .where(and(sql`status = 'paid'`, eq(fees.user_id, 1))),

    db
      .select({ count: sql`COUNT(*)` })
      .from(exams)
      .where(eq(exams.user_id, 1)),

    db
      .select({ count: sql`COUNT(*)` })
      .from(notices)
      .where(eq(notices.user_id, 1)),

    db
      .select({ count: sql`COUNT(*)` })
      .from(exam_forms)
      .where(and(sql`form_status = 'pending'`, eq(exam_forms.user_id, 1))),

    db
      .select({ faculty: students.faculty })
      .from(students)
      .where(eq(students.user_id, 1)),

    db
      .select()
      .from(notices)
      .where(eq(notices.user_id, 1))
      .orderBy(sql`created_at DESC`)
      .limit(3),

    db
      .select()
      .from(exams)
      .where(and(sql`exam_date >= ${today}`, eq(exams.user_id, 1)))
      .orderBy(sql`exam_date ASC`)
      .limit(3),

    db.select().from(college_settings).where(eq(college_settings.user_id, 1)),
  ]);

  const settings = settingsRows[0] || null;
  const settingsIncomplete =
    !settings?.college_name || !settings?.principal_name;

  const facultyCount = {};
  allStudents.forEach((s) => {
    const f = s.faculty || "Other";
    facultyCount[f] = (facultyCount[f] || 0) + 1;
  });

  // Course+semester wise student attendance today
  const studAttRows = await db
    .select({
      name: students.name,
      course: students.course,
      semester: students.semester,
      status: attendance.status,
      student_id: attendance.student_id,
    })
    .from(attendance)
    .leftJoin(students, eq(attendance.student_id, students.id))
    .where(and(eq(attendance.user_id, 1), eq(attendance.date, today)));

  const semMap = {};
  const markedStudentIds = new Set();
  studAttRows.forEach((r) => {
    const key = (r.course || "—") + "||" + (r.semester || "—");
    if (!semMap[key]) semMap[key] = { present: [], absent: [], na: [] };
    if (r.status === "present") semMap[key].present.push(r.name);
    else if (r.status === "absent") semMap[key].absent.push(r.name);
    markedStudentIds.add(r.student_id);
  });
  const allStudentsForNA = await db
    .select({
      id: students.id,
      name: students.name,
      course: students.course,
      semester: students.semester,
    })
    .from(students)
    .where(eq(students.user_id, 1));
  allStudentsForNA.forEach((s) => {
    if (!markedStudentIds.has(s.id)) {
      const key = (s.course || "—") + "||" + (s.semester || "—");
      if (!semMap[key]) semMap[key] = { present: [], absent: [], na: [] };
      semMap[key].na.push(s.name);
    }
  });
  const semKeys = Object.keys(semMap).sort((a, b) => {
    const [ac, as_] = a.split("||");
    const [bc, bs] = b.split("||");
    const cc = ac.localeCompare(bc);
    if (cc !== 0) return cc;
    return parseInt(as_) - parseInt(bs);
  });

  // Professor attendance today
  const profAttRows = await db
    .select({
      name: professors.name,
      professor_id: professor_attendance.professor_id,
      status: professor_attendance.status,
    })
    .from(professor_attendance)
    .leftJoin(professors, eq(professor_attendance.professor_id, professors.id))
    .where(
      and(
        eq(professor_attendance.user_id, 1),
        eq(professor_attendance.date, today),
      ),
    );

  const profPresentList = profAttRows
    .filter((r) => r.status === "present")
    .map((r) => r.name);
  const profAbsentList = profAttRows
    .filter((r) => r.status === "absent")
    .map((r) => r.name || "Unknown");
  const markedProfIds = new Set(profAttRows.map((r) => r.professor_id));
  const allProfsForNA = await db
    .select({ id: professors.id, name: professors.name })
    .from(professors)
    .where(eq(professors.user_id, 1));
  const profNAList = allProfsForNA
    .filter((p) => !markedProfIds.has(p.id))
    .map((p) => p.name);

  return (
    <div>
      {/* College Header */}
      {settings?.college_name ? (
        <div className="flex items-center gap-3 mb-5 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
          {settings.logo_url && (
            <img
              src={settings.logo_url}
              alt="Logo"
              className="h-12 w-12 object-contain rounded"
            />
          )}
          <div>
            <p className="text-base font-bold text-gray-900">
              {settings.college_name}
            </p>
            {settings.university_name && (
              <p className="text-xs text-gray-400">
                {settings.university_name}
              </p>
            )}
            {settings.principal_name && (
              <p className="text-xs text-gray-500">
                Principal: {settings.principal_name}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Link
          href="/students/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
        >
          + Student
        </Link>
      </div>

      {/* Settings warning */}
      {settingsIncomplete && (
        <Link
          href="/settings"
          className="block bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3 mb-5"
        >
          <p className="text-sm font-semibold text-yellow-800">
            ⚠️ College Settings Incomplete
          </p>
          <p className="text-xs text-yellow-700 mt-0.5">
            Fill in college name and Principal name — otherwise certificates
            will be blank.
          </p>
          <p className="text-xs text-yellow-600 font-medium mt-1">
            Go to Settings →
          </p>
        </Link>
      )}

      {/* Exam Forms Alert */}
      {Number(pendingExamForms?.count) > 0 && (
        <Link
          href="/exam-forms"
          className="block bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5"
        >
          <p className="text-sm font-semibold text-red-800">
            📋 {pendingExamForms.count} Exam Form
            {Number(pendingExamForms.count) > 1 ? "s" : ""} Pending
          </p>
          <p className="text-xs text-red-600 font-medium mt-0.5">
            Review Now →
          </p>
        </Link>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">🎓</div>
          <div className="text-2xl font-bold text-gray-900">
            {studentCount?.count || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Total Students</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">👨‍🏫</div>
          <div className="text-2xl font-bold text-gray-900">
            {professorCount?.count || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Total Professors</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">⚠️</div>
          <div className="text-2xl font-bold text-red-600">
            ₹{pendingFees?.total || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Pending Fees ({pendingFees?.count || 0})
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-2xl font-bold text-green-600">
            ₹{paidFees?.total || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Fees Collected</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">📝</div>
          <div className="text-2xl font-bold text-gray-900">
            {examCount?.count || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Total Exams</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">📋</div>
          <div className="text-2xl font-bold text-gray-900">
            {noticeCount?.count || 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Notices</div>
        </div>
      </div>

      {/* Faculty-wise Breakdown */}
      {Object.keys(facultyCount).length > 0 && (
        <details className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <summary className="font-semibold text-gray-900 text-sm cursor-pointer">
            Faculty-wise Students —{" "}
            <span className="text-indigo-600 font-normal">click to view</span>
          </summary>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {Object.entries(facultyCount).map(([faculty, count]) => (
              <div
                key={faculty}
                className="bg-indigo-50 rounded-lg px-3 py-2 flex justify-between items-center"
              >
                <span className="text-xs font-medium text-indigo-700">
                  {faculty}
                </span>
                <span className="text-xs font-bold text-indigo-900">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}

      <AttendanceSnapshot
        semMap={semMap}
        semKeys={semKeys}
        profPresentList={profPresentList}
        profAbsentList={profAbsentList}
        profNAList={profNAList}
      />

      <div className="space-y-4">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: "/students/add", label: "➕ Add Student" },
              { href: "/fees/add", label: "💰 Record Fee" },
              { href: "/exam-forms", label: "📋 Exam Forms" },
              { href: "/exams/add", label: "📝 Schedule Exam" },
              { href: "/notices/add", label: "📢 Post Notice" },
              { href: "/reports", label: "📊 Reports" },
              {
                href: "/fee-structure/packages/add",
                label: "🏗️ Fee Structure",
              },
              { href: "/timetable", label: "🗓️ Timetable" },
              { href: "/professors/add", label: "👨‍🏫 Add Professor" },
              {
                href: `/professor-attendance?date=${today}`,
                label: "📋 Prof. Attendance",
              },
              { href: "/settings", label: "⚙️ Settings" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center text-xs text-indigo-600 font-medium bg-indigo-50 rounded-lg px-3 py-2.5 hover:bg-indigo-100"
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">
            Upcoming Exams
          </h2>
          {upcomingExams.length === 0 ? (
            <p className="text-xs text-gray-400">No upcoming exams.</p>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {exam.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {exam.course}{" "}
                      {exam.semester ? `· Sem ${exam.semester}` : ""} ·{" "}
                      {exam.subject}
                    </p>
                  </div>
                  <p className="text-xs text-indigo-600 font-medium">
                    {exam.exam_date}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">
            Recent Notices
          </h2>
          {recentNotices.length === 0 ? (
            <p className="text-xs text-gray-400">No notices yet.</p>
          ) : (
            <div className="space-y-3">
              {recentNotices.map((notice) => (
                <div key={notice.id}>
                  <p className="text-sm font-medium text-gray-900">
                    {notice.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {notice.category} ·{" "}
                    <span
                      className={
                        notice.priority === "urgent"
                          ? "text-red-500"
                          : notice.priority === "important"
                            ? "text-yellow-500"
                            : "text-gray-400"
                      }
                    >
                      {notice.priority}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
