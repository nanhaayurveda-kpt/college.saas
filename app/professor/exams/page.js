export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);

export default async function ProfessorExamsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("professor_session")?.value;
  if (!token) redirect("/professor-login");

  try {
    await jwtVerify(token, SECRET);
  } catch {
    redirect("/professor-login");
  }

  redirect("/exams");
}