export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import Link from "next/link";
import { professors, professor_subjects, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { addProfessorSubject, deleteProfessorSubject } from "@/app/actions";

const designationLabel = {
  assistant: "Assistant Professor",
  associate: "Associate Professor",
  professor: "Professor",
};

const courses = [
  "B.A.",
  "M.A.",
  "B.Com",
  "M.Com",
  "B.Sc.",
  "M.Sc.",
  "B.Sc. Ag.",
  "M.Sc. Ag.",
];
const semesters = ["1", "2", "3", "4", "5", "6"];

export default async function ProfessorDetailPage({ params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/login");
  const session = await getSession(token);
  if (!session) redirect("/login");

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));
  const user = userResult[0];
  if (!user) redirect("/login");

  const result = await db
    .select()
    .from(professors)
    .where(and(eq(professors.id, Number(id)), eq(professors.user_id, user.id)));
  if (result.length === 0) notFound();
  const p = result[0];

  const subjects = await db
    .select()
    .from(professor_subjects)
    .where(eq(professor_subjects.professor_id, Number(id)));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Professor Details</h1>
          <p className="text-gray-500 text-xs mt-0.5">{p.name}</p>
        </div>
        <Link
          href="/professors"
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
        >
          ← Back
        </Link>
      </div>

      {/* Detail Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Full Name
            </p>
            <p className="text-sm font-medium text-gray-900">{p.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Designation
            </p>
            <p className="text-sm font-medium text-indigo-600">
              {designationLabel[p.designation] || p.designation}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Qualification
            </p>
            <p className="text-sm font-medium text-gray-900">
              {p.qualification || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Phone
            </p>
            <p className="text-sm font-medium text-gray-900">
              {p.phone || "—"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
              Login PIN
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-widest text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200">
                {p.pin || "—"}
              </span>
              <span className="text-xs text-gray-400">
                Share with professor
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Link */}
      <div className="mb-4">
        <Link
          href={`/professors/${p.id}/edit`}
          className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          ✏️ Edit Professor
        </Link>
      </div>

      {/* Assigned Subjects */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">
          Assigned Subjects
        </h2>
        {subjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <span
                key={s.id}
                className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-medium"
              >
                {s.subject} — {s.course} {s.semester ? `Sem ${s.semester}` : ""}
                <form method="POST" action="/api/professors/delete-subject" className="inline">
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" className="text-red-400 ml-1 font-bold">
                    ×
                  </button>
                </form>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No subjects assigned yet.</p>
        )}
      </div>

      {/* Assign Subject */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Assign Subject</h2>
        <form method="POST" action="/api/professors/add-subject" className="space-y-3">
          <input type="hidden" name="professor_id" value={p.id} />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              required
              placeholder="e.g. Economics"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Course
              </label>
              <select
                name="course"
                required
                defaultValue=""
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select...</option>
                {courses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Semester
              </label>
              <select
                name="semester"
                defaultValue=""
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All</option>
                {semesters.map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium"
          >
            Assign Subject
          </button>
        </form>
      </div>
    </div>
  );
}
