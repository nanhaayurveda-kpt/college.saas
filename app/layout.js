export const dynamic = "force-dynamic";
import { Inter } from "next/font/google";
import FlashMessageContainer from "@/components/FlashMessageContainer";
import { cookies } from "next/headers";
import "./globals.css";
import { getSession } from "@/lib/session";
import TopBar from "@/components/TopBar";

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
          <div className="min-h-screen">
            <div className="print:hidden">
              <TopBar />
            </div>
            <main className="max-w-2xl mx-auto px-4 pt-16 pb-8">
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
