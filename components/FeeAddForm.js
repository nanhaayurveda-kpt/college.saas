// components/FeeAddForm.js
"use client";

import { useState } from "react";
import { FEE_TYPES } from "@/lib/courses";

const FEE_TYPE_LABELS = Object.fromEntries(FEE_TYPES.map((f) => [f.value, f.label]));

export default function FeeAddForm({ allStudents, feePackages, feePackageItems, concessions, today, currentAcademicYear }) {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedFeeType, setSelectedFeeType] = useState("");
  const [amount, setAmount] = useState("");
  const [concessionInfo, setConcessionInfo] = useState(null);
  const [netAmount, setNetAmount] = useState("");
  const [packageItems, setPackageItems] = useState([]);

  function handleStudentChange(e) {
    const studentId = parseInt(e.target.value);
    setSelectedStudentId(studentId);
    const conc = concessions.find((c) => c.student_id === studentId) || null;
    setConcessionInfo(conc);

    const student = allStudents.find((s) => s.id === studentId);
    if (student) {
      const pkg = feePackages.find(
        (p) => p.course === student.course &&
          (!p.semester || p.semester === student.semester)
      );
      if (pkg) {
        const items = feePackageItems.filter((i) => i.package_id === pkg.id);
        setPackageItems(items);
        if (items.length > 0) {
          setSelectedFeeType(items[0].fee_type);
          fillAmountFromItem(items[0], conc);
        }
      } else {
        setPackageItems([]);
        setAmount("");
        setNetAmount("");
      }
    }
  }

  function fillAmountFromItem(item, conc) {
    const base = item.amount;
    setAmount(String(base));
    if (conc) {
      const discount = conc.discount_type === "percent"
        ? Math.round((base * conc.discount_value) / 100)
        : conc.discount_value;
      setNetAmount(String(Math.max(0, base - discount)));
    } else {
      setNetAmount(String(base));
    }
  }

  function handleFeeTypeChange(e) {
    const feeType = e.target.value;
    setSelectedFeeType(feeType);
    const item = packageItems.find((i) => i.fee_type === feeType);
    if (item) {
      fillAmountFromItem(item, concessionInfo);
    } else {
      setAmount("");
      setNetAmount("");
    }
  }

  function handleAmountChange(e) {
    const base = parseInt(e.target.value) || 0;
    setAmount(e.target.value);
    if (concessionInfo) {
      const discount = concessionInfo.discount_type === "percent"
        ? Math.round((base * concessionInfo.discount_value) / 100)
        : concessionInfo.discount_value;
      setNetAmount(String(Math.max(0, base - discount)));
    } else {
      setNetAmount(e.target.value);
    }
  }

  return (
    <form method="POST" action="/api/fees/add" className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Student <span className="text-red-500">*</span>
        </label>
        <select name="student_id" required value={selectedStudentId} onChange={handleStudentChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Select student...</option>
          {allStudents.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.course}{s.semester ? ` ${s.semester}` : ""}{s.roll_number ? ` (${s.roll_number})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fee Type <span className="text-red-500">*</span>
          </label>
          <select name="fee_type" value={selectedFeeType} onChange={handleFeeTypeChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select...</option>
            {packageItems.length > 0
              ? packageItems.map((i) => (
                  <option key={i.fee_type} value={i.fee_type}>
                    {i.label || FEE_TYPE_LABELS[i.fee_type] || i.fee_type}
                  </option>
                ))
              : FEE_TYPES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))
            }
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (₹) <span className="text-red-500">*</span>
          </label>
          <input type="number" name="amount" required min="1" value={amount}
            onChange={handleAmountChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      {concessionInfo && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-green-700 mb-1">💸 Concession Applied</p>
          <p className="text-xs text-green-600">
            {concessionInfo.discount_type === "percent"
              ? `${concessionInfo.discount_value}% discount`
              : `₹${concessionInfo.discount_value} off`}
            {concessionInfo.reason ? ` — ${concessionInfo.reason}` : ""}
          </p>
          {netAmount && amount && (
            <p className="text-xs text-green-700 font-bold mt-1">Net Payable: ₹{netAmount}</p>
          )}
        </div>
      )}

      <input type="hidden" name="net_amount" value={netAmount || amount} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
        <input type="text" name="academic_year" defaultValue={currentAcademicYear}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input type="date" name="due_date" required defaultValue={today}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid Date <span className="text-gray-400 font-normal text-xs ml-1">(empty = pending)</span>
          </label>
          <input type="date" name="paid_date" defaultValue={today}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit"
          className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium">
          Save Payment
        </button>
        <a href="/fees"
          className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center">
          Cancel
        </a>
      </div>
    </form>
  );
}