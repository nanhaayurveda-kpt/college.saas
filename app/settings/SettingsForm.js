"use client";

import { useState } from "react";

export default function SettingsForm({ settings }) {
  const s = settings || {};
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      method="POST"
      action="/api/settings/save"
      encType="multipart/form-data"
      onSubmit={() => setSubmitting(true)}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          College Name <span className="text-red-500">*</span>
        </label>
        <input type="text" name="college_name" required
          defaultValue={s.college_name || ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          University Name
        </label>
        <input type="text" name="university_name"
          defaultValue={s.university_name || "Mahatma Gandhi Kashi Vidyapith"}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea name="address" rows={2} defaultValue={s.address || ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="tel" name="phone" defaultValue={s.phone || ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" name="email" defaultValue={s.email || ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Principal Name</label>
        <input type="text" name="principal_name" defaultValue={s.principal_name || ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Affiliation No</label>
          <input type="text" name="affiliation_no" defaultValue={s.affiliation_no || ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">College Code</label>
          <input type="text" name="college_code" defaultValue={s.college_code || ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">College Logo</label>
        {s.logo_url && (
          <img src={s.logo_url} alt="Current Logo" className="mb-3 h-16 object-contain" />
        )}
        <label className="cursor-pointer bg-indigo-50 text-indigo-600 text-xs font-medium px-4 py-2 rounded-lg border border-indigo-200 inline-block">
          Upload Logo
          <input type="file" name="logo" accept="image/*" className="hidden" />
        </label>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG supported.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Principal Signature</label>
        {s.signature_url && (
          <img src={s.signature_url} alt="Current Signature"
            className="mb-3 h-16 object-contain border border-gray-200 rounded p-1" />
        )}
        <label className="cursor-pointer bg-indigo-50 text-indigo-600 text-xs font-medium px-4 py-2 rounded-lg border border-indigo-200 inline-block">
          Upload Signature
          <input type="file" name="signature" accept="image/*" className="hidden" />
        </label>
        <p className="text-xs text-gray-400 mt-1">PNG with transparent background recommended.</p>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={submitting}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}