"use client";

import { useState } from "react";export default function EditStudentForm({ s, faculties, courses, semesters }) {
  const [photoUrl, setPhotoUrl] = useState(s.photo_url || "");
  const [photoPreview, setPhotoPreview] = useState(s.photo_url || "");
  const [uploading, setUploading] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(s.faculty || "");

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    setPhotoUrl(data.secure_url);
    setPhotoPreview(data.secure_url);
    setUploading(false);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Edit Student</h1>
        <p className="text-gray-500 text-xs mt-0.5">{s.name}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form method="POST" action="/api/students/update" className="space-y-4">
          <input type="hidden" name="id" value={s.id} />
          <input type="hidden" name="photo_url" value={photoUrl} />

          {/* Photo */}
          <div className="flex flex-col items-center gap-3 pb-2">
            <div className="w-24 h-24 rounded-full border-2 border-indigo-200 overflow-hidden bg-gray-50 flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">👤</span>
              )}
            </div>
            <label className="cursor-pointer bg-indigo-50 text-indigo-600 text-xs font-medium px-4 py-2 rounded-lg border border-indigo-200">
              {uploading ? "Uploading..." : "Change Photo"}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={uploading} />
            </label>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" required defaultValue={s.name}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* Faculty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Faculty <span className="text-red-500">*</span></label>
            <select name="faculty" required defaultValue={s.faculty || ""}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select...</option>
              {faculties.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Course + Semester */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course <span className="text-red-500">*</span></label>
              <select name="course" required defaultValue={s.course || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select...</option>
                {(selectedFaculty ? courses[selectedFaculty] : Object.values(courses).flat()).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester <span className="text-red-500">*</span></label>
              <select name="semester" required defaultValue={s.semester || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select...</option>
                {semesters.map((sem) => <option key={sem} value={sem}>Semester {sem}</option>)}
              </select>
            </div>
          </div>

          {/* Roll + Scholar */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number <span className="text-red-500">*</span></label>
              <input type="text" name="roll_number" required defaultValue={s.roll_number || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scholar No.</label>
              <input type="text" name="admission_no" defaultValue={s.admission_no || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {/* PEN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PEN (Permanent Education Number)</label>
            <input type="text" name="pen" defaultValue={s.pen || ""} placeholder="11-digit PEN"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* Admission Date + Academic Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
              <input type="date" name="admission_date"
                defaultValue={s.admission_date ? new Date(s.admission_date).toISOString().split("T")[0] : ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <input type="text" name="academic_year" defaultValue={s.academic_year || ""} placeholder="e.g. 2024-25"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {/* Gender + DOB */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select name="gender" defaultValue={s.gender || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" name="dob" defaultValue={s.dob || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {/* Father + Mother */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father Name</label>
              <input type="text" name="father_name" defaultValue={s.father_name || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother Name</label>
              <input type="text" name="mother_name" defaultValue={s.mother_name || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {/* Guardian */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
            <input type="text" name="guardian_name" defaultValue={s.guardian_name || ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
              <input type="tel" name="phone" required defaultValue={s.phone || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alt Phone</label>
              <input type="tel" name="alt_phone" defaultValue={s.alt_phone || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {/* Religion + Caste */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
              <input type="text" name="religion" defaultValue={s.religion || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caste</label>
              <input type="text" name="caste" defaultValue={s.caste || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {/* Aadhaar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar No.</label>
            <input type="text" name="aadhaar" defaultValue={s.aadhaar || ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea name="address" rows={2} defaultValue={s.address || ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>

          {/* Fee Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Status</label>
            <select name="fee_status" defaultValue={s.fee_status || "pending"}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit"
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium">Update Student</button>
            <a href={`/students/${s.id}`}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  );
}