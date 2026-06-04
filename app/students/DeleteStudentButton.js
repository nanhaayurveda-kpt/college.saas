"use client";

export default function DeleteStudentButton({ studentId, studentName }) {
  function handleSubmit(e) {
    if (!confirm(`Delete ${studentName || "this student"}? This cannot be undone.`)) {
      e.preventDefault();
    }
  }

  return (
    <form
      method="POST"
      action="/api/students/delete"
      onSubmit={handleSubmit}
      className="inline"
    >
      <input type="hidden" name="id" value={studentId} />
      <button type="submit" className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-medium">
        Delete
      </button>
    </form>
  );
}