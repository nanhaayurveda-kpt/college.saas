export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { certificates, students, college_settings, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import PrintButton from "./PrintButton";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

const CERT_TITLES = {
  tc: "TRANSFER CERTIFICATE",
  character: "CHARACTER CERTIFICATE",
  bonafide: "BONAFIDE CERTIFICATE",
  migration: "MIGRATION CERTIFICATE",
};

export default async function CertificatePrintPage({ params }) {
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
  const { id } = await params;

  const rows = await db
    .select({
      id: certificates.id,
      cert_type: certificates.cert_type,
      issue_date: certificates.issue_date,
      serial_no: certificates.serial_no,
      reason: certificates.reason,
      last_course: certificates.last_course,
      last_exam_passed: certificates.last_exam_passed,
      conduct: certificates.conduct,
      custom_content: certificates.custom_content,
      student_name: students.name,
      student_course: students.course,
      student_semester: students.semester,
      student_faculty: students.faculty,
      roll_number: students.roll_number,
      admission_no: students.admission_no,
      dob: students.dob,
      gender: students.gender,
      father_name: students.father_name,
      mother_name: students.mother_name,
      address: students.address,
      religion: students.religion,
      caste: students.caste,
      admission_date: students.admission_date,
    })
    .from(certificates)
    .leftJoin(students, eq(certificates.student_id, students.id))
    .where(and(eq(certificates.id, Number(id)), eq(certificates.user_id, 1)));

  if (rows.length === 0) notFound();
  const cert = rows[0];

  const settingsRows = await db
    .select()
    .from(college_settings)
    .where(eq(college_settings.user_id, 1));
  const college = settingsRows[0] || {};

  const title = CERT_TITLES[cert.cert_type] || "CERTIFICATE";
  const issueDate = new Date(cert.issue_date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dob = cert.dob
    ? new Date(cert.dob).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";
  const admissionDate = cert.admission_date
    ? new Date(cert.admission_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  // Gender-based pronouns (Mahila college में सब She/Her आएँगे)
  const isFemale = cert.gender?.toLowerCase().startsWith("f");
  const HeShe = isFemale ? "She" : cert.gender ? "He" : "He/She";
  const hisHer = isFemale ? "her" : cert.gender ? "his" : "his/her";
  const HisHer = isFemale ? "Her" : cert.gender ? "His" : "His/Her";
  const himHer = isFemale ? "her" : cert.gender ? "him" : "him/her";

  return (
    <div>
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 text-xs mt-0.5">{cert.student_name}</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/certificates"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
          >
            ← Back
          </a>
          <PrintButton />
        </div>
      </div>

      <div
        id="print-area"
        className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-2xl mx-auto p-8 print:shadow-none print:border-none print:rounded-none"
      >
        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          {college.logo_url && (
            <img
              src={college.logo_url}
              alt="Logo"
              className="h-16 w-16 object-contain mx-auto mb-2"
            />
          )}
          <h2 className="text-xl font-bold text-gray-900 uppercase">
            {college.college_name || "College Name"}
          </h2>
          {college.university_name && (
            <p className="text-sm text-gray-500">{college.university_name}</p>
          )}
          {college.address && (
            <p className="text-xs text-gray-500 mt-1">{college.address}</p>
          )}
          {college.affiliation_no && (
            <p className="text-xs text-gray-400">
              Affiliation No: {college.affiliation_no}
            </p>
          )}
          <div className="mt-3 inline-block border-2 border-gray-800 px-6 py-1">
            <h3 className="text-base font-bold text-gray-900 uppercase tracking-widest">
              {title}
            </h3>
          </div>
          {cert.serial_no && (
            <p className="text-xs text-gray-500 mt-2">
              Serial No: {cert.serial_no}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="text-sm text-gray-800 leading-relaxed space-y-3 mb-8">
          {cert.cert_type === "tc" && (
            <>
              <p>
                This is to certify that <strong>{cert.student_name}</strong>,
                {cert.gender
                  ? ` ${cert.gender === "Male" ? "Son" : "Daughter"} of`
                  : " Child of"}{" "}
                <strong>{cert.father_name || "—"}</strong>, resident of{" "}
                <strong>{cert.address || "—"}</strong>, was a bonafide student
                of this college.
              </p>
              <p>
                {HeShe} was enrolled in <strong>{cert.student_course}</strong>
                {cert.student_semester
                  ? `, Semester ${cert.student_semester}`
                  : ""}
                .
              </p>
              {cert.last_course && (
                <p>
                  Last course attended: <strong>{cert.last_course}</strong>
                </p>
              )}
              {cert.last_exam_passed && (
                <p>
                  Last exam passed: <strong>{cert.last_exam_passed}</strong>
                </p>
              )}
              <p>
                {HisHer} conduct during the stay in the college was{" "}
                <strong>{cert.conduct || "Good"}</strong>.
              </p>
              <p>
                This certificate is issued on {hisHer} request for the purpose
                of <strong>{cert.reason || "further studies"}</strong>.
              </p>
            </>
          )}

          {cert.cert_type === "character" && (
            <>
              <p>
                This is to certify that <strong>{cert.student_name}</strong>,
                {cert.gender
                  ? ` ${cert.gender === "Male" ? "Son" : "Daughter"} of`
                  : " Child of"}{" "}
                <strong>{cert.father_name || "—"}</strong>, is/was a student of{" "}
                <strong>{cert.student_course}</strong>
                {cert.student_semester
                  ? ` Semester ${cert.student_semester}`
                  : ""}{" "}
                at this college.
              </p>
              <p>
                To the best of our knowledge, {hisHer} character and conduct
                have been <strong>{cert.conduct || "Good"}</strong> throughout{" "}
                {hisHer} stay in this institution.
              </p>
              {cert.custom_content && <p>{cert.custom_content}</p>}
            </>
          )}

          {cert.cert_type === "bonafide" && (
            <>
              <p>
                This is to certify that <strong>{cert.student_name}</strong>,
                {cert.gender
                  ? ` ${cert.gender === "Male" ? "Son" : "Daughter"} of`
                  : " Child of"}{" "}
                <strong>{cert.father_name || "—"}</strong>, is a bonafide
                student of this college.
              </p>
              <p>
                {HeShe} is currently enrolled in{" "}
                <strong>{cert.student_course}</strong>
                {cert.student_semester
                  ? `, Semester ${cert.student_semester}`
                  : ""}
                {cert.student_faculty
                  ? `, Faculty of ${cert.student_faculty}`
                  : ""}
                .
              </p>
              {cert.admission_date && (
                <p>
                  Date of Admission: <strong>{admissionDate}</strong>
                </p>
              )}
              {cert.dob && (
                <p>
                  Date of Birth: <strong>{dob}</strong>
                </p>
              )}
              {cert.admission_no && (
                <p>
                  Admission No: <strong>{cert.admission_no}</strong>
                </p>
              )}
              {cert.custom_content && <p>{cert.custom_content}</p>}
            </>
          )}

          {cert.cert_type === "migration" && (
            <>
              <p>
                This is to certify that <strong>{cert.student_name}</strong>,
                {cert.gender
                  ? ` ${cert.gender === "Male" ? "Son" : "Daughter"} of`
                  : " Child of"}{" "}
                <strong>{cert.father_name || "—"}</strong>, was a student of{" "}
                <strong>{cert.student_course}</strong>
                {cert.student_semester
                  ? ` Semester ${cert.student_semester}`
                  : ""}{" "}
                at this college.
              </p>
              {cert.last_course && (
                <p>
                  Last course attended: <strong>{cert.last_course}</strong>
                </p>
              )}
              {cert.last_exam_passed && (
                <p>
                  Last exam passed: <strong>{cert.last_exam_passed}</strong>
                </p>
              )}
              <p>
                {HeShe} has no dues pending against {himHer} in this
                institution. {HisHer} conduct was{" "}
                <strong>{cert.conduct || "Good"}</strong>.
              </p>
              {cert.reason && (
                <p>
                  Purpose: <strong>{cert.reason}</strong>
                </p>
              )}
              {cert.custom_content && <p>{cert.custom_content}</p>}
            </>
          )}
        </div>

        {/* Details Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-2 text-gray-500 w-40">Student Name</td>
                <td className="px-4 py-2 font-medium text-gray-900">
                  {cert.student_name}
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 text-gray-500">Father's Name</td>
                <td className="px-4 py-2 font-medium text-gray-900">
                  {cert.father_name || "—"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-gray-500">Course</td>
                <td className="px-4 py-2 font-medium text-gray-900">
                  {cert.student_course}{" "}
                  {cert.student_semester ? `Sem ${cert.student_semester}` : ""}
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 text-gray-500">Roll Number</td>
                <td className="px-4 py-2 font-medium text-gray-900">
                  {cert.roll_number || "—"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-gray-500">Admission No.</td>
                <td className="px-4 py-2 font-medium text-gray-900">
                  {cert.admission_no || "—"}
                </td>
              </tr>
              {cert.dob && (
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 text-gray-500">Date of Birth</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{dob}</td>
                </tr>
              )}
              {cert.religion && (
                <tr>
                  <td className="px-4 py-2 text-gray-500">Religion</td>
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {cert.religion}
                  </td>
                </tr>
              )}
              {cert.caste && (
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 text-gray-500">Caste</td>
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {cert.caste}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end mt-10">
          <div className="text-xs text-gray-400">
            <p>Date of Issue: {issueDate}</p>
          </div>
          <div className="text-center text-xs text-gray-500">
            <div className="border-t border-gray-400 w-40 mb-1" />
            <p>{college.principal_name || "Principal"}</p>
            <p>{college.college_name || ""}</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
