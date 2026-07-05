import { db } from "@/lib/db";
import { fees, students, college_settings, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import PrintButton from "./PrintButton";
import { fee_concessions } from "@/lib/schema";

export const dynamic = "force-dynamic";

export default async function FeeReceiptPage({ params }) {
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

  const settingsResult = await db
    .select()
    .from(college_settings)
    ;
  const settings = settingsResult[0] || {};

  const [fee] = await db
    .select({
      id: fees.id,
      amount: fees.amount,
      paid_amount: fees.paid_amount,
      due_date: fees.due_date,
      paid_date: fees.paid_date,
      status: fees.status,
      fee_type: fees.fee_type,
      academic_year: fees.academic_year,
      receipt_no: fees.receipt_no,
      student_name: students.name,
      student_course: students.course,
      student_semester: students.semester,
      roll_number: students.roll_number,
      admission_no: students.admission_no,
      parent_name: students.father_name,
      parent_phone: students.phone,
      student_id: fees.student_id,
    })
    .from(fees)
    .leftJoin(students, eq(fees.student_id, students.id))
    .where(and(eq(fees.id, parseInt(id))));

  if (!fee) return <div className="p-8 text-red-500">Receipt not found.</div>;

  const concessionResult = await db
    .select()
    .from(fee_concessions)
    .where(eq(fee_concessions.student_id, fee.student_id));
  const concession = concessionResult[0] || null;
  const receiptNo = fee.receipt_no || `RCP-${String(fee.id).padStart(5, "0")}`;
  const paidDate = fee.paid_date
    ? new Date(fee.paid_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const totalAmount = fee.amount || 0;
  const paidAmount = fee.paid_amount || 0;
  const balance = totalAmount - paidAmount;

  const feeTypeLabel =
    {
      monthly: "Monthly Fee",
      admission: "Admission Fee",
      exam: "Exam Fee",
      transport: "Transport Fee",
      misc: "Miscellaneous",
    }[fee.fee_type] ||
    fee.fee_type ||
    "College Fee";

  return (
    <div>
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fee Receipt</h1>
          <p className="text-gray-500 text-xs mt-0.5">{receiptNo}</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/fees"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
          >
            ← Back
          </a>
          <PrintButton />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-2xl mx-auto print:shadow-none print:border-none">
        <div className="text-center border-b-2 border-indigo-600 p-6">
          {settings.logo_url && (
            <img
              src={settings.logo_url}
              alt="logo"
              className="h-16 object-contain mx-auto mb-3"
            />
          )}
          <h2 className="text-2xl font-bold text-indigo-700">
            {settings.college_name || "College"}
          </h2>
          {settings.university_name && (
            <p className="text-gray-500 text-xs mt-0.5">
              {settings.university_name}
            </p>
          )}
          {settings.address && (
            <p className="text-gray-500 text-xs mt-1">{settings.address}</p>
          )}
          {settings.phone && (
            <p className="text-gray-500 text-xs">📞 {settings.phone}</p>
          )}
          {settings.affiliation_no && (
            <p className="text-gray-400 text-xs mt-0.5">
              Affiliation No: {settings.affiliation_no}
            </p>
          )}
          <div className="mt-3 inline-block bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">
            FEE PAYMENT RECEIPT
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between mb-5 bg-gray-50 rounded-lg px-4 py-3 text-sm">
            <div>
              <span className="text-gray-500">Receipt No:</span>
              <span className="font-bold text-gray-900 ml-2">{receiptNo}</span>
            </div>
            <div>
              <span className="text-gray-500">Date:</span>
              <span className="font-medium text-gray-900 ml-2">{paidDate}</span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 mb-5">
            <h3 className="text-xs font-bold text-indigo-600 uppercase mb-3">
              Student Details
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>
                <span className="font-semibold text-gray-900 ml-2">
                  {fee.student_name}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Course:</span>
                <span className="font-semibold text-gray-900 ml-2">
                  {fee.student_course}{" "}
                  {fee.student_semester ? `Sem ${fee.student_semester}` : ""}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Roll No:</span>
                <span className="font-semibold text-gray-900 ml-2">
                  {fee.roll_number || "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Scholar No:</span>
                <span className="font-semibold text-gray-900 ml-2">
                  {fee.admission_no || "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Father:</span>
                <span className="font-semibold text-gray-900 ml-2">
                  {fee.parent_name || "—"}
                </span>
              </div>
              {fee.academic_year && (
                <div>
                  <span className="text-gray-500">Session:</span>
                  <span className="font-semibold text-gray-900 ml-2">
                    {fee.academic_year}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden mb-5">
            <table className="min-w-full">
              <thead className="bg-indigo-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                    Description
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {feeTypeLabel}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                    ₹{totalAmount}
                  </td>
                </tr>
                <tr className="border-t border-gray-100 bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600" colSpan={2}>
                    Amount Paid
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600 text-right font-bold">
                    ₹{paidAmount}
                  </td>
                </tr>
                {concession && (
                  <tr className="border-t border-gray-100 bg-green-50">
                    <td
                      className="px-4 py-3 text-sm text-green-600"
                      colSpan={2}
                    >
                      Concession{" "}
                      {concession.reason ? `(${concession.reason})` : ""}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 text-right font-bold">
                      {concession.discount_type === "percent"
                        ? `${concession.discount_value}%`
                        : `₹${concession.discount_value}`}{" "}
                      off
                    </td>
                  </tr>
                )}
                {balance > 0 && (
                  <tr className="border-t border-gray-100 bg-red-50">
                    <td className="px-4 py-3 text-sm text-red-600" colSpan={2}>
                      Balance Due
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 text-right font-bold">
                      ₹{balance}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mb-6">
            {balance === 0 ? (
              <span className="px-6 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                ✅ Payment Complete
              </span>
            ) : (
              <span className="px-6 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                ⚠️ Partial Payment — Balance ₹{balance} Due
              </span>
            )}
          </div>

          <div className="border-t border-gray-200 pt-5 flex justify-between items-end">
            <div className="text-xs text-gray-400">
              <p>Powered by Nishant PG College Software</p>
              <p>nishantsoftwares.in</p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p className="mb-6">Authorised Signature</p>
              <p>___________________</p>
              {settings.principal_name && (
                <p className="font-medium text-gray-700">
                  {settings.principal_name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
