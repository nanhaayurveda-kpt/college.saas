"use client";

import { useState } from "react";
import { FEE_TYPES, SEMESTERS } from "@/lib/courses";

export default function EditFeeForm({ fee }) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(fee.status || "pending");

  const toDateInput = (val) => {
    if (!val) return "";
    const d = new Date(val);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  return (
    <form method="POST" action={`/api/fees/${fee.id}/edit`}
      onSubmit={() => setSubmitting(true)} className="space-y-4">

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
        <input type="text"
          value={`${fee.student_name} — ${fee.course || ""}${fee.semester ? ` ${fee.semester}` : ""}`}
          disabled
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fee Type <span className="text-red-500">*</span>
          </label>
          <select name="fee_type" required defaultValue={fee.fee_type || "semester"}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {FEE_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (₹) <span className="text-red-500">*</span>
          </label>
          <input type="number" name="amount" required min="1" defaultValue={fee.amount}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
          <input type="text" name="academic_year" defaultValue={fee.academic_year || ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
          <select name="semester" defaultValue={fee.semester || ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">—</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input type="date" name="due_date" required defaultValue={toDateInput(fee.due_date)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid Date <span className="text-gray-400 text-xs">(empty = pending)</span>
          </label>
          <input type="date" name="paid_date" defaultValue={toDateInput(fee.paid_date)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status <span className="text-red-500">*</span>
        </label>
        <select name="status" required value={status} onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
        </select>
      </div>

      {status === "partial" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid Amount (₹) <span className="text-red-500">*</span>
          </label>
          <input type="number" name="paid_amount" required min="1"
            defaultValue={fee.paid_amount || ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Receipt No.</label>
        <input type="text" name="receipt_no" defaultValue={fee.receipt_no || ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={submitting}
          className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
          {submitting ? "Saving..." : "Update"}
        </button>
        <a href="/fees"
          className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center">
          Cancel
        </a>
      </div>
    </form>
  );
}