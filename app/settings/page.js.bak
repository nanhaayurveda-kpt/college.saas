export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { college_settings, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { cookies } from "next/headers";
import SettingsForm from "./SettingsForm";
import Link from "next/link";

export default async function SettingsPage() {
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
    .from(college_settings)
    .where(eq(college_settings.user_id, 1));
  const s = result[0] || {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">College Settings</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          This information will appear on receipts and certificates
        </p>
      </div>
      <Link
        href="/settings/periods"
        className="inline-block mb-4 text-xs text-indigo-600 font-medium bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100"
      >
        ⏱ Period Timings →
      </Link>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 max-w-2xl">
        <SettingsForm settings={s} />
      </div>
    </div>
  );
}
