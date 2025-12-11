import path from "path";
import fs from "fs";

function pad(n) {
  return n < 10 ? "0" + n : "" + n;
}

export function buildOutputPath() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());

  const folder = path.join("output", `${yyyy}-${mm}`);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

  const filename = `CARDX_EMPLOYEE_${yyyy}-${mm}-${dd}.txt`;
  return path.join(folder, filename);
}
