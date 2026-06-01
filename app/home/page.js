export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

const TILES = [
  { href: "/dashboard", icon: "📊", label: "Dashboard", desc: "Overview & stats" },
  { href: "/students", icon: "🎓", label: "Students", desc: "Add, edit, manage" },
  { href: "/professors", icon: "👨‍🏫", label: "Professors", desc: "Staff & PIN login" },
  { href: "/professor-login", icon: "🔑", label: "Professor Login", desc: "PIN-based access" },
  { href: "/fees", icon: "💰", label: "Fees", desc: "Fee collection" },
  { href: "/fee-structure", icon: "🏷️", label: "Fee Structure", desc: "Class-wise fees" },
  { href: "/attendance", icon: "✅", label: "Attendance", desc: "Daily attendance" },
  { href: "/exams", icon: "📝", label: "Exams & Results", desc: "Schedule & marks" },
  { href: "/exam-forms", icon: "📋", label: "Exam Forms", desc: "University forms" },
  { href: "/marksheet", icon: "📄", label: "Marksheet", desc: "Print marksheets" },
  { href: "/certificates", icon: "🏅", label: "Certificates", desc: "TC, Bonafide etc." },
  { href: "/timetable", icon: "🗓️", label: "Timetable", desc: "Class schedule" },
  { href: "/notices", icon: "📢", label: "Notices", desc: "Notice board" },
  { href: "/reports", icon: "📊", label: "Reports", desc: "NAAC & analytics" },
  { href: "/admissions", icon: "📥", label: "Admissions", desc: "New applications" },
  { href: "/settings", icon: "⚙️", label: "Settings", desc: "College profile" },
];

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await getSession(token) : null;
  if (!session) redirect("/login");

  return (
    <div className="pt-4">
      <div className="mb-6">
        <p className="text-gray-500 text-sm">Welcome back,</p>
        <h1 className="text-2xl font-bold text-gray-800">
          {session.name?.split(" ")[0] || "Admin"}
        </h1>
        <span className="inline-block mt-1 text-xs font-semibold uppercase tracking-wide text-white bg-indigo-500 px-2 py-0.5 rounded-full">
          Principal
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TILES.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-2 active:scale-95 transition hover:border-indigo-300 hover:bg-indigo-50"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-indigo-100 text-indigo-700">
              {tile.icon}
            </div>
            <div>
              <p className="font-semibold text-sm text-indigo-900">{tile.label}</p>
              <p className="text-xs text-gray-400">{tile.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}