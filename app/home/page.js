export const dynamic = "force-dynamic";

import Link from "next/link";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  students, professors, fees, attendance,
  professor_attendance, exams, notices,
  college_settings, exam_forms, users,
} from "@/lib/schema";
import AttendanceSnapshot from "@/app/dashboard/AttendanceSnapshot";
import { sql, eq, and } from "drizzle-orm";

const TILES = [
  { href: "/students", icon: "🎓", label: "Students", desc: "Add, edit, manage" },
  { href: "/professors", icon: "👨‍🏫", label: "Professors", desc: "Staff & PIN login" },
  { href: "/professor-login", icon: "🔑", label: "Professor Login", desc: "PIN-based access" },
  { href: "/student/login", icon: "👨‍🎓", label: "Student Login", desc: "Student portal" },
  { href: "/fees", icon: "💰", label: "Fees", desc: "Fee collection" },
  { href: "/fee-structure", icon: "🏷️", label: "Fee Structure", desc: "Class-wise fees" },
  { href: "/attendance", icon: "✅", label: "Attendance", desc: "Daily attendance" },
  { href: "/exams", icon: "📝", label: "Exams & Results", desc: "Schedule & marks" },
  { href: "/exam-forms", icon: "📋", label: "Exam Forms", desc: "University forms" },
  { href: "/marksheet", icon: "📄", label: "Marksheet", desc: "Print marksheets" },
  { href: "/certificates", icon: "🏅", label: "Certificates", desc: "TC, Bonafide etc." },
  { href: "/timetable", icon: "🗓️", label: "Timetable", desc: "Class schedule" },
  { href: "/notices", icon: "📢", label: "Notices", desc: "Notice board" },
  { href: "/reports", icon: "📊", label: "Reports", desc: "NAAC & analytics" },
  { href: "/admissions", icon: "📥", label: "Admissions", desc: "New applications" },
  { href: "/settings", icon: "⚙️", label: "Settings", desc: "College profile" },
];

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  const [
    [studentCount],
    [professorCount],
    [pendingFees],
    [paidFees],
    [examCount],
    [pendingExamForms],
    settingsRows,
  ] = await Promise.all([
    db.select({ count: sql`COUNT(*)` }).from(students),
    db.select({ count: sql`COUNT(*)` }).from(professors),
    db.select({ total: sql`SUM(amount - paid_amount)`, count: sql`COUNT(*)` }).from(fees).where(and(sql`status IN ('pending', 'partial')`)),
    db.select({ total: sql`SUM(paid_amount)` }).from(fees),
    db.select({ count: sql`COUNT(*)` }).from(exams),
    db.select({ count: sql`COUNT(*)` }).from(exam_forms).where(and(sql`form_status = 'pending'`)),
    db.select().from(college_settings),
  ]);

  const settings = settingsRows[0] || null;
  const settingsIncomplete = !settings?.college_name || !settings?.principal_name;

  const studAttRows = await db
    .select({ name: students.name, course: students.course, semester: students.semester, status: attendance.status, student_id: attendance.student_id })
    .from(attendance)
    .leftJoin(students, eq(attendance.student_id, students.id))
    .where(and(eq(attendance.date, today)));

  const semMap = {};
  const markedStudentIds = new Set();
  studAttRows.forEach((r) => {
    const key = (r.course || "—") + "||" + (r.semester || "—");
    if (!semMap[key]) semMap[key] = { present: [], absent: [], na: [] };
    if (r.status === "present") semMap[key].present.push(r.name);
    else if (r.status === "absent") semMap[key].absent.push(r.name);
    markedStudentIds.add(r.student_id);
  });

  const allStudentsForNA = await db.select({ id: students.id, name: students.name, course: students.course, semester: students.semester }).from(students);
  allStudentsForNA.forEach((s) => {
    if (!markedStudentIds.has(s.id)) {
      const key = (s.course || "—") + "||" + (s.semester || "—");
      if (!semMap[key]) semMap[key] = { present: [], absent: [], na: [] };
      semMap[key].na.push(s.name);
    }
  });

  const semKeys = Object.keys(semMap).sort();

  const profAttRows = await db
    .select({ name: professors.name, professor_id: professor_attendance.professor_id, status: professor_attendance.status })
    .from(professor_attendance)
    .leftJoin(professors, eq(professor_attendance.professor_id, professors.id))
    .where(and(eq(professor_attendance.date, today)));

  const profPresentList = profAttRows.filter((r) => r.status === "present").map((r) => r.name);
  const profAbsentList = profAttRows.filter((r) => r.status === "absent").map((r) => r.name || "Unknown");
  const markedProfIds = new Set(profAttRows.map((r) => r.professor_id));
  const allProfsForNA = await db.select({ id: professors.id, name: professors.name }).from(professors);
  const profNAList = allProfsForNA.filter((p) => !markedProfIds.has(p.id)).map((p) => p.name);

  return (
    <div className="pt-2">
      {/* College Header */}
      {settings?.college_name && (
        <div className="flex items-center gap-3 mb-5 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
          {settings.logo_url && <img src={settings.logo_url} alt="Logo" className="h-12 w-12 object-contain rounded" />}
          <div>
            <p className="text-base font-bold text-gray-900">{settings.college_name}</p>
            {settings.university_name && <p className="text-xs text-gray-400">{settings.university_name}</p>}
            {settings.principal_name && <p className="text-xs text-gray-500">Principal: {settings.principal_name}</p>}
          </div>
        </div>
      )}

      {/* Welcome */}
      <div className="mb-5">
        <p className="text-gray-500 text-sm">Welcome back,</p>
        <h1 className="text-2xl font-bold text-gray-800">{session.name?.split(" ")[0] || "Admin"}</h1>
        <span className="inline-block mt-1 text-xs font-semibold uppercase tracking-wide text-white bg-indigo-500 px-2 py-0.5 rounded-full">Principal</span>
      </div>

      {/* Settings alert */}
      {settingsIncomplete && (
        <Link href="/settings" className="block bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
          <p className="text-sm font-semibold text-amber-800">⚠️ College settings incomplete</p>
          <p className="text-xs text-amber-600 font-medium mt-0.5">Go to Settings →</p>
        </Link>
      )}

      {/* Exam Forms Alert */}
      {Number(pendingExamForms?.count) > 0 && (
        <Link href="/exam-forms" className="block bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
          <p className="text-sm font-semibold text-red-800">📋 {pendingExamForms.count} Exam Form{Number(pendingExamForms.count) > 1 ? "s" : ""} Pending</p>
          <p className="text-xs text-red-600 font-medium mt-0.5">Review Now →</p>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">🎓</div>
          <div className="text-2xl font-bold text-gray-900">{studentCount?.count || 0}</div>
          <div className="text-xs text-gray-500 mt-0.5">Total Students</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">👨‍🏫</div>
          <div className="text-2xl font-bold text-gray-900">{professorCount?.count || 0}</div>
          <div className="text-xs text-gray-500 mt-0.5">Total Professors</div>
        </div>
        <Link href="/fees/summary?status=pending" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">⚠️</div>
          <div className="text-2xl font-bold text-red-600">₹{pendingFees?.total || 0}</div>
          <div className="text-xs text-gray-500 mt-0.5">Pending Fees ({pendingFees?.count || 0})</div>
          <div className="text-xs text-indigo-500 mt-1">Student-wise →</div>
        </Link>
        <Link href="/fees/summary?status=paid" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-2xl font-bold text-indigo-600">₹{paidFees?.total || 0}</div>
          <div className="text-xs text-gray-500 mt-0.5">Fees Collected</div>
          <div className="text-xs text-indigo-500 mt-1">Student-wise →</div>
        </Link>
      </div>

      {/* Attendance Snapshot */}
      <AttendanceSnapshot semMap={semMap} semKeys={semKeys} profPresentList={profPresentList} profAbsentList={profAbsentList} profNAList={profNAList} />

      {/* Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
        {TILES.map((tile) => (
          <Link key={tile.href} href={tile.href}
            className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-2 active:scale-95 transition hover:border-indigo-300 hover:bg-indigo-50">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-indigo-100 text-indigo-700">
              {tile.icon}
            </div>
            <div>
              <p className="font-semibold text-sm text-indigo-900">{tile.label}</p>
              <p className="text-xs text-gray-400">{tile.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}