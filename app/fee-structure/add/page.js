"use client";

import { useState } from "react";
import { COURSES, SEMESTERS, FEE_TYPES } from "@/lib/courses";

export default function AddFeePackagePage() {
  const now = new Date();
  const baseYear = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  const currentAcademicYear = `${baseYear}-${String(baseYear + 1).slice(-2)}`;

  const [items, setItems] = useState([
    { fee_type: "semester", label: "", amount: "" },
  ]);

  function addItem() {
    setItems([...items, { fee_type: "misc", label: "", amount: "" }]);
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index, field, value) {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  }

  const total = items.reduce((sum, i) => sum + (parseInt(i.amount) || 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Add Fee Package</h1>
        <p className="text-gray-500 text-xs mt-0.5">Define course-wise fee template</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form method="POST" action="/api/fee-structure/add" className="space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course <span className="text-red-500">*</span>
              </label>
              <select name="course" required defaultValue=""
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select...</option>
                {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select name="semester" defaultValue=""
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Semesters</option>
                {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input type="text" name="academic_year" defaultValue={currentAcademicYear}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fee Items</label>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <select
                      value={item.fee_type}
                      onChange={(e) => updateItem(index, "fee_type", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {FEE_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-4">
                    <input type="text"
                      value={item.label}
                      onChange={(e) => updateItem(index, "label", e.target.value)}
                      placeholder="Custom label (optional)"
                      className="w-full border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="col-span-3">
                    <input type="number"
                      value={item.amount}
                      onChange={(e) => updateItem(index, "amount", e.target.value)}
                      placeholder="₹"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)}
                        className="text-red-400 text-lg font-bold">×</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem}
              className="mt-2 text-indigo-600 text-xs font-medium">
              + Add Item
            </button>
          </div>

          <div className="bg-indigo-50 rounded-lg px-4 py-2 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total</span>
            <span className="text-sm font-bold text-indigo-700">₹{total}</span>
          </div>

          <input type="hidden" name="items" value={JSON.stringify(items)} />
          <input type="hidden" name="total_amount" value={total} />

          <div className="flex gap-3 pt-2">
            <button type="submit"
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium">
              Save Package
            </button>
            <a href="/fee-structure"
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}