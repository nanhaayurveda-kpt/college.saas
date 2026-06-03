"use client";

import { useState } from "react";

export default function EditProfessorForm({ p }) {
  const [photoUrl, setPhotoUrl] = useState(p.photo_url || "");
  const [photoPreview, setPhotoPreview] = useState(p.photo_url || "");
  const [uploading, setUploading] = useState(false);
  const [pin, setPin] = useState(p.pin || "");

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData },
    );
    const data = await res.json();
    setPhotoUrl(data.secure_url);
    setPhotoPreview(data.secure_url);
    setUploading(false);
  }

  function handlePhoneChange(e) {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length >= 6) setPin(val.slice(-6));
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <form method="POST" action="/api/professors/update" className="space-y-4">
        <input type="hidden" name="id" value={p.id} />
        <input type="hidden" name="photo_url" value={photoUrl} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input type="text" name="name" required defaultValue={p.name}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
          <select name="designation" defaultValue={p.designation || "assistant"}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="assistant">Assistant Professor</option>
            <option value="associate">Associate Professor</option>
            <option value="professor">Professor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
          <input type="text" name="qualification" defaultValue={p.qualification || ""}
            placeholder="e.g. M.Sc, Ph.D"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" name="phone" defaultValue={p.phone || ""}
              onChange={handlePhoneChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" defaultValue={p.email || ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit PIN</label>
            <input type="text" name="pin" maxLength={6} minLength={6}
              value={pin} onChange={(e) => setPin(e.target.value)}
              placeholder="Auto from phone"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-16 h-16 rounded-full border-2 border-indigo-100 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
              {photoPreview ? (
                <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <label className="cursor-pointer bg-indigo-50 text-indigo-600 text-xs font-medium px-4 py-2 rounded-lg border border-indigo-200 inline-block">
              {uploading ? "Uploading..." : "Upload Photo"}
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-gray-400">PNG, JPG supported.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit"
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 text-sm font-medium">
            Update Professor
          </button>
          <a href={`/professors/${p.id}`}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}