import { runQueryFromFile } from "./query.js";

// Simple color functions (ไม่ต้องลงเพิ่ม)
const color = {
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
  bold: (t) => `\x1b[1m${t}\x1b[0m`
};

// Render rows as table
function printTable(rows) {
  if (!rows || rows.length === 0) {
    console.log(color.yellow("No rows returned."));
    return;
  }

  console.log(color.cyan("\n=== QUERY RESULT TABLE ===\n"));
  console.table(rows); // ← terminal-friendly table
}

async function main() {
  console.log(color.bold("📌 Running EMP AD Query..."));

  const rows = await runQueryFromFile("./duck/emp_ad.sql");

  // Count
  console.log(color.green(`\n✔ Total Records: ${rows.length}\n`));

  // Pretty table
  printTable(rows.slice(0, 10)); // แสดงตัวอย่าง 10 rows
  console.log(color.yellow("… (showing first 10 rows only)\n"));
}

main().catch(err => console.error(err));
