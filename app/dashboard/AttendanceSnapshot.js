"use client";

import { useState } from "react";

export default function AttendanceSnapshot({
  semMap,
  semKeys,
  profPresentList,
  profAbsentList,
  profNAList,
}) {
  const [openProf, setOpenProf] = useState(null);
  const [openStu, setOpenStu] = useState(null);
  const [selectedSem, setSelectedSem] = useState("");

  const profMarked =
    profPresentList.length > 0 ||
    profAbsentList.length > 0 ||
    profNAList.length > 0;

  function ProfBox({ keyName, label, list, color }) {
    const isOpen = openProf === keyName;
    return (
      <button
        type="button"
        onClick={() => setOpenProf(isOpen ? null : keyName)}
        className={`${color.bg} rounded-lg px-3 py-3 text-left w-full`}
      >
        <p className={`text-xs font-semibold ${color.text}`}>
          {label} ({list.length})
        </p>
        <p className={`text-[10px] ${color.sub} mt-0.5`}>
          {isOpen ? "Tap to hide" : "Tap to view"}
        </p>
        {isOpen && (
          <div className="mt-2 space-y-0.5">
            {list.length === 0 ? (
              <p className="text-xs text-gray-400">—</p>
            ) : (
              list.map((n, i) => (
                <p key={i} className="text-xs text-gray-800">
                  {n}
                </p>
              ))
            )}
          </div>
        )}
      </button>
    );
  }
  function StuBox({ keyName, label, list, color }) {
    const isOpen = openStu === keyName;
    return (
      <button
        type="button"
        onClick={() => setOpenStu(isOpen ? null : keyName)}
        className={`${color.bg} rounded-lg px-3 py-3 text-left w-full`}
      >
        <p className={`text-xs font-semibold ${color.text}`}>
          {label} ({list.length})
        </p>
        <p className={`text-[10px] ${color.sub} mt-0.5`}>
          {isOpen ? "Tap to hide" : "Tap to view"}
        </p>
        {isOpen && (
          <div className="mt-2 space-y-0.5">
            {list.length === 0 ? (
              <p className="text-xs text-gray-400">—</p>
            ) : (
              list.map((n, i) => (
                <p key={i} className="text-xs text-gray-800">
                  {n}
                </p>
              ))
            )}
          </div>
        )}
      </button>
    );
  }

  return (
    <div>
      {/* Professor Attendance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">
          Today's Professor Attendance
        </h2>
        {!profMarked ? (
          <p className="text-xs text-gray-400">
            Professor attendance not marked yet for today.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <ProfBox
              keyName="present"
              label="Present"
              list={profPresentList}
              color={{
                bg: "bg-green-50",
                text: "text-green-700",
                sub: "text-green-600",
              }}
            />
            <ProfBox
              keyName="absent"
              label="Absent"
              list={profAbsentList}
              color={{
                bg: "bg-red-50",
                text: "text-red-600",
                sub: "text-red-500",
              }}
            />
            <ProfBox
              keyName="na"
              label="N/A"
              list={profNAList}
              color={{
                bg: "bg-yellow-50",
                text: "text-yellow-700",
                sub: "text-yellow-600",
              }}
            />
          </div>
        )}
      </div>

      {/* Course+Semester wise Student Attendance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">
          Today's Student Attendance
        </h2>
        {semKeys.length === 0 ? (
          <p className="text-xs text-gray-400">
            No attendance marked yet today.
          </p>
        ) : (
          <div>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select course/semester...</option>
              {semKeys.map((key) => {
                const [course, sem] = key.split("||");
                const d = semMap[key];
                return (
                  <option key={key} value={key}>
                    {course} Sem {sem} — P {d.present.length}, A{" "}
                    {d.absent.length}, N/A {d.na.length}
                  </option>
                );
              })}
            </select>

            {selectedSem && semMap[selectedSem] && (
              <div className="grid grid-cols-3 gap-2">
                <StuBox
                  keyName="present"
                  label="Present"
                  list={semMap[selectedSem].present}
                  color={{
                    bg: "bg-green-50",
                    text: "text-green-700",
                    sub: "text-green-600",
                  }}
                />
                <StuBox
                  keyName="absent"
                  label="Absent"
                  list={semMap[selectedSem].absent}
                  color={{
                    bg: "bg-red-50",
                    text: "text-red-600",
                    sub: "text-red-500",
                  }}
                />
                <StuBox
                  keyName="na"
                  label="N/A"
                  list={semMap[selectedSem].na}
                  color={{
                    bg: "bg-yellow-50",
                    text: "text-yellow-700",
                    sub: "text-yellow-600",
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
