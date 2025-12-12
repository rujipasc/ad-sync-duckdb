import ExcelJS from "exceljs";

/**
 * Debug XLSX ทั้งไฟล์:
 * - พิมพ์ header row
 * - พิมพ์คอลัมน์ทั้งหมดแบบ text/value/result
 * - ค้นหาคอลัมน์ที่มีชื่อ 'Active SCB AD'
 * - แสดงข้อมูลตัวอย่าง 10 แถวแรก
 */
export async function debugExcel(xlsxPath) {
  console.log(`\n🔍 DEBUG EXCEL FILE: ${xlsxPath}\n`);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(xlsxPath);

  const sheet = workbook.worksheets[0];
  console.log(`📄 SHEET NAME: ${sheet.name}\n`);

  // ===============================
  // 1) Read header row (Row 1)
  // ===============================
  const headerRow = sheet.getRow(1);
  const headers = [];

  console.log("=== HEADER COLUMNS ===");
  headerRow.eachCell((cell, colNumber) => {
    headers.push(cell.text.trim());
    console.log(`Col ${colNumber}: "${cell.text.trim()}"`);
  });

  console.log("\nTotal columns detected:", headers.length);

  // ===============================
  // 2) Find 'Active SCB AD' column index
  // ===============================
  let activeColIndex = headers.findIndex(h =>
    h.toLowerCase() === "active scb ad".toLowerCase()
  ) + 1;

  console.log(
    activeColIndex > 0
      ? `\n🟩 Active SCB AD column found at index: ${activeColIndex}\n`
      : "\n🟥 Active SCB AD column NOT FOUND!\n"
  );

  // ===============================
  // 3) Show sample rows
  // ===============================
  console.log("\n=== SAMPLE ROWS (1–10) ===");

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 10) return;

    console.log(`\n--- Row ${rowNumber} ---`);
    for (let col = 1; col <= headers.length; col++) {
      const cell = row.getCell(col);
      const value =
        cell.text ??
        cell.value ??
        cell.result ??
        "";

      console.log(`  Col ${col}: "${value}"`);
    }
  });

  console.log("\n✔ Debug complete — check above output.\n");
}


debugExcel('../../../../Card X Company Limited/HRIS&SS - Interface SCB AD/Gen_EmpID&Email.xlsx')