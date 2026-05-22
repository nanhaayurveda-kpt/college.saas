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
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 transition text-sm font-medium">📊 Dashboard</Link>
                <Link href="/students" className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 transition text-sm font-medium">🎓 Students</Link>
                <Link href="/professors" className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 transition text-sm font-medium">👨‍🏫 Professors</Link>
                <Link href="/professor-login" className="flex items-center gap-3 px-4 py-3 rounded-lg text-yellow-300 hover:bg-indigo-800 transition text-sm font-medium">🔑 Professor Login</Link>
                <Link href="/fees" className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 transition text-sm font-medium">💰 Fees</Link>
                <Link href="/fee-structure" className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 transition text-sm font-medium">🏷️ Fee Structure</Link>
                <Link href="/attendance" className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 transition text-sm font-medium">✅ Attendance</Link>
                <Link href="/exams" className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 transition text-sm font-medium">📝 Exams & Results</Link>
                <Link href="/exam-forms" className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 transition text-sm font-medium">📋 Exam Forms</Link>
                <Link href="/marksheet" className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 transition text-sm font-medium">📄 Marksheet</Link>
                <Link href="/certificates" className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 transition text-sm font-medium">🏅 Certificates</Link>
                <Link href="/timetable" className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 transition text-sm font-medium">🗓️ Timetable</Link>
                <Link href="/notices" className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 transition text-sm font-medium">📋 Notice Board</Link>
                <Link href="/reports" className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 transition text-sm font-medium">📊 Reports</Link>
                <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 transition text-sm font-medium">⚙️ Settings</Link>
                <form action="/logout" method="POST">
                  <button type="submit" className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-indigo-800 transition text-sm font-medium w-full text-left">
                    🚪 Logout
                  </button>
                </form>
              </nav>
            </aside>

            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-indigo-900 flex items-center justify-between px-4 py-3 shadow-md">
              <div className="text-white font-bold text-lg">Nishant PG</div>
              <form action="/logout" method="POST">
                <button type="submit" className="text-red-300 text-sm">Logout</button>
              </form>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex overflow-x-auto">
              <Link href="/dashboard" className="flex-1 min-w-[60px] flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-500">📊<span>Home</span></Link>
              <Link href="/students" className="flex-1 min-w-[60px] flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-500">🎓<span>Students</span></Link>
              <Link href="/professors" className="flex-1 min-w-[60px] flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-500">👨‍🏫<span>Professors</span></Link>
              <Link href="/professor-login" className="flex-1 min-w-[60px] flex flex-col items-center justify-center py-2 text-[10px] font-medium text-yellow-500">🔑<span>P-Login</span></Link>
              <Link href="/fees" className="flex-1 min-w-[60px] flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-500">💰<span>Fees</span></Link>
              <Link href="/fee-structure" className="flex-1 min-w-[60px] flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-500">🏷️<span>Fee Str.</span></Link>
              <Link href="/attendance" className="flex-1 min-w-[60px] flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-500">✅<span>Attend.</span></Link>
              <Link href="/exams" className="flex-1 min-w-[60px] flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-500">📝<span>Exams</span></Link>
              <Link href="/exam-forms" className="flex-1 min-w-[60px] flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-500">📋<span>E-Forms</span></Link>
              <Link href="/marksheet" className="flex-1 min-w-[60px] flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-500">📄<span>Marksheet</span></Link>
              <Link href="/certificates" className="flex-1 min-w-[60px] flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-500">🏅<span>Cert.</span></Link>
              <Link href="/timetable" className="flex-1 min-w-[60px] flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-500">🗓️<span>Timetable</span></Link>
              <Link href="/notices" className="flex-1 min-w-[60px] flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-500">📋<span>Notices</span></Link>
              <Link href="/reports" className="flex-1 min-w-[60px] flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-500">📊<span>Reports</span></Link>
              <Link href="/settings" className="flex-1 min-w-[60px] flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-500">⚙️<span>Settings</span></Link>
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
                  <div className="text-xl font-bold text-indigo-600">Nishant PG College Software</div>
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