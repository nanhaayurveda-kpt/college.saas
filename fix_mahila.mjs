import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const DRY = !process.argv.includes("--apply");

const fixes = {
  "app/professors/[id]/DeleteTeacher.js": [
    ['import { deleteTeacher } from "@/app/actions";\n\n', ''],
    ['export default function DeleteTeacher({ teacherId, teacherName })', 'export default function DeleteProfessor({ teacherId, teacherName })'],
    ['🗑 Delete Teacher', '🗑 Delete Professor'],
  ],
  "app/students/page.js": [
    [
      '      <div className="grid grid-cols-3 gap-2 mb-4">\n        <div className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-100">\n          <div className="text-lg font-bold text-indigo-700">\n            {allStudents.length}\n          </div>\n          <div className="text-xs text-indigo-500">Total</div>\n        </div>\n        <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">\n          <div className="text-lg font-bold text-green-700">\n            {allStudents.filter((s) => s.fee_status === "paid").length}\n          </div>\n          <div className="text-xs text-green-500">Fees Paid</div>\n        </div>\n        <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-100">\n          <div className="text-lg font-bold text-yellow-700">\n            {allStudents.filter((s) => s.fee_status !== "paid").length}\n          </div>\n          <div className="text-xs text-yellow-600">Pending</div>\n        </div>\n      </div>',
      ''
    ],
  ],
  "app/professors/add/page.js": [
    [
      '              <option value="professor">Professor</option>\n            </select>',
      '              <option value="professor">Professor</option>\n              <option value="hod">Head of Department</option>\n              <option value="principal">Principal</option>\n            </select>'
    ],
    ['placeholder="e.g. M.Sc, Ph.D"', 'placeholder="e.g. MA, MSW, PhD"'],
    [
      '          </div>\n\n          <div>\n            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>',
      '          </div>\n\n          <div className="grid grid-cols-2 gap-3">\n            <div>\n              <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>\n              <input type="date" name="joining_date"\n                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />\n            </div>\n          </div>\n\n          <div>\n            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>'
    ],
  ],
  "app/student/dashboard/page.js": [
    [
      'const pendingFees = feeRecords.filter((f) => f.status === "pending");',
      'const pendingFees = feeRecords.filter((f) => f.status === "pending" || f.status === "partial");'
    ],
    [
      '          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">',
      `          {student.photo_url && (
            <div className="flex justify-center mb-4">
              <img src={student.photo_url} alt={student.name} className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200" />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">`
    ],
  ],
};

let totalChanged = 0;

for (const [rel, replacements] of Object.entries(fixes)) {
  const path = join(ROOT, rel);
  if (!existsSync(path)) { console.log(`MISSING: ${rel}`); continue; }
  const raw = readFileSync(path, "utf8");
  const normalized = raw.replace(/\r\n/g, "\n");
  let updated = normalized;
  for (const [old, newVal] of replacements) {
    updated = updated.replace(old, newVal);
  }
  const changed = updated !== normalized;
  console.log(`${changed ? "CHANGED" : "NO-CHANGE"}: ${rel}`);
  if (!DRY && changed) writeFileSync(path, updated, "utf8");
  if (changed) totalChanged++;
}

console.log(`\n${DRY ? "[DRY RUN]" : "[APPLIED]"} ${totalChanged} files changed`);
if (DRY) console.log("Apply: node fix_mahila.mjs --apply");