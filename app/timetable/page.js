export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { timetable, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TimetablePage({ searchParams }) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/login");
  const userResult = await db.select().from(users).where(eq(users.email, session.email));
  const user = userResult[0];

  const params = await searchParams;
  const selectedCourse = params?.course || "";

  const courses = ["B.A.", "M.A.", "B.Com", "M.Com", "B.Sc.", "M.Sc.", "B.Sc. Ag.", "M.Sc. Ag."];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  let schedule = [];
  if (selectedCourse) {
    schedule = await db
      .select()
      .from(timetable)
      .where(and(eq(timetable.course, selectedCourse), eq(timetable.user_id, user.id)));
  }

  const scheduleMap = {};
  days.forEach((day) => { scheduleMap[day] = {}; });
  schedule.forEach((entry) => {
    if (!scheduleMap[entry.day]) scheduleMap[entry.day] = {};
    scheduleMap[entry.day][entry.period] = entry;
  });

  const maxPeriods = schedule.length > 0 ? Math.max(...schedule.map((s) => s.period)) : 8;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-500 text-xs mt-0.5">Course-wise weekly schedule</p>
        </div>
        {selectedCourse && (
          <Link href={`/timetable/add?course=${selectedCourse}`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Add Period
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <form className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Select Course</label>
            <select name="course" defaultValue={selectedCourse}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">-- Select Course --</option>
              {courses.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">
              Show
            </button>
          </div>
        </form>
      </div>

      {!selectedCourse ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 text-sm">
          Please select a course to view its timetable.
        </div>
      ) : schedule.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No timetable found for {selectedCourse}.{" "}
          <Link href={`/timetable/add?course=${selectedCourse}`} className="text-indigo-600">
            Add periods
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                {Array.from({ length: maxPeriods }, (_, i) => (
                  <th key={i + 1} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    P{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {days.map((day) => (
                <tr key={day} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">{day}</td>
                  {Array.from({ length: maxPeriods }, (_, i) => {
                    const entry = scheduleMap[day]?.[i + 1];
                    return (
                      <td key={i + 1} className="px-3 py-2 text-center">
                        {entry ? (
                          <div className="bg-indigo-50 rounded-lg p-2">
                            <div className="text-xs font-semibold text-indigo-700">{entry.subject}</div>
                            {entry.professor_name && (
                              <div className="text-xs text-gray-500 mt-0.5">{entry.professor_name}</div>
                            )}
                            <div className="text-xs text-gray-400">{entry.start_time}–{entry.end_time}</div>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}