"use client";

export default function DeleteNotice({ noticeId, title }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm(`Delete notice "${title}"?`)) {
          window.location.href = `/notices/${noticeId}/delete`;
        }
      }}
      className="ml-3 shrink-0 text-xs text-red-500 font-medium bg-red-50 px-3 py-1.5 rounded-lg"
    >
      🗑️ Delete
    </button>
  );
}