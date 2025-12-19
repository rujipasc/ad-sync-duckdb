import path from "path";
import fs from "fs";

function pad(n) {
  return n < 10 ? "0" + n : "" + n;
}

export function buildOutputPath(prefix = "CARDX_EMPLOYEE") {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());

  // const folder = path.join("output/text", `${yyyy}-${mm}`);
  const folder = path.join("C:\\Users\\cx02328\\Card X Company Limited\\HRIS&SS - Interface SCB AD\\Archive", `${yyyy}-${mm}`);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

  const filename = `${prefix}${yyyy}-${mm}-${dd}.txt`;
  return path.join(folder, filename);
}

export function buildCsvOutputPath(prefix = "CARDX_EMPLOYEE") {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());

  // const folder = path.join("output/csv", `${yyyy}-${mm}`);
  const folder = path.join("C:\\Users\\cx02328\\Card X Company Limited\\HRIS&SS - Interface SCB AD\\Archive", `${yyyy}-${mm}`);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

  const filename = `${prefix}${yyyy}-${mm}-${dd}.csv`;
  return path.join(folder, filename);
}