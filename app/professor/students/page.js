export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { students, professor_subjects, professors } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);

export default async function ProfessorStudentsPage() {
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

  const assignedSubjects = await db
    .select()
    .from(professor_subjects)
    .where(eq(professor_subjects.professor_id, payload.professorId));

  const assignedCourses = [...new Set(assignedSubjects.map((s) => s.course))];

  const professorResult = await db
    .select()
    .from(professors)
    .where(eq(professors.id, payload.professorId));
  const professor = professorResult[0];

  const allStudents = professor
    ? await db
        .select()
        .from(students)
        
    : [];
  const myStudents = allStudents.filter((s) =>
    assignedCourses.includes(s.course),
  );
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-700 px-4 py-4 flex justify-between items-center">
        <div>
          <p className="text-white font-bold">{payload.professorName}</p>
          <p className="text-indigo-200 text-xs">Professor Portal</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/professor/dashboard" className="text-indigo-200 text-sm">
            ← Back
          </Link>
          <a href="/api/professor-logout" className="text-red-300 text-sm">
            Logout
          </a>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Students</h1>

        {myStudents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
            No students found in your assigned courses.
          </div>
        ) : (
          <div className="space-y-2">
            {myStudents.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex justify-between items-center"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-400">
                    {s.course} {s.semester ? `· Sem ${s.semester}` : ""} · Roll{" "}
                    {s.roll_number || "—"}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    s.fee_status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {s.fee_status === "paid" ? "Paid" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
