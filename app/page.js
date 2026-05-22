export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";

const COLLEGE_EXE_URL =
  "https://github.com/kp1153/college-saas/releases/download/v1.0.0/Nishant.PG.College.Setup.0.1.0.exe";

const features = [
  {
    icon: "🎓",
    title: "स्टूडेंट प्रबंधन",
    desc: "नाम, कोर्स, सेमेस्टर, फैकल्टी, रोल नंबर, पिता का नाम और फोन — सभी रिकॉर्ड एक जगह। एक-एक करके या बल्क में import करें।",
  },
  {
    icon: "💰",
    title: "फीस संग्रह और रसीद",
    desc: "फीस दर्ज करें, तुरंत रसीद प्रिंट करें। किसने दी, किसने नहीं — एक नज़र में देखें। बकायेदारों को WhatsApp reminder एक क्लिक में।",
  },
  {
    icon: "✅",
    title: "दैनिक उपस्थिति",
    desc: "हर दिन कोर्स-वार उपस्थिति दर्ज करें। उपस्थित और अनुपस्थित की संख्या तुरंत देखें। अनुपस्थित स्टूडेंट ों के अभिभावकों को WhatsApp अलर्ट।",
  },
  {
    icon: "🔑",
    title: "प्रोफेसर PIN लॉगिन",
    desc: "हर प्रोफेसर को 6 अंकों का PIN मिलता है। वे अपने मोबाइल से लॉगिन करके सिर्फ अपने कोर्स की उपस्थिति दर्ज करते हैं। प्रिंसिपल को तुरंत दिखता है।",
  },
  {
    icon: "📝",
    title: "परीक्षा और परिणाम",
    desc: "आंतरिक, मध्यावधि और वार्षिक परीक्षाएं शेड्यूल करें। अंक दर्ज करें — ग्रेड और पास/फेल अपने आप तय होगा। रिजल्ट शीट प्रिंट करें।",
  },
  {
    icon: "📄",
    title: "अंकसूची",
    desc: "पूरे कोर्स की आंतरिक, मध्यावधि और वार्षिक अंकसूची एक साथ। सीधे प्रिंट करें।",
  },
  {
    icon: "🏅",
    title: "प्रमाण पत्र",
    desc: "स्थानांतरण, चरित्र, बोनाफाइड और माइग्रेशन प्रमाण पत्र — एक क्लिक में। कॉलेज का नाम, लोगो और प्रिंसिपल का नाम स्वतः जुड़ता है।",
  },
  {
    icon: "📋",
    title: "परीक्षा फॉर्म",
    desc: "हर सेमेस्टर में प्रत्येक स्टूडेंट  के परीक्षा फॉर्म जमा करने और परीक्षा शुल्क भुगतान की स्थिति ट्रैक करें।",
  },
  {
    icon: "📊",
    title: "रिपोर्ट — NAAC के लिए तैयार",
    desc: "कोर्स-वार स्टूडेंट  संख्या, फीस संग्रह, उपस्थिति प्रतिशत और परीक्षा परिणाम — सब एक पेज पर। NAAC accreditation के लिए ज़रूरी सभी डेटा उपलब्ध।",
  },
  {
    icon: "📣",
    title: "सूचना पट्ट",
    desc: "कॉलेज की सूचनाएं प्राथमिकता के साथ पोस्ट करें। अति आवश्यक सूचनाएं लाल बैज के साथ दिखती हैं।",
  },
  {
    icon: "📱",
    title: "मोबाइल और डेस्कटॉप",
    desc: "मोबाइल पर Android app की तरह और कंप्यूटर पर Windows application की तरह चलता है। एक खरीद — दोनों पर काम।",
  },
];

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await getSession(token) : null;
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-5">
            🎓 कॉलेज प्रबंधन सॉफ्टवेयर — UG · PG · Diploma
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            कॉलेज की हर ज़रूरत
            <br />
            <span className="text-indigo-600">एक सॉफ्टवेयर में — मोबाइल पर</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-3">
            स्टूडेंट  · फीस · उपस्थिति · परीक्षा · प्रमाण पत्र · परीक्षा फॉर्म — सब एक जगह।
          </p>
          <p className="text-sm text-indigo-600 font-medium mb-8">
            NAAC accreditation के लिए ज़रूरी सभी रिकॉर्ड डिजिटल रखें।
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
            <Link
              href="/login"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-sm"
            >
              प्रशासन लॉगिन →
            </Link>
            <Link
              href="/professor-login"
              className="bg-yellow-500 text-white px-8 py-3 rounded-lg hover:bg-yellow-600 font-medium text-sm shadow-sm"
            >
              🔑 प्रोफेसर लॉगिन
            </Link>
            <Link
              href="/student/login"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium text-sm shadow-sm"
            >
              🎓 स्टूडेंट  लॉगिन
            </Link>
            <a
              href={COLLEGE_EXE_URL}
              className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-700 font-medium text-sm shadow-sm"
            >
              🖥️ Windows App डाउनलोड करें
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Android पर install करें: Chrome → ⋮ → होम स्क्रीन पर जोड़ें
          </p>
        </div>

        {/* Features */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            क्या-क्या मिलता है?
          </h2>
          <p className="text-center text-gray-400 text-sm mb-8">
            {features.length} सुविधाएं — एक सॉफ्टवेयर, एक कीमत
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="text-3xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            मूल्य
          </h2>
          <p className="text-center text-gray-400 text-sm mb-8">
            ७ दिन बिल्कुल मुफ्त — कोई कार्ड नहीं चाहिए
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="rounded-2xl border-2 border-indigo-600 p-6 text-center shadow-lg relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                नया खाता
              </div>
              <h3 className="text-xl font-bold mb-1 text-gray-700 mt-2">
                पहला वर्ष
              </h3>
              <div className="text-5xl font-extrabold text-indigo-600 mb-1">
                ₹4,999
              </div>
              <p className="text-gray-400 text-sm mb-4">
                एकमुश्त — १ साल शामिल
              </p>
              <Link
                href="/login"
                className="block w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition mb-3 text-sm"
              >
                ७ दिन मुफ्त आज़माएं
              </Link>
              <a
                href="https://nishantsoftwares.in/college"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition text-sm"
              >
                💳 अभी खरीदें — ₹4,999
              </a>
            </div>
            <div className="rounded-2xl border-2 border-gray-200 p-6 text-center shadow-sm">
              <h3 className="text-xl font-bold mb-1 text-gray-700 mt-2">
                नवीनीकरण
              </h3>
              <div className="text-5xl font-extrabold text-indigo-600 mb-1">
                ₹2,500
              </div>
              <p className="text-gray-400 text-sm mb-4">प्रति वर्ष</p>
              <a
                href="https://nishantsoftwares.in/college"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition text-sm"
              >
                💳 नवीनीकरण करें
              </a>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-indigo-900 rounded-2xl p-10 text-white">
          <h2 className="text-2xl font-bold mb-2">आज ही शुरू करें — ७ दिन मुफ्त</h2>
          <p className="text-indigo-300 mb-6 text-sm">
            कोई कार्ड नहीं। कोई setup शुल्क नहीं। सीधे developer से सहायता।
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm text-indigo-300">
            <a href="tel:+919996865069" className="hover:text-white">
              📞 9996865069
            </a>
            <span className="hidden sm:inline">|</span>
            <a
              href="https://wa.me/919996865069"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              💬 WhatsApp
            </a>
            <span className="hidden sm:inline">|</span>
            <a
              href="mailto:prasad.kamta@gmail.com"
              className="hover:text-white"
            >
              ✉️ prasad.kamta@gmail.com
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}