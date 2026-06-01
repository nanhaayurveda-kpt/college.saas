const fs = require("fs");
const path = require("path");

const BASE = "E:\\mahila-pg";

const toDelete = [
  "app\\api\\activate\\route.js",
  "app\\expired\\page.js",
];

for (const f of toDelete) {
  const p = path.join(BASE, f);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log("DELETED: " + f);
  } else {
    console.log("SKIP (not found): " + f);
  }
}

console.log("\nDone!");