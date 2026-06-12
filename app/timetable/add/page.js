export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { professors } from "@/lib/schema";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import AddPeriodForm from "./AddPeriodForm";
import { COURSES } from "@/lib/courses";

export default async function AddPeriodPage({ searchParams }) {
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

  const courses = COURSES;
  const semesters = ["1", "2", "3", "4", "5", "6"];
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const allProfessors = await db
    .select()
    .from(professors)
    .where(eq(professors.user_id, 1));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Add Period</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Add a new period to the timetable
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <AddPeriodForm
          courses={courses}
          semesters={semesters}
          days={days}
          allProfessors={allProfessors}
          selectedCourse={selectedCourse}
        />{" "}
      </div>
    </div>
  );
}
