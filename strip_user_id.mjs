import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SKIP_DIRS = new Set(["node_modules", ".next", ".git"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".js")) files.push(full);
  }
  return files;
}

const EQ_USER_ID_WITH_COMMA =
  /(,\s*eq\(\s*(?:schema\.)?[\w]+\.user_id\s*,\s*[^()]+?\))|(eq\(\s*(?:schema\.)?[\w]+\.user_id\s*,\s*[^()]+?\)\s*,\s*)/g;

const SOLE_WHERE_USER_ID =
  /\.where\(\s*eq\(\s*(?:schema\.)?[\w]+\.user_id\s*,\s*[^()]+?\)\s*\)/g;

const USER_ID_PROP_LINE = /^\s*user_id:\s*[^,\n]+,?\s*\r?$/;

const SPECIAL_FIXES = [
  {
    file: "app/actions.js",
    from: `  let userId = null;\r\n  if (adminToken) {\r\n    const session = await getSession(adminToken);\r\n    if (!session) redirect("/login");\r\n    const userResult = await db\r\n      .select()\r\n      .from(schema.users)\r\n      .where(eq(schema.users.email, session.email));\r\n    userId = userResult[0]?.id;\r\n  } else if (professorToken) {\r\n    const professorSession = await getSession(professorToken);\r\n    if (!professorSession) redirect("/professor-login");\r\n    const professorResult = await db\r\n      .select()\r\n      .from(schema.professors)\r\n      .where(eq(schema.professors.id, professorSession.professorId));\r\n    userId = professorResult[0]?.user_id;\r\n  }\r\n\r\n  if (!userId) redirect("/login");`,
    to: `  if (adminToken) {\r\n    const session = await getSession(adminToken);\r\n    if (!session) redirect("/login");\r\n  } else if (professorToken) {\r\n    const professorSession = await getSession(professorToken);\r\n    if (!professorSession) redirect("/professor-login");\r\n  }`,
  },
  {
    file: "app/api/attendance/save/route.js",
    from: `  let userId = null;\r\n  let isProfessor = false;\r\n\r\n  if (adminToken) {\r\n    const session = await getSession(adminToken);\r\n    if (!session) {\r\n      return NextResponse.redirect(new URL("/login", request.url), { status: 303 });\r\n    }\r\n    const userResult = await db.select().from(schema.users).where(eq(schema.users.email, session.email));\r\n    userId = userResult[0]?.id;\r\n  } else if (professorToken) {\r\n    let profPayload;\r\n    try {\r\n      const verified = await jwtVerify(professorToken, SECRET);\r\n      profPayload = verified.payload;\r\n    } catch {\r\n      return NextResponse.redirect(new URL("/professor-login", request.url), { status: 303 });\r\n    }\r\n    const profRow = await db.select().from(schema.professors).where(eq(schema.professors.id, profPayload.professorId));\r\n    userId = profRow[0]?.user_id;\r\n    isProfessor = true;\r\n  }\r\n\r\n  if (!userId) {\r\n    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });\r\n  }`,
    to: `  let isProfessor = false;\r\n\r\n  if (adminToken) {\r\n    const session = await getSession(adminToken);\r\n    if (!session) {\r\n      return NextResponse.redirect(new URL("/login", request.url), { status: 303 });\r\n    }\r\n  } else if (professorToken) {\r\n    let profPayload;\r\n    try {\r\n      const verified = await jwtVerify(professorToken, SECRET);\r\n      profPayload = verified.payload;\r\n    } catch {\r\n      return NextResponse.redirect(new URL("/professor-login", request.url), { status: 303 });\r\n    }\r\n    isProfessor = true;\r\n  }`,
  },
];

let filesChanged = 0;
let linesRemoved = 0;
let specialFixesApplied = 0;

for (const file of walk(ROOT)) {
  const original = fs.readFileSync(file, "utf8");
  let content = original;
  const relPath = path.relative(ROOT, file).split(path.sep).join("/");

  const special = SPECIAL_FIXES.find((s) => s.file === relPath);
  if (special && content.includes(special.from)) {
    content = content.replace(special.from, special.to);
    specialFixesApplied++;
  }

  content = content.replace(SOLE_WHERE_USER_ID, "");
  content = content.replace(EQ_USER_ID_WITH_COMMA, "");

  content = content
    .split("\n")
    .filter((line) => {
      const drop = USER_ID_PROP_LINE.test(line);
      if (drop) linesRemoved++;
      return !drop;
    })
    .join("\n");

  if (content !== original) {
    fs.writeFileSync(file + ".bak", original, "utf8");
    fs.writeFileSync(file, content, "utf8");
    filesChanged++;
    console.log("बदली:", relPath);
  }
}

console.log(`\nकुल ${filesChanged} फाइलें बदलीं, ${linesRemoved} property लाइनें हटाईं, ${specialFixesApplied} special auth-fix लगे।`);
console.log("हर बदली फाइल के बगल में .bak बैकअप बना है।");

console.log("\n--- बचे हुए user_id references (मैन्युअल चेक करो) ---");
for (const file of walk(ROOT)) {
  const content = fs.readFileSync(file, "utf8");
  if (content.includes("user_id") || /\buserId\b/.test(content)) {
    const lines = content.split("\n");
    lines.forEach((line, i) => {
      if (/user_id|\buserId\b/.test(line)) {
        console.log(`${path.relative(ROOT, file)}:${i + 1}: ${line.trim()}`);
      }
    });
  }
}