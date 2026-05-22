export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { professors, timetable, professor_subjects } from "@/lib/schema";
import Link from "next/link";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export default async function ProfessorsPage() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/login");
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));
  const user = userResult[0];

  const allProfessors = await db
    .select()
    .from(professors)
    .where(eq(professors.user_id, 1))
    .orderBy(professors.name);

  const allPeriods = await db
    .select()
    .from(timetable)
    .where(eq(timetable.user_id, 1));

  const allSubjects = await db
    .select()
    .from(professor_subjects)
    .where(eq(professor_subjects.user_id, 1));
  const subjectCount = {};
  allSubjects.forEach((s) => {
    subjectCount[s.subject] = (subjectCount[s.subject] || 0) + 1;
  });

  const professorPeriods = {};
  allPeriods.forEach((p) => {
    if (!p.professor_name) return;
    if (!professorPeriods[p.professor_name])
      professorPeriods[p.professor_name] = [];
    professorPeriods[p.professor_name].push(p);
  });

  const designationLabel = {
    assistant: "Assistant Professor",
    associate: "Associate Professor",
    professor: "Professor",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Professors</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {allProfessors.length} faculty members
          </p>
        </div>
        <Link
          href="/professors/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Add
        </Link>
      </div>

      {/* Subject-wise count */}
      {Object.keys(subjectCount).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">
              📚 Subject-wise Staff
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 p-4">
            {Object.entries(subjectCount)
              .sort()
              .map(([sub, cnt]) => (
                <span
                  key={sub}
                  className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full border border-indigo-100"
                >
                  {sub}: {cnt}
                </span>
              ))}
          </div>
        </div>
      )}

      {allProfessors.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No professors found. Add your first professor.
        </div>
      ) : (
        <div className="space-y-3">
          {allProfessors.map((prof) => {
            const periods = professorPeriods[prof.name] || [];
            const byDay = {};
            periods.forEach((p) => {
              if (!byDay[p.day]) byDay[p.day] = [];
              byDay[p.day].push(p);
            });
            const dayOrder = [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ];
            const sortedDays = dayOrder.filter((d) => byDay[d]);

            return (
              <div
                key={prof.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="px-4 py-3 flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">
                        {prof.name}
                      </p>
                      <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        {designationLabel[prof.designation] || prof.designation}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      {prof.qualification || "—"}
                      {prof.phone ? ` · 📞 ${prof.phone}` : ""}
                    </p>
                    {prof.email && (
                      <p className="text-gray-400 text-xs">{prof.email}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {periods.length} periods assigned
                    </p>
                  </div>
                  <div className="ml-3 shrink-0 flex flex-col gap-1 items-end">
                    <Link
                      href={`/professors/${prof.id}`}
                      className="text-xs font-medium text-indigo-600"
                    >
                      View / Edit
                    </Link>
                    <form method="POST" action="/api/professors/delete">
                      <input type="hidden" name="id" value={prof.id} />
                      <button
                        type="submit"
                        className="text-xs font-medium text-red-500"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>

                {sortedDays.length > 0 && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      📅 Period Schedule
                    </p>
                    <div className="space-y-1.5">
                      {sortedDays.map((day) => (
                        <div
                          key={day}
                          className="flex flex-wrap gap-1.5 items-center"
                        >
                          <span className="text-xs text-gray-500 w-8 shrink-0">
                            {day.slice(0, 3)}:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {byDay[day]
                              .sort((a, b) => a.period - b.period)
                              .map((p) => (
                                <span
                                  key={p.id}
                                  className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded"
                                >
                                  P{p.period} · {p.course} · {p.subject} ·{" "}
                                  {p.start_time}–{p.end_time}
                                </span>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
