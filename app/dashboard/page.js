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
  exams,
  notices,
  college_settings,
  exam_forms,
} from "@/lib/schema";
import { sql } from "drizzle-orm";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  const [
    [studentCount],
    [professorCount],
    [pendingFees],
    [paidFees],
    [todayPresent],
    [todayAbsent],
    [examCount],
    [noticeCount],
    [pendingExamForms],
    allStudents,
    recentNotices,
    upcomingExams,
    settingsRows,
  ] = await Promise.all([
    db.select({ count: sql`COUNT(*)` }).from(students),
    db.select({ count: sql`COUNT(*)` }).from(professors),
    db
      .select({ total: sql`SUM(amount)`, count: sql`COUNT(*)` })
      .from(fees)
      .where(sql`status = 'pending'`),
    db
      .select({ total: sql`SUM(amount)` })
      .from(fees)
      .where(sql`status = 'paid'`),
    db
      .select({ count: sql`COUNT(*)` })
      .from(attendance)
      .where(sql`date = ${today} AND status = 'present'`),
    db
      .select({ count: sql`COUNT(*)` })
      .from(attendance)
      .where(sql`date = ${today} AND status = 'absent'`),
    db.select({ count: sql`COUNT(*)` }).from(exams),
    db.select({ count: sql`COUNT(*)` }).from(notices),
    db
      .select({ count: sql`COUNT(*)` })
      .from(exam_forms)
      .where(sql`form_status = 'pending'`),
    db.select({ faculty: students.faculty }).from(students),
    db
      .select()
      .from(notices)
      .orderBy(sql`created_at DESC`)
      .limit(3),
    db
      .select()
      .from(exams)
      .where(sql`exam_date >= ${today}`)
      .orderBy(sql`exam_date ASC`)
      .limit(3),
    db.select().from(college_settings).limit(1),
  ]);

  const settings = settingsRows[0] || null;
  const settingsIncomplete =
    !settings?.college_name || !settings?.principal_name;

  const facultyCount = {};
  allStudents.forEach((s) => {
    const f = s.faculty || "Other";
    facultyCount[f] = (facultyCount[f] || 0) + 1;
  });

  return (
    <div className="space-y-4">
      {/* College Header */}
      {settings?.college_name && (
        <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
          {settings.logo_url && (
            <img
              src={settings.logo_url}
              alt="Logo"
              className="h-12 w-12 object-contain rounded shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-900 truncate">
              {settings.college_name}
            </p>
            {settings.university_name && (
              <p className="text-xs text-gray-400 truncate">
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
      )}

      {/* Page Header */}
      <div className="flex justify-between items-center">
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
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm shrink-0"
        >
          + Student
        </Link>
      </div>

      {/* Alerts */}
      {settingsIncomplete && (
        <Link
          href="/settings"
          className="block bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3"
        >
          <p className="text-sm font-semibold text-yellow-800">
            ⚠️ College Settings Incomplete
          </p>
          <p className="text-xs text-yellow-700 mt-0.5">
            Fill in college name and principal name — otherwise certificates
            will be blank.
          </p>
          <p className="text-xs text-yellow-600 font-medium mt-1">
            Go to Settings →
          </p>
        </Link>
      )}

      {Number(pendingExamForms?.count) > 0 && (
        <Link
          href="/exam-forms"
          className="block bg-red-50 border border-red-200 rounded-xl px-4 py-3"
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

      {Number(todayPresent?.count) === 0 &&
        Number(todayAbsent?.count) === 0 &&
        Number(studentCount?.count) > 0 && (
          <Link
            href={`/attendance/mark?date=${today}`}
            className="block bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3"
          >
            <p className="text-sm font-semibold text-indigo-800">
              Attendance not marked yet for today
            </p>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">
              Mark Now →
            </p>
          </Link>
        )}

      {/* Stats — 2 col on mobile, 4 col on md+ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: "🎓",
            value: studentCount?.count || 0,
            label: "Total Students",
          },
          {
            icon: "👨‍🏫",
            value: professorCount?.count || 0,
            label: "Total Professors",
          },
          {
            icon: "⚠️",
            value: `₹${pendingFees?.total || 0}`,
            label: `Pending (${pendingFees?.count || 0})`,
            red: true,
          },
          {
            icon: "✅",
            value: `₹${paidFees?.total || 0}`,
            label: "Fees Collected",
            green: true,
          },
          {
            icon: "🟢",
            value: todayPresent?.count || 0,
            label: "Present Today",
            green: true,
          },
          {
            icon: "🔴",
            value: todayAbsent?.count || 0,
            label: "Absent Today",
            red: true,
          },
          { icon: "📝", value: examCount?.count || 0, label: "Total Exams" },
          { icon: "📋", value: noticeCount?.count || 0, label: "Notices" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div
              className={`text-2xl font-bold ${stat.red ? "text-red-600" : stat.green ? "text-green-600" : "text-gray-900"}`}
            >
              {stat.value}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Faculty-wise Breakdown */}
      {Object.keys(facultyCount).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">
            Faculty-wise Students
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(facultyCount).map(([faculty, count]) => (
              <div
                key={faculty}
                className="bg-indigo-50 rounded-lg px-3 py-2 flex justify-between items-center"
              >
                <span className="text-xs font-medium text-indigo-700 truncate mr-2">
                  {faculty}
                </span>
                <span className="text-xs font-bold text-indigo-900 shrink-0">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { href: "/students/add", label: "➕ Add Student" },
            { href: "/fees/add", label: "💰 Record Fee" },
            { href: `/attendance/mark?date=${today}`, label: "✅ Attendance" },
            { href: "/professor-attendance", label: "👨‍🏫 Prof. Attendance" },
            { href: "/exam-forms", label: "📋 Exam Forms" },
            { href: "/exams/add", label: "📝 Schedule Exam" },
            { href: "/notices/add", label: "📢 Post Notice" },
            { href: "/reports", label: "📊 Reports" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center text-xs text-indigo-600 font-medium bg-indigo-50 rounded-lg px-3 py-2.5 hover:bg-indigo-100 active:bg-indigo-200 transition"
            >
              {action.label}
            </Link>
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
          <div className="divide-y divide-gray-50">
            {upcomingExams.map((exam) => (
              <div
                key={exam.id}
                className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 mr-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {exam.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {exam.course}
                    {exam.semester ? ` · Sem ${exam.semester}` : ""} ·{" "}
                    {exam.subject}
                  </p>
                </div>
                <p className="text-xs text-indigo-600 font-medium shrink-0">
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
          <div className="divide-y divide-gray-50">
            {recentNotices.map((notice) => (
              <div key={notice.id} className="py-2.5 first:pt-0 last:pb-0">
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
  );
}
