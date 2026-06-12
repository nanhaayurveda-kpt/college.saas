export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { exams } from "@/lib/schema";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export default async function MarksheetPage({ searchParams }) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);
  if (!session) redirect("/login");
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));
  const user = userResult[0];

  const params = await searchParams;
  const selectedCourse = params?.course || "";
  const selectedSemester = params?.semester || "";
  const selectedType = params?.type || "";
  const selectedYear = params?.year || "";

  const allExams = await db.select().from(exams).where(eq(exams.user_id, 1));
  const courses = [
    ...new Set(allExams.map((e) => e.course).filter(Boolean)),
  ].sort();
  const years = [
    ...new Set(allExams.map((e) => e.academic_year).filter(Boolean)),
  ]
    .sort()
    .reverse();

  const semesters = ["1", "2", "3", "4", "5", "6"];
  const examTypes = [
    { val: "internal", label: "Internal" },
    { val: "midterm", label: "Mid Term" },
    { val: "practical", label: "Practical" },
    { val: "annual", label: "Annual" },
  ];

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Marksheet</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Internal · Mid Term · Annual
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <form method="GET" action="/marksheet/view" className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Course <span className="text-red-500">*</span>
            </label>
            <select
              name="course"
              defaultValue={selectedCourse}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Semester
            </label>
            <select
              name="semester"
              defaultValue={selectedSemester}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">All Semesters</option>
              {semesters.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Exam Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {examTypes.map(({ val, label }) => (
                <label
                  key={val}
                  className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50"
                >
                  <input
                    type="radio"
                    name="type"
                    value={val}
                    defaultChecked={selectedType === val}
                    className="accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Academic Year
            </label>
            {years.length > 0 ? (
              <select
                name="year"
                defaultValue={selectedYear}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="year"
                defaultValue={selectedYear}
                placeholder="e.g. 2024-25"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium"
          >
            Generate Marksheet →
          </button>
        </form>
      </div>

      {courses.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Quick Access</p>
          <div className="grid grid-cols-2 gap-2">
            {courses.map((c) => (
              
                key={c}
                href={`/marksheet/view?course=${c}&type=annual`}
                className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm text-center"
              >
                <p className="text-sm font-bold text-indigo-700">{c}</p>
                <p className="text-xs text-gray-400 mt-0.5">Annual Marksheet</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}