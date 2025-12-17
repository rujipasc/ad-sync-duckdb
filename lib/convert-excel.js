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

  // 1) Define required columns by header name
  const columnMap = {
    ACTIVE:        { source: "Active SCB AD",                     output: "ACTIVE" },
    HIRE_DATE:     { source: "Join Date",                         output: "HIRE_DATE" },
    END_DATE:      { source: "End Date / สัญญาจ้างสิ้นสุด",       output: "EFFECTIVE_END_DATE" },
    SUPERVISOR_NO: { source: "Supervisor ID",                     output: "SUPERVISOR_NO" },
    SUP_NAME:      { source: "Supervisor Name",                   output: "SUPERVISOR_NAME" },
    TITLE_TH:      { source: "Title (Local)",                     output: "TITLE_TH" },
    FIRST_NAME_TH: { source: "First Name (Local)",                output: "FIRST_NAME_TH" },
    LAST_NAME_TH:  { source: "Last Name (Local)",                 output: "LAST_NAME_TH" },
    TITLE:         { source: "Title (Global)",                    output: "TITLE" },
    FIRST_NAME:    { source: "First Name (Global)",               output: "FIRST_NAME" },
    LAST_NAME:     { source: "Last Name (Global)",                output: "LAST_NAME" },
    EMAIL:         { source: "Office Email",                      output: "EMAIL_ADDRESS" },
    EMP_ID:        { source: "Employee ID",                       output: "EMPLOYEE_NUMBER" }
  };

  // 2) Read header row and detect actual column index
  const headerRow = sheet.getRow(1);
  const headerLookup = {};

  headerRow.eachCell((cell, colIndex) => {
    const name = (cell.text || "").trim().toLowerCase();
    if (name) headerLookup[name] = colIndex;
  });

  // console.log("\n🔍 Detected header mapping:");
  // console.log(headerLookup);

  // 3) Resolve required column positions dynamically
  const resolvedColumns = {};

  for (const key of Object.keys(columnMap)) {
    const expected = columnMap[key].source.toLowerCase();
    const colIndex = headerLookup[expected];

    if (!colIndex) {
      console.error(`🟥 ERROR: Required column missing → "${columnMap[key].source}"`);
      return;
    }

    resolvedColumns[key] = colIndex;
  }

  // console.log("\n🟦 Final column index mapping:");
  // console.log(resolvedColumns);

  // 4) Write CSV header (rename allowed)
  const outputHeader = Object.values(columnMap)
    .map(c => c.output)
    .join(",");
  const output = [outputHeader];

  // 5) Process rows
  let processed = 0;
  let skipped = 0;

  const rowCount = sheet.rowCount;
  for (let i = 2; i <= rowCount; i++) {
    const row = sheet.getRow(i);
    if (!row.hasValues) continue;

    const activeValue = getCellValue(row.getCell(resolvedColumns.ACTIVE))
      .trim()
      .toUpperCase();

    // debug แถวแรก ๆ
    // if (i <= 5) {
    //   console.log(
    //     `Row ${i}: ACTIVE="${activeValue}", EMP_ID="${getCellValue(row.getCell(resolvedColumns.EMP_ID))}"`
    //   );
    // }

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
