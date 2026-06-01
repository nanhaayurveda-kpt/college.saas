const fs = require("fs");
const path = require("path");

const BASE = "E:\\mahila-pg";

// 1. FeeAddForm.js — late fee type add + receipt_no field हटाओ
const feeFormPath = path.join(BASE, "components\\FeeAddForm.js");
let feeForm = fs.readFileSync(feeFormPath, "utf8");

// late fee type add करो
feeForm = feeForm.replace(
  '<option value="misc">Miscellaneous</option>',
  '<option value="misc">Miscellaneous</option>\r\n            <option value="late">Late Payment Fine</option>'
);

// receipt_no field हटाओ
feeForm = feeForm.replace(
  /\r?\n\s*<div>\s*\r?\n\s*<label[^>]*>Receipt No\.<\/label>\s*\r?\n\s*<input[^/]*\/>\s*\r?\n\s*<\/div>/,
  ""
);

fs.writeFileSync(feeFormPath, feeForm, "utf8");
console.log("DONE: components\\FeeAddForm.js");

// 2. app/api/fees/add/route.js — auto receipt_no
const feesAddPath = path.join(BASE, "app\\api\\fees\\add\\route.js");
let feesAdd = fs.readFileSync(feesAddPath, "utf8");

// auto receipt_no generate करो
feesAdd = feesAdd.replace(
  "  await db.insert(schema.fees).values({",
  `  // Auto-generate receipt number: RCP-YYYYMMDD-XXXX
  const now = new Date();
  const datePart = \`\${now.getFullYear()}\${String(now.getMonth() + 1).padStart(2, "0")}\${String(now.getDate()).padStart(2, "0")}\`;
  const randPart = Math.floor(1000 + Math.random() * 9000);
  const receiptNo = parsed.data.receipt_no || \`RCP-\${datePart}-\${randPart}\`;

  await db.insert(schema.fees).values({`
);

// दोनों receipt_no references बदलो
feesAdd = feesAdd.replace(
  /receipt_no: parsed\.data\.receipt_no \|\| null,/g,
  "receipt_no: receiptNo,"
);

fs.writeFileSync(feesAddPath, feesAdd, "utf8");
console.log("DONE: app\\api\\fees\\add\\route.js");

console.log("\nDone!");