// app/layout.js
export const dynamic = "force-dynamic";
import { Inter } from "next/font/google";
import FlashMessageContainer from "@/components/FlashMessageContainer";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";
import { getSession } from "@/lib/session";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Nishant PG College Software",
  description: "College Management System",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nishant PG College Software",
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4338ca",
};

const navLinks = [
  { href: "/dashboard",        icon: "📊", label: "Home" },
  { href: "/students",         icon: "🎓", label: "Students" },
  { href: "/admissions",       icon: "📋", label: "Admissions" },
  { href: "/professors",       icon: "👨‍🏫", label: "Professors" },
  { href: "/professor-login",  icon: "🔑", label: "P-Login",   highlight: true },
  { href: "/fees",             icon: "💰", label: "Fees" },
  { href: "/fee-structure",    icon: "🏷️", label: "Fee Str." },
  { href: "/attendance",       icon: "✅", label: "Attend." },
  { href: "/professor-attendance", icon: "👨‍🏫", label: "P-Attend." },
  { href: "/exams",            icon: "📝", label: "Exams" },
  { href: "/exam-forms",       icon: "📋", label: "E-Forms" },
  { href: "/marksheet",        icon: "📄", label: "Marksheet" },
  { href: "/certificates",     icon: "🏅", label: "Cert." },
  { href: "/timetable",        icon: "🗓️", label: "Timetable" },
  { href: "/notices",          icon: "🔔", label: "Notices" },
  { href: "/promote",          icon: "⬆️", label: "Promote" },
  { href: "/reports",          icon: "📊", label: "Reports" },
  { href: "/settings",         icon: "⚙️", label: "Settings" },
];

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const user = token ? await getSession(token) : null;

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-100`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}`,
          }}
        />
        <FlashMessageContainer />

        {user ? (
          <div className="flex min-h-screen">

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 bg-indigo-900 text-white flex-col fixed h-full overflow-y-auto">
              <div className="px-6 py-5 border-b border-indigo-800">
                <div className="text-2xl font-bold text-white">Nishant PG</div>
                <div className="text-indigo-300 text-xs mt-1">College Management Software</div>
              </div>
              <nav className="px-4 py-6 space-y-1 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 transition text-sm font-medium ${
                      link.highlight ? "text-yellow-300" : "text-indigo-100"
                    }`}
                  >
                    {link.icon} {link.label}
                  </Link>
                ))}
                <form action="/logout" method="POST">
                  <button
                    type="submit"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-indigo-800 transition text-sm font-medium w-full text-left"
                  >
                    🚪 Logout
                  </button>
                </form>
              </nav>
            </aside>

            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-indigo-900 flex items-center justify-between px-4 py-3 shadow-md">
              <div className="text-white font-bold text-lg">Nishant PG</div>
              <form action="/logout" method="POST">
                <button type="submit" className="text-red-300 text-sm font-medium">
                  Logout
                </button>
              </form>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex overflow-x-auto scrollbar-none">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex-1 min-w-[60px] flex flex-col items-center justify-center py-2 text-[10px] font-medium ${
                    link.highlight ? "text-yellow-500" : "text-gray-500"
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            <main className="w-full md:ml-64 flex-1 p-4 pt-16 pb-24 md:pt-6 md:pb-6 md:p-8">
              {children}
            </main>
          </div>
        ) : (
          <div>
            <nav className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-16">
                  <div className="text-xl font-bold text-indigo-600">
                    Nishant PG College Software
                  </div>
                </div>
              </div>
            </nav>
            <main>{children}</main>
          </div>
        )}
      </body>
    </html>
  );
}