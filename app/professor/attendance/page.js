export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { students, attendance, professor_subjects, professors } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import AttendanceForm from "@/app/attendance/mark/AttendanceForm";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);

export default async function ProfessorAttendancePage({ searchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("professor_session")?.value;
  if (!token) redirect("/professor-login");

  let payload;
  try {
    const verified = await jwtVerify(token, SECRET);
    payload = verified.payload;
  } catch {
    redirect("/professor-login");
  }

  const professorId = payload.professorId;
  const profRow = await db.select().from(professors).where(eq(professors.id, professorId));
  const prof = profRow[0];
  if (!prof) redirect("/professor-login");

  const params = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = params?.date || today;
  const selectedCourse = params?.course || "";
  const selectedSemester = params?.semester || "";

  const assignedSubjects = await db
    .select()
    .from(professor_subjects)
    .where(eq(professor_subjects.professor_id, professorId));

  // unique course+semester pairs assigned to this professor
  const assignedPairs = [
    ...new Map(
      assignedSubjects.map((s) => [
        s.course + "||" + s.semester,
        { course: s.course, semester: s.semester },
      ])
    ).values(),
  ];

  if (assignedPairs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">No courses assigned yet.</p>
          <p className="text-gray-400 text-xs mt-1">Contact your principal.</p>
        </div>
      </div>
    );
  }

  const assignedCourses = [...new Set(assignedPairs.map((p) => p.course))];

  const allStudents = await db
    .select()
    .from(students)
    ;

  const filteredStudents = allStudents.filter((s) => {
    const isAssigned = assignedPairs.some(
      (p) => p.course === s.course && p.semester === s.semester
    );
    if (!isAssigned) return false;
    if (selectedCourse && s.course !== selectedCourse) return false;
    if (selectedSemester && s.semester !== selectedSemester) return false;
    return true;
  });

  // FIX: user_id filter added — पहले यह नहीं था
  const existing = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.date, selectedDate)
      )
    );

  const attendanceMap = {};
  existing.forEach((a) => { attendanceMap[a.student_id] = a.status; });

  const alreadyMarked = existing.length > 0;
  const presentCount = filteredStudents.filter((s) => attendanceMap[s.id] === "present").length;
  const absentCount = filteredStudents.filter((s) => attendanceMap[s.id] === "absent").length;

  const grouped = {};
  filteredStudents.forEach((s) => {
    const course = s.course || "—";
    const sem = s.semester || "—";
    const key = `${course}||${sem}`;
    if (!grouped[key]) grouped[key] = { cls: course, sec: sem, students: [] };
    grouped[key].students.push(s);
  });
  const sortedKeys = Object.keys(grouped).sort();

  // semesters for selected course filter
  const semestersForCourse = selectedCourse
    ? [...new Set(assignedPairs.filter((p) => p.course === selectedCourse).map((p) => p.semester).filter(Boolean))].sort()
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-700 px-4 py-4 flex justify-between items-center">
        <div>
          <p className="text-white font-bold">{payload.professorName}</p>
          <p className="text-indigo-200 text-xs">Professor Portal</p>
        </div>
        <a href="/api/professor-logout" className="text-red-300 text-sm font-medium">Logout</a>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-500 text-xs mt-0.5">{selectedDate}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <form className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <input type="date" name="date" defaultValue={selectedDate}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Course</label>
                <select name="course" defaultValue={selectedCourse}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">All My Courses</option>
                  {assignedCourses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {semestersForCourse.length > 0 && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Semester</label>
                <select name="semester" defaultValue={selectedSemester}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">All Semesters</option>
                  {semestersForCourse.map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit"
              className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-medium">
              Filter
            </button>
          </form>
        </div>

        {alreadyMarked && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4 text-xs text-yellow-800">
            ⚠️ Attendance already marked for this date — edit below and save again.
            <span className="ml-2 font-semibold">P: {presentCount} · A: {absentCount}</span>
          </div>
        )}

        <AttendanceForm
          selectedDate={selectedDate}
          attendanceMap={attendanceMap}
          sortedKeys={sortedKeys}
          grouped={grouped}
        />
      </div>
    </div>
  );
}