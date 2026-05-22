export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { college_settings, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { cookies } from "next/headers";export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/login");

  const session = await getSession(token);
  if (!session) redirect("/login");

  const userResult = await db.select().from(users).where(eq(users.email, session.email));
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 max-w-2xl">
        <form method="POST" action="/api/settings/save" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              College Name <span className="text-red-500">*</span>
            </label>
            <input type="text" name="college_name" required defaultValue={s.college_name || ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">University Name</label>
            <input type="text" name="university_name" defaultValue={s.university_name || ""}
              placeholder="e.g. Mahatma Gandhi Kashi Vidyapith"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea name="address" rows={2} defaultValue={s.address || ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" name="phone" defaultValue={s.phone || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" defaultValue={s.email || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Principal Name</label>
            <input type="text" name="principal_name" defaultValue={s.principal_name || ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Affiliation No</label>
              <input type="text" name="affiliation_no" defaultValue={s.affiliation_no || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College Code</label>
              <input type="text" name="college_code" defaultValue={s.college_code || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College Logo</label>
            {s.logo_url && (
              <img src={s.logo_url} alt="Current Logo" className="mb-3 h-16 object-contain" />
            )}
            <label className="cursor-pointer bg-indigo-50 text-indigo-600 text-xs font-medium px-4 py-2 rounded-lg border border-indigo-200 inline-block">
              Upload Logo
              <input type="file" name="logo" accept="image/*" className="hidden" />
            </label>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG supported.</p>
          </div>

          <div className="pt-2">
            <button type="submit"
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}