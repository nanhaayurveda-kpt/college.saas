"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/students", label: "Students", icon: "🎓" },
  { href: "/professors", label: "Professors", icon: "👨‍🏫" },
  { href: "/fees", label: "Fees", icon: "💰" },
  { href: "/fee-structure", label: "Fee Structure", icon: "🏗️" },
  { href: "/attendance", label: "Attendance", icon: "✅" },
  { href: "/exams", label: "Exams & Results", icon: "📝" },
  { href: "/exam-forms", label: "Exam Forms", icon: "📋" },
  { href: "/marksheet", label: "Marksheet", icon: "📄" },
  { href: "/certificates", label: "Certificates", icon: "🏅" },
  { href: "/timetable", label: "Timetable", icon: "🗓️" },
  { href: "/notices", label: "Notices", icon: "📢" },
  { href: "/reports", label: "Reports", icon: "📊" },
  { href: "/admissions", label: "Admissions", icon: "📥" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-900 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center gap-2 px-4 py-2">
          <Link
            href="/home"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              pathname === "/home"
                ? "bg-white text-indigo-900"
                : "text-indigo-200 hover:bg-indigo-800"
            }`}
          >
            <span>🏠</span>
            <span>Home</span>
          </Link>

          <button
            onClick={() => setOpen((v) => !v)}
            className="flex flex-col justify-center items-center gap-1 px-2 py-1.5 rounded-lg text-indigo-200 hover:bg-indigo-800 transition"
            aria-label="Menu"
          >
            <span className="block w-5 h-0.5 bg-indigo-200"></span>
            <span className="block w-5 h-0.5 bg-indigo-200"></span>
            <span className="block w-5 h-0.5 bg-indigo-200"></span>
          </button>

          <div className="flex-1" />

          <button
            onClick={handleLogout}
            className="bg-transparent text-red-300 text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-800 transition"
          >
            🚪 Logout
          </button>
        </div>

        {open && (
          <div className="max-w-2xl mx-auto px-4 pb-3 grid grid-cols-2 gap-1.5">
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-white text-indigo-900"
                      : "text-indigo-200 hover:bg-indigo-800"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="col-span-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-300 hover:bg-indigo-800 transition"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
