"use client";

import { useState } from "react";

export default function AddProfessorPage() {
  const [pin, setPin] = useState("");

  function handlePhoneChange(e) {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length >= 6) {
      setPin(val.slice(-6));
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Add New Professor</h1>
        <p className="text-gray-500 text-xs mt-0.5">Fill in the details below</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form method="POST" action="/api/professors/add" encType="multipart/form-data" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input type="text" name="name" required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation <span className="text-red-500">*</span>
            </label>
            <select name="designation" required defaultValue="assistant"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="assistant">Assistant Professor</option>
              <option value="associate">Associate Professor</option>
              <option value="professor">Professor</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
              <input type="text" name="qualification" placeholder="e.g. MA, MSW, PhD"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                6-Digit PIN <span className="text-red-500">*</span>
              </label>
              <input type="text" name="pin" required maxLength={6} minLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Auto from phone"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" name="phone" onChange={handlePhoneChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
            <label className="cursor-pointer bg-indigo-50 text-indigo-600 text-xs font-medium px-4 py-2 rounded-lg border border-indigo-200 inline-block">
              Upload Photo
              <input type="file" name="photo" accept="image/*" className="hidden" />
            </label>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG supported.</p>
          </div>

          <p className="text-xs font-bold text-pink-500 pt-2">
            After saving, go to the professor's profile to assign subjects and courses.
          </p>

          <div className="flex gap-3 pt-2">
            <button type="submit"
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 text-sm font-medium">
              Save Professor
            </button>
            <a href="/professors"
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}