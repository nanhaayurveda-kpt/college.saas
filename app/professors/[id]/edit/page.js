export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { professors, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form
          method="POST"
          action="/api/professors/update"
          encType="multipart/form-data"
          className="space-y-4"
        >
          <input type="hidden" name="id" value={p.id} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={p.name}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation
            </label>
            <select
              name="designation"
              defaultValue={p.designation || "assistant"}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="assistant">Assistant Professor</option>
              <option value="associate">Associate Professor</option>
              <option value="professor">Professor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qualification
            </label>
            <input
              type="text"
              name="qualification"
              defaultValue={p.qualification || ""}
              placeholder="e.g. M.Sc, Ph.D"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                defaultValue={p.phone || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={p.email || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo
            </label>
            {p.photo_url && (
              <img
                src={p.photo_url}
                alt={p.name}
                className="mb-3 h-16 w-16 object-cover rounded-full"
              />
            )}
            <label className="cursor-pointer bg-indigo-50 text-indigo-600 text-xs font-medium px-4 py-2 rounded-lg border border-indigo-200 inline-block">
              Upload Photo
              <input
                type="file"
                name="photo"
                accept="image/*"
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG supported.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 text-sm font-medium"
            >
              Update Professor
            </button>
            <a
              href={`/professors/${p.id}`}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
