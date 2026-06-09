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
  const [selectedSemesters, setSelectedSemesters] = useState([]);
  const [semesterItems, setSemesterItems] = useState({});
  const [semesterChecked, setSemesterChecked] = useState({});
  const [customItems, setCustomItems] = useState([]);
  const [previousDues, setPreviousDues] = useState(0);
  const [paidDate, setPaidDate] = useState("");
  const [amountPaidNow, setAmountPaidNow] = useState("");
  const [settlePrevious, setSettlePrevious] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const facultyOptions = useMemo(() => {
    const set = new Set(allStudents.map((s) => s.faculty).filter(Boolean));
    return [...set].sort();
  }, [allStudents]);

  const filteredStudents = useMemo(() => {
    if (!selectedFaculty) return allStudents;
    return allStudents.filter((s) => s.faculty === selectedFaculty);
  }, [allStudents, selectedFaculty]);

  const studentPackages = useMemo(() => {
    if (!selectedStudentId) return [];
    const student = allStudents.find((s) => s.id === selectedStudentId);
    if (!student) return [];
    return packages.filter((p) => p.course === student.course);
  }, [selectedStudentId, allStudents, packages]);

  function loadForStudent(studentId) {
    const student = allStudents.find((s) => s.id === studentId);
    if (!student) return;
    setPreviousDues(duesMap[studentId] || 0);
    setSelectedSemesters([]);
    setSemesterItems({});
    setSemesterChecked({});
    setCustomItems([]);
    setAmountPaidNow("");
  }

  function handleFacultyChange(e) {
    setSelectedFaculty(e.target.value);
    setSelectedStudentId("");
    setSelectedSemesters([]);
    setSemesterItems({});
    setSemesterChecked({});
    setCustomItems([]);
    setPreviousDues(0);
    setAmountPaidNow("");
  }

  function handleStudentChange(e) {
    const id = parseInt(e.target.value);
    setSelectedStudentId(id);
    loadForStudent(id);
  }

  function toggleItem(sem, feeType) {
    setSemesterChecked((sc) => ({
      ...sc,
      [sem]: { ...(sc[sem] || {}), [feeType]: !sc[sem]?.[feeType] },
    }));
  }

  function addCustomItem() {
    setCustomItems((prev) => [
      ...prev,
      { semester: "", name: "", slug: "", amount: "" },
    ]);
  }

  function updateCustom(index, field, val) {
    setCustomItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: val } : it)),
    );
  }

  function removeCustom(index) {
    setCustomItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSemesterAmount(sem, feeType, val) {
    setSemesterItems((prev) => ({
      ...prev,
      [sem]: { ...prev[sem], [feeType]: val },
    }));
  }

  const grossTotal = useMemo(() => {
    let total = 0;
    for (const sem of selectedSemesters) {
      const items = semesterItems[sem] || {};
      for (const ft of FIXED_TYPES) {
        if (semesterChecked[sem]?.[ft.value]) {
          total += parseInt(items[ft.value] || 0) || 0;
        }
      }
    }
    total += customItems.reduce((s, it) => s + (parseInt(it.amount) || 0), 0);
    return total;
  }, [selectedSemesters, semesterItems, semesterChecked, customItems]);

  const concessionInfo = concessions.find(
    (c) => c.student_id === selectedStudentId,
  );
  const concessionAmt = concessionInfo
    ? concessionInfo.discount_type === "percent"
      ? Math.round((grossTotal * concessionInfo.discount_value) / 100)
      : concessionInfo.discount_value
    : 0;
  const netDue = Math.max(0, grossTotal - concessionAmt);

  return (
    <form
      method="POST"
      action="/api/fees/add"
      onSubmit={() => setSubmitting(true)}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Faculty
          </label>
          <select
            value={selectedFaculty}
            onChange={handleFacultyChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All</option>
            {facultyOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student <span className="text-red-500">*</span>
          </label>
          <select
            name="student_id"
            required
            value={selectedStudentId}
            onChange={handleStudentChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select...</option>
            {filteredStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.course}
                {s.semester ? ` ${s.semester}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {previousDues > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-red-700">
            ⚠️ Previous Dues: ₹{previousDues}
          </p>
          <p className="text-xs text-red-500 mt-0.5">
            This student has unpaid fees from before.
          </p>
          <label className="flex items-center gap-2 mt-3 pt-3 border-t border-red-200 cursor-pointer">
            <input
              type="checkbox"
              name="settle_previous_dues"
              checked={settlePrevious}
              onChange={(e) => setSettlePrevious(e.target.checked)}
              className="w-4 h-4 accent-red-600"
            />
            <span className="text-xs font-medium text-red-700">
              Also settle previous dues — ₹{previousDues} extra
            </span>
          </label>
        </div>
      )}

      {selectedStudentId !== "" && studentPackages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Semester <span className="text-red-500">*</span>
          </label>

          <select
            value={selectedSemesters[0] || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                setSelectedSemesters([]);
                setSemesterItems({});
                setSemesterChecked({});
                setCustomItems([]);
                return;
              }
              const pkg = packages.find(
                (p) =>
                  p.semester === val &&
                  p.course ===
                    allStudents.find((s) => s.id === selectedStudentId)?.course,
              );
              setSelectedSemesters([val]);
              if (pkg && pkg.items) {
                const items = {};
                const custom = [];
                for (const item of pkg.items) {
                  if (FIXED_SLUGS.has(item.fee_type)) {
                    items[item.fee_type] = String(item.amount);
                  } else {
                    custom.push({
                      semester: val,
                      name:
                        item.label ||
                        item.fee_type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase()),
                      slug: item.fee_type,
                      amount: String(item.amount),
                    });
                  }
                }
                setSemesterItems({ [val]: items });
                setSemesterChecked({});
                setCustomItems(custom);
              } else {
                setSemesterItems({});
                setSemesterChecked({});
                setCustomItems([]);
              }
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Semester...</option>
            {studentPackages.map((pkg) => (
              <option key={pkg.id} value={pkg.semester || "General"}>
                {pkg.semester || "General"} — ₹{pkg.total_amount}
              </option>
            ))}
          </select>
          {selectedSemesters[0] && (
            <div className="space-y-1.5 mt-3">
              {FIXED_TYPES.map((ft) => {
                const items = semesterItems[selectedSemesters[0]] || {};
                if (!(ft.value in items)) return null;
                const isChecked =
                  !!semesterChecked[selectedSemesters[0]]?.[ft.value];
                const sem = selectedSemesters[0];
                return (
                  <div
                    key={ft.value}
                    className={`border rounded-lg px-3 py-2.5 flex items-center gap-3 ${isChecked ? "border-indigo-400 bg-indigo-50" : "border-gray-200"}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem(sem, ft.value)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    {isChecked && (
                      <input
                        type="hidden"
                        name={`sem_${sem}_fee_type_${ft.value}`}
                        value={ft.value}
                      />
                    )}
                    <span className="flex-1 text-sm text-gray-700">
                      {ft.label}
                    </span>
                    <input
                      type="number"
                      name={`sem_${sem}_amount_${ft.value}`}
                      value={items[ft.value] || ""}
                      onChange={(e) =>
                        updateSemesterAmount(sem, ft.value, e.target.value)
                      }
                      min="1"
                      placeholder="₹"
                      disabled={!isChecked}
                      className={`w-24 border rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 ${!isChecked ? "bg-gray-100 border-gray-200 text-gray-400" : "border-gray-300"}`}
                    />
                  </div>
                );
              })}
            </div>
          )}
          <input
            type="hidden"
            name="selected_semesters"
            value={JSON.stringify(selectedSemesters)}
          />
          <input
            type="hidden"
            name="semester_items"
            value={JSON.stringify(semesterItems)}
          />
          <input
            type="hidden"
            name="semester_checked"
            value={JSON.stringify(semesterChecked)}
          />
        </div>
      )}

      {selectedStudentId !== "" && studentPackages.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
          <p className="text-xs text-yellow-700">
            No fee package found for this student's course. Add a package first.
          </p>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Custom Items{" "}
            <span className="text-gray-400 text-xs font-normal">
              (hostel, library, etc.)
            </span>
          </label>
          <button
            type="button"
            onClick={addCustomItem}
            className="text-xs text-indigo-600 font-medium"
          >
            + Add
          </button>
        </div>
        {customItems.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No custom items.</p>
        ) : (
          <div className="space-y-2">
            {customItems.map((it, i) => (
              <div
                key={i}
                className="border border-amber-200 bg-amber-50 rounded-lg px-3 py-2 flex items-center gap-2"
              >
                <input
                  type="text"
                  name={`custom_name_${i}`}
                  value={it.name}
                  onChange={(e) => updateCustom(i, "name", e.target.value)}
                  placeholder="Item name"
                  required
                  className="flex-1 border border-amber-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <input
                  type="number"
                  name={`custom_amount_${i}`}
                  value={it.amount}
                  onChange={(e) => updateCustom(i, "amount", e.target.value)}
                  min="1"
                  required
                  placeholder="₹"
                  className="w-24 border border-amber-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="button"
                  onClick={() => removeCustom(i)}
                  className="text-red-500 text-lg font-bold w-6"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <input type="hidden" name="custom_count" value={customItems.length} />
      </div>

      {concessionInfo && grossTotal > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
          <p className="text-xs font-semibold text-green-700">
            💸 Concession: ₹{concessionAmt} off
          </p>
          <p className="text-xs text-green-600 mt-0.5">
            Net Payable: ₹{netDue}
          </p>
        </div>
      )}

      {grossTotal > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 flex justify-between">
          <span className="text-sm font-medium text-indigo-700">
            Total ({selectedSemesters.length} semester
            {selectedSemesters.length !== 1 ? "s" : ""})
          </span>
          <span className="text-lg font-bold text-indigo-700">
            ₹{netDue || grossTotal}
          </span>
        </div>
      )}

      <input type="hidden" name="concession_amount" value={concessionAmt} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Academic Year
          </label>
          <input
            type="text"
            name="academic_year"
            defaultValue={currentAcademicYear}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="due_date"
            required
            defaultValue={today}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid Date{" "}
            <span className="text-gray-400 text-xs">(empty = pending)</span>
          </label>
          <input
            type="date"
            name="paid_date"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {paidDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount Paid Now{" "}
              <span className="text-gray-400 text-xs">(empty = full)</span>
            </label>
            <input
              type="number"
              name="amount_paid_now"
              value={amountPaidNow}
              onChange={(e) => setAmountPaidNow(e.target.value)}
              min="0"
              placeholder={`₹${netDue || grossTotal}`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={
            submitting ||
            !selectedSemesters[0] ||
            grossTotal === 0 ||
            !selectedStudentId
          }
          className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : "Save Fee"}
        </button>
        <a
          href="/fees"
          className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
