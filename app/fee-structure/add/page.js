import { COURSES } from "@/lib/courses";

export default async function AddFeeStructurePage() {
  const courses = COURSES;

  const now = new Date();
  const baseYear = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  const currentAcademicYear = `${baseYear}-${String(baseYear + 1).slice(-2)}`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Add Fee Structure</h1>
        <p className="text-gray-500 text-xs mt-0.5">Define course-wise fee</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 max-w-md">
        <form method="POST" action="/api/fee-structure/add" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course <span className="text-red-500">*</span>
            </label>
            <select name="course" required defaultValue=""
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select...</option>
              {courses.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fee Type <span className="text-red-500">*</span>
            </label>
            <select name="fee_type" required defaultValue="monthly"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="monthly">Monthly Fee</option>
              <option value="admission">Admission Fee</option>
              <option value="exam">Exam Fee</option>
              <option value="transport">Transport Fee</option>
              <option value="misc">Miscellaneous</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input type="number" name="amount" required min="1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input type="text" name="academic_year" defaultValue={currentAcademicYear}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit"
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium">
              Save
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