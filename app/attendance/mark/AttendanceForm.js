'use client'export default function AttendanceForm({ students, selectedDate, attendanceMap, sortedKeys, grouped }) {
  function markAll(checked) {
    document.querySelectorAll('input[name="present"]').forEach(cb => cb.checked = checked);
  }

  return (
    <form method="POST" action="/api/attendance/save">
      <input type="hidden" name="date" value={selectedDate} />

      {sortedKeys.length > 0 && (
        <div className="flex gap-2 mb-3">
          <button type="button" onClick={() => markAll(true)}
            className="flex-1 bg-green-50 border border-green-200 text-green-700 py-2 rounded-lg text-xs font-medium">
            ✅ All Present
          </button>
          <button type="button" onClick={() => markAll(false)}
            className="flex-1 bg-red-50 border border-red-200 text-red-700 py-2 rounded-lg text-xs font-medium">
            ❌ All Absent
          </button>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {sortedKeys.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
            No students found.
          </div>
        ) : sortedKeys.map((key) => {
          const { cls, sec, students: secStudents } = grouped[key];
          const sorted = [...secStudents].sort((a, b) => {
            const ra = parseInt(a.roll_number), rb = parseInt(b.roll_number);
            if (!isNaN(ra) && !isNaN(rb)) return ra - rb;
            return (a.name || "").localeCompare(b.name || "");
          });
          return (
            <div key={key} className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
              <div className="bg-indigo-600 px-4 py-2.5 flex justify-between items-center">
                <span className="text-white font-bold text-sm">Class {cls} — Section {sec}</span>
                <span className="bg-white text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {secStudents.length} students
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {sorted.map((student) => (
                  <div key={student.id} className="px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3 min-w-0">
                      <input type="hidden" name="student_id" value={student.id} />
                      <input
                        type="checkbox"
                        name="present"
                        value={String(student.id)}
                        defaultChecked={attendanceMap[student.id] === "present"}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                        <p className="text-xs text-gray-400">Roll {student.roll_number || "—"}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 ml-2 px-2 py-0.5 text-xs rounded-full font-medium ${
                      attendanceMap[student.id] === "present" ? "bg-green-100 text-green-700" :
                      attendanceMap[student.id] === "absent" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-400"
                    }`}>
                      {attendanceMap[student.id] === "present" ? "✓ Present" :
                       attendanceMap[student.id] === "absent" ? "✗ Absent" : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {sortedKeys.length > 0 && (
        <button type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 text-sm font-medium">
          Save Attendance
        </button>
      )}
    </form>
  );
}