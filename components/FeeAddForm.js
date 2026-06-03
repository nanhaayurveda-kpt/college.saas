"use client";

import { useState, useMemo } from "react";

const FIXED_TYPES = [
  { value: "semester", label: "Semester Fee" },
  { value: "admission", label: "Admission Fee" },
  { value: "practical", label: "Practical Fee" },
  { value: "misc", label: "Miscellaneous" },
];

const FIXED_SLUGS = new Set(["semester", "admission", "practical", "misc"]);

export default function FeeAddForm({
  allStudents,
  packages,
  duesMap,
  concessions,
  today,
  currentAcademicYear,
}) {
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [checkedTypes, setCheckedTypes] = useState({});
  const [amounts, setAmounts] = useState({});
  const [customItems, setCustomItems] = useState([]);
  const [previousDues, setPreviousDues] = useState(0);
  const [paidDate, setPaidDate] = useState("");
  const [amountPaidNow, setAmountPaidNow] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const facultyOptions = useMemo(() => {
    const set = new Set(allStudents.map((s) => s.faculty).filter(Boolean));
    return [...set].sort();
  }, [allStudents]);

  const filteredStudents = useMemo(() => {
    if (!selectedFaculty) return allStudents;
    return allStudents.filter((s) => s.faculty === selectedFaculty);
  }, [allStudents, selectedFaculty]);

  function loadForStudent(studentId) {
    const student = allStudents.find((s) => s.id === studentId);
    if (!student) return;
    setPreviousDues(duesMap[studentId] || 0);

    const pkg = packages.find(
      (p) =>
        p.course === student.course &&
        (!p.semester || p.semester === student.semester),
    );

    const newAmounts = {};
    const newChecked = {};
    const newCustomItems = [];

    if (pkg && pkg.items && pkg.items.length > 0) {
      for (const item of pkg.items) {
        if (FIXED_SLUGS.has(item.fee_type)) {
          newAmounts[item.fee_type] = String(item.amount);
          newChecked[item.fee_type] = true;
        } else {
          newCustomItems.push({
            name: item.label || item.fee_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            slug: item.fee_type,
            amount: String(item.amount),
          });
        }
      }
    }
    setAmounts(newAmounts);
    setCheckedTypes(newChecked);
    setCustomItems(newCustomItems);
    setAmountPaidNow("");
  }

  function handleFacultyChange(e) {
    setSelectedFaculty(e.target.value);
    setSelectedStudentId("");
    setAmounts({});
    setCheckedTypes({});
    setCustomItems([]);
    setPreviousDues(0);
    setAmountPaidNow("");
  }

  function handleStudentChange(e) {
    const id = parseInt(e.target.value);
    setSelectedStudentId(id);
    loadForStudent(id);
  }

  function toggleType(type) {
    setCheckedTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  }

  function addCustomItem() {
    setCustomItems((prev) => [...prev, { name: "", slug: "", amount: "" }]);
  }

  function updateCustom(index, field, val) {
    setCustomItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: val } : it)),
    );
  }

  function removeCustom(index) {
    setCustomItems((prev) => prev.filter((_, i) => i !== index));
  }

  const grossTotal = useMemo(() => {
    const fixed = FIXED_TYPES.filter((ft) => checkedTypes[ft.value]).reduce(
      (sum, ft) => sum + (parseInt(amounts[ft.value]) || 0),
      0,
    );
    const custom = customItems.reduce(
      (sum, it) => sum + (parseInt(it.amount) || 0),
      0,
    );
    return fixed + custom;
  }, [checkedTypes, amounts, customItems]);

  const concessionInfo = concessions.find(
    (c) => c.student_id === selectedStudentId,
  );
  const concessionAmt = concessionInfo
    ? concessionInfo.discount_type === "percent"
      ? Math.round((grossTotal * concessionInfo.discount_value) / 100)
      : concessionInfo.discount_value
    : 0;
  const netDue = Math.max(0, grossTotal - concessionAmt);

  const itemCount =
    FIXED_TYPES.filter((ft) => checkedTypes[ft.value]).length +
    customItems.filter((it) => it.name.trim() && parseInt(it.amount) > 0).length;

  return (
    <form
      method="POST"
      action="/api/fees/add"
      onSubmit={() => setSubmitting(true)}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
          <select value={selectedFaculty} onChange={handleFacultyChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All</option>
            {facultyOptions.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student <span className="text-red-500">*</span>
          </label>
          <select name="student_id" required value={selectedStudentId}
            onChange={handleStudentChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select...</option>
            {filteredStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.course}{s.semester ? ` ${s.semester}` : ""}
                {s.roll_number ? ` (${s.roll_number})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {previousDues > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-red-700">⚠️ Previous Dues: ₹{previousDues}</p>
          <p className="text-xs text-red-500 mt-0.5">This student has unpaid fees from before.</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fee Types</label>
        <div className="space-y-2">
          {FIXED_TYPES.map((ft) => (
            <div key={ft.value}
              className={`border rounded-lg px-3 py-2.5 flex items-center gap-3 ${
                checkedTypes[ft.value] ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-white"
              }`}>
              <input type="checkbox" id={ft.value}
                checked={!!checkedTypes[ft.value]}
                onChange={() => toggleType(ft.value)}
                className="w-4 h-4 accent-indigo-600" />
              <label htmlFor={ft.value}
                className="flex-1 text-sm font-medium text-gray-700 cursor-pointer">
                {ft.label}
              </label>
              {checkedTypes[ft.value] && (
                <>
                  <input type="hidden" name={`fee_type_${ft.value}`} value={ft.value} />
                  <input type="number" name={`amount_${ft.value}`}
                    value={amounts[ft.value] || ""}
                    onChange={(e) => setAmounts((prev) => ({ ...prev, [ft.value]: e.target.value }))}
                    min="1" required placeholder="₹"
                    className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Custom Items <span className="text-gray-400 text-xs font-normal">(hostel, library, etc.)</span>
          </label>
          <button type="button" onClick={addCustomItem}
            className="text-xs text-indigo-600 font-medium">+ Add</button>
        </div>
        {customItems.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No custom items.</p>
        ) : (
          <div className="space-y-2">
            {customItems.map((it, i) => (
              <div key={i} className="border border-amber-200 bg-amber-50 rounded-lg px-3 py-2 flex items-center gap-2">
                <input type="text" name={`custom_name_${i}`}
                  value={it.name} onChange={(e) => updateCustom(i, "name", e.target.value)}
                  placeholder="Item name" required
                  className="flex-1 border border-amber-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                <input type="number" name={`custom_amount_${i}`}
                  value={it.amount} onChange={(e) => updateCustom(i, "amount", e.target.value)}
                  min="1" required placeholder="₹"
                  className="w-24 border border-amber-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-400" />
                <button type="button" onClick={() => removeCustom(i)}
                  className="text-red-500 text-lg font-bold w-6">×</button>
              </div>
            ))}
          </div>
        )}
        <input type="hidden" name="custom_count" value={customItems.length} />
      </div>

      {concessionInfo && grossTotal > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
          <p className="text-xs font-semibold text-green-700">💸 Concession: ₹{concessionAmt} off</p>
          <p className="text-xs text-green-600 mt-0.5">Net Payable: ₹{netDue}</p>
        </div>
      )}

      {itemCount > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 flex justify-between">
          <span className="text-sm font-medium text-indigo-700">Total ({itemCount} items)</span>
          <span className="text-lg font-bold text-indigo-700">₹{netDue || grossTotal}</span>
        </div>
      )}

      <input type="hidden" name="concession_amount" value={concessionAmt} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
          <input type="text" name="academic_year" defaultValue={currentAcademicYear}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input type="date" name="due_date" required defaultValue={today}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid Date <span className="text-gray-400 text-xs">(empty = pending)</span>
          </label>
          <input type="date" name="paid_date" value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        {paidDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount Paid Now <span className="text-gray-400 text-xs">(empty = full)</span>
            </label>
            <input type="number" name="amount_paid_now" value={amountPaidNow}
              onChange={(e) => setAmountPaidNow(e.target.value)}
              min="0" placeholder={`₹${netDue || grossTotal}`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit"
          disabled={submitting || itemCount === 0 || !selectedStudentId}
          className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? "Saving..." : "Save Fee"}
        </button>
        <a href="/fees"
          className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center">
          Cancel
        </a>
      </div>
    </form>
  );
}