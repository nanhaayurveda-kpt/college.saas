export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { professors, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import EditProfessorForm from "./EditProfessorForm";

export default async function EditProfessorPage({ params }) {
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
    .where(and(eq(professors.id, Number(id)), eq(professors.user_id, 1)));
  if (result.length === 0) notFound();
  const p = result[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Edit Professor</h1>
        <p className="text-gray-500 text-xs mt-0.5">{p.name}</p>
      </div>
      <EditProfessorForm p={p} />
    </div>
  );
}