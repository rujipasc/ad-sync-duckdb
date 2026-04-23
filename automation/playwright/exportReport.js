import fs from "fs";
import path from "path";
import { yyyymmdd } from "./formatDate.js";

const downloadsPath = process.env.PLAYWRIGHT_DOWNLOAD_PATH
  ? path.resolve(process.env.PLAYWRIGHT_DOWNLOAD_PATH)
  : path.resolve("automation/playwright/downloads");

const debugPath = process.env.PLAYWRIGHT_DEBUG_PATH
  ? path.resolve(process.env.PLAYWRIGHT_DEBUG_PATH)
  : path.resolve("debug");

export const exportReport = async (page) => {
  console.log("⬇ Clicking Export and waiting for download...");

  if (!fs.existsSync(downloadsPath)) {
    fs.mkdirSync(downloadsPath, { recursive: true });
  }

  if (!fs.existsSync(debugPath)) {
    fs.mkdirSync(debugPath, { recursive: true });
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🟦 Export attempt ${attempt}...`);

      const downloadPromise = page.waitForEvent("download", { timeout: 120000 });

      await page.click("#ctl00_ContentHolder_BtnExport", { force: true });
      await page.waitForLoadState("networkidle", { timeout: 10000 });

      const download = await downloadPromise;

      if (download) {
        const newName = `EmpProfiles_${yyyymmdd()}.csv`;
        const targetPath = path.join(downloadsPath, newName);

        await download.saveAs(targetPath);

        console.log(`✔ File downloaded successfully: ${targetPath}`);
        return targetPath;
      }
    } catch (err) {
      console.log(`⚠ Export attempt ${attempt} failed: ${err.message}`);

      const screenshotPath = path.join(
        debugPath,
        `export_error_attempt_${attempt}.png`
      );

      await page.screenshot({
        path: screenshotPath
      });

      if (attempt === 3) {
        console.error("❌ Export failed after 3 attempts.");
        throw err;
      }
    }

    await page.waitForTimeout(2000);
  }
};