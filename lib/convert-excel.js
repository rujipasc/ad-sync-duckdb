import ExcelJS from "exceljs";
import fs from "node:fs";

/**
 * Convert XLSX → CSV แบบ robust ต่อ column reorder + rename header
 * @param {*} xlsxPath   input XLSX file
 * @param {*} csvPath    output CSV file
 * @param {*} sheetName  sheet to read
 */
export async function convertExcelToCSV(xlsxPath, csvPath, sheetName) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(xlsxPath);

  console.log(`📘 Loaded: ${xlsxPath}`);

  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    console.error(`🟥 ERROR: Sheet "${sheetName}" not found.`);
    console.log("Available sheets:");
    workbook.worksheets.forEach(ws => console.log(" -", ws.name));
    return;
  }

  console.log(`🟦 Using sheet: ${sheet.name}`);

  // -------------------------------------------------------
  // 1) Define required columns by header name
  // -------------------------------------------------------
  
  const columnMap = {
    "active": "Active SCB AD",
    "join_date": "Join Date",
    "end_date": "End Date / สัญญาจ้างสิ้นสุด",
    "sup_id": "Supervisor ID",
    "sup_name": "Supervisor Name",
    "local_title": "Title (Local)",
    "local_fname": "First Name (Local)",
    "local_lname": "Last Name (Local)",
    "global_title": "Title (Global)",
    "global_fname": "First Name (Global)",
    "global_lname": "Last Name (Global)",
    "office_email": "Office Email",
    "gen_email": "Gen Email",
    "emp_id": "Employee ID"
  };

  // -------------------------------------------------------
  // 2) Read header row and detect actual column index
  // -------------------------------------------------------

  const headerRow = sheet.getRow(1);
  const headerLookup = {};

  headerRow.eachCell((cell, colIndex) => {
    const name = (cell.text || "").trim().toLowerCase();
    if (name) headerLookup[name] = colIndex;
  });

  console.log("\n🔍 Detected header mapping:");
  console.log(headerLookup);

  // -------------------------------------------------------
  // 3) Resolve required column positions dynamically
  // -------------------------------------------------------

  const resolvedColumns = {};

  for (const key of Object.keys(columnMap)) {
    const expected = columnMap[key].toLowerCase();
    const colIndex = headerLookup[expected];

    if (!colIndex) {
      console.error(`🟥 ERROR: Required column missing → "${columnMap[key]}"`);
      return;
    }

    resolvedColumns[key] = colIndex;
  }

  console.log("\n🟦 Final column index mapping:");
  console.log(resolvedColumns);

  // -------------------------------------------------------
  // 4) Write CSV header (rename allowed)
  // -------------------------------------------------------

  const outputHeader = Object.values(columnMap).join(",");
  const output = [outputHeader];

  // -------------------------------------------------------
  // 5) Process rows
  // -------------------------------------------------------

  let processed = 0;
  let skipped = 0;

  const rowCount = sheet.rowCount;
  for (let i = 2; i <= rowCount; i++) {
    const row = sheet.getRow(i);
    if (!row.hasValues) continue;

    // Active filter
    const activeValue = getCellValue(row.getCell(resolvedColumns.active)).trim().toUpperCase();
    if (activeValue !== "Y") {
      skipped++;
      continue;
    }

    const selected = [];

    for (const key of Object.keys(columnMap)) {
      const colIndex = resolvedColumns[key];
      let v = getCellValue(row.getCell(colIndex));

      if (String(v) === "[object Object]") v = "";
      v = escapeCSV(v);

      selected.push(v);
    }

    output.push(selected.join(","));
    processed++;
  }

  fs.writeFileSync(csvPath, output.join("\n"), "utf8");

  console.log(`\n✔ CSV exported: ${csvPath}`);
  console.log(`✔ Processed (Active=Y): ${processed}`);
  console.log(`⏭ Skipped: ${skipped}`);
}

function escapeCSV(v) {
  v = String(v ?? "");
  v = v.replace(/"/g, '""');
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    v = `"${v}"`;
  }
  return v;
}

function getCellValue(cell) {
  if (!cell || cell.value === null || cell.value === undefined) return "";

  if (cell.value instanceof Date) {
    return cell.value.toISOString().split("T")[0];
  }

  if (cell.value?.text) return cell.value.text;
  if (cell.value?.richText) return cell.value.richText.map(t => t.text).join("");

  return cell.value;
}
