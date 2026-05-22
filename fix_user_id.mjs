// fix_user_id.mjs
// Run: node fix_user_id.mjs           (DRY RUN)
// Run: node fix_user_id.mjs --apply

import { readFileSync, writeFileSync } from "fs";
import { readdirSync, statSync } from "fs";
import { join } from "path";

const MASTER_ID = 1;
const APPLY = process.argv.includes("--apply");

const PATTERNS = [
  {
    name: "INSERT user_id assignment",
    regex: /user_id:\s*user\.id\b/g,
    replace: `user_id: ${MASTER_ID}`,
  },
  {
    name: "INSERT user_id parseInt",
    regex: /user_id:\s*parseInt\(user\.id\)/g,
    replace: `user_id: ${MASTER_ID}`,
  },
  {
    name: "WHERE eq with user.id",
    regex: /eq\(\s*([a-zA-Z_.]+\.user_id)\s*,\s*user\.id\s*\)/g,
    replace: `eq($1, ${MASTER_ID})`,
  },
  {
    name: "WHERE eq with user.id (no schema)",
    regex: /eq\(\s*([a-zA-Z_]+\.user_id)\s*,\s*user\.id\s*\)/g,
    replace: `eq($1, ${MASTER_ID})`,
  },
];

function walk(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".next" || entry.startsWith("."))
        continue;
      walk(full, results);
    } else if (entry.endsWith(".js")) {
      results.push(full);
    }
  }
  return results;
}

const files = walk("app");
console.log(`Scanning ${files.length} files in app/ ...`);
console.log(APPLY ? "MODE: APPLY" : "MODE: DRY RUN");
console.log("");

let totalChanges = 0;
const changedFiles = [];

for (const file of files) {
  const original = readFileSync(file, "utf8");
  let updated = original;
  const fileChanges = [];

  for (const p of PATTERNS) {
    const matches = updated.match(p.regex);
    if (matches) {
      fileChanges.push({ name: p.name, count: matches.length });
      updated = updated.replace(p.regex, p.replace);
    }
  }

  if (updated !== original) {
    changedFiles.push({ file, changes: fileChanges });
    totalChanges += fileChanges.reduce((s, c) => s + c.count, 0);
    if (APPLY) {
      writeFileSync(file, updated, "utf8");
    }
  }
}

console.log(`Files changed: ${changedFiles.length}`);
console.log(`Total replacements: ${totalChanges}`);

if (!APPLY) {
  console.log("\n→ DRY RUN. Run with --apply to write.");
} else {
  console.log("\n✅ Changes applied.");
}