export const dynamic = "force-dynamic";import { COURSES } from "@/lib/courses";

export default async function AddExamPage() {
  const courses = COURSES;
  const semesters = ["1", "2", "3", "4", "5", "6"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Schedule New Exam</h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Fill in the exam details below
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form method="POST" action="/api/exams/add" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam Name <span className="text-red-500">*</span>
            </label>
            <select
              name="name"
              required
              defaultValue=""
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select...</option>
              <option value="Internal Assessment 1">
                Internal Assessment 1
              </option>
              <option value="Internal Assessment 2">
                Internal Assessment 2
              </option>
              <option value="Mid Term Exam">Mid Term Exam</option>
              <option value="Practical Exam">Practical Exam</option>
              <option value="Annual Exam">Annual Exam</option>
              <option value="Back Paper Exam">Back Paper Exam</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                name="course"
                required
                defaultValue=""
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select...</option>
                {courses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <select
                name="semester"
                defaultValue=""
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All</option>
                {semesters.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              required
              placeholder="e.g. Economics"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam Type <span className="text-red-500">*</span>
            </label>
            <select
              name="exam_type"
              required
              defaultValue="internal"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="internal">Internal</option>
              <option value="midterm">Mid Term</option>
              <option value="practical">Practical</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="exam_date"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="max_marks"
                required
                defaultValue={100}
                min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passing Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="passing_marks"
                required
                defaultValue={36}
                min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year
            </label>
            <input
              type="text"
              name="academic_year"
              placeholder="e.g. 2024-25"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium"
            >
              Save Exam
            </button>
            <a
              href="/exams"
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
