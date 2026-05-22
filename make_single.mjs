// make_single.mjs
// Converts College-SaaS (multi-tenant) → Mahila-PG (single-tenant, master id=1)
// Run: node make_single.mjs           (DRY RUN)
// Run: node make_single.mjs --apply

import { readFileSync, writeFileSync } from "fs";
import { readdirSync, statSync } from "fs";
import { join } from "path";

const MASTER_ID = 1;
const APPLY = process.argv.includes("--apply");

// Files to SKIP entirely (login flow needs real user.id)
const SKIP_FILES = [
  "app/api/auth/callback/route.js",
  "app/api/auth/login/route.js",
];

const PATTERNS = [
  // INSERT: user_id: user.id  →  user_id: 1
  {
    name: "INSERT user_id",
    regex: /user_id:\s*user\.id\b/g,
    replace: `user_id: ${MASTER_ID}`,
  },
  // WHERE: eq(X.user_id, user.id)  →  eq(X.user_id, 1)
  {
    name: "WHERE eq user.id",
    regex: /eq\(\s*([a-zA-Z_.]+\.user_id)\s*,\s*user\.id\s*\)/g,
    replace: `eq($1, ${MASTER_ID})`,
  },
  // userId = userResult[0]?.id  (saveAttendance admin branch) → keep dynamic? 
  // No: in single-tenant admin always master. But this comes from session,
  // which IS master after login. Leave as-is (safe).
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
const changed = [];

for (const file of files) {
  const relPath = file.replace(/\\/g, "/");
  if (SKIP_FILES.some((s) => relPath.endsWith(s))) {
    console.log(`  SKIP: ${relPath}`);
    continue;
  }

  const original = readFileSync(file, "utf8");
  let updated = original;
  let fileCount = 0;

  for (const p of PATTERNS) {
    const matches = updated.match(p.regex);
    if (matches) {
      fileCount += matches.length;
      updated = updated.replace(p.regex, p.replace);
    }
  }

  if (updated !== original) {
    changed.push({ file: relPath, count: fileCount });
    totalChanges += fileCount;
    if (APPLY) writeFileSync(file, updated, "utf8");
  }
}

console.log("");
for (const c of changed) {
  console.log(`  ${c.file}  (${c.count})`);
}
console.log("");
console.log(`Files changed: ${changed.length}`);
console.log(`Total replacements: ${totalChanges}`);

if (!APPLY) {
  console.log("\n→ DRY RUN. Run with --apply to write.");
} else {
  console.log("\n✅ Single-tenant conversion done.");
  console.log("Next: new Turso DB, .env, drizzle-kit push, login as developer.");
}