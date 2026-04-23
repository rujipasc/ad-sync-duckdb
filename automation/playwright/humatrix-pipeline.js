import "dotenv/config";
import { createPageContext } from './createContext.js';
import { loginIfExpired } from './auth/login-expired.js';
import { selectRole } from './selectRole.js';
import { selectClassification, selectTemplate } from './selectClassification.js';
import { openPopup } from './openSetting.js';
import { exportReport } from './exportReport.js';


export const humatrixExport = async () => {
    let browser = null;

    try {
        console.log("▶ Starting Humatrix export task...");

        // 1) ตรวจสอบ session
        await loginIfExpired();

        // 2) สร้าง browser + context
        const { browser: br, page } = await createPageContext();
        browser = br;

        // 3) เริ่ม process
        await page.goto("https://cardx.myhumatrix.com/", { waitUntil: "domcontentloaded" });
        console.log("🌐 Opening Humatrix...");

        await selectRole(page);

        await page.goto(
            "https://cardx.myhumatrix.com/COMMON/DIYReport/DIYReport_view.aspx",
            { waitUntil: "domcontentloaded" }
        );

        await selectClassification(page, "pm");
        await selectTemplate(page, "EmpProfile");

        await openPopup(page);

        // รอ popup ปิดจริง ๆ
        await page.waitForLoadState("domcontentloaded");
        await page.waitForLoadState("networkidle");

        // 4) Export CSV
        await exportReport(page);

        console.log("✅ Export completed successfully!");

    } catch (err) {
        console.error("❌ Task failed:", err);
        throw err;
    } finally {
        if (browser) {
            try {
                await browser.close();
                console.log("🧹 Browser closed (safe cleanup)");
            } catch (closeErr) {
                console.error("⚠ Browser.close() error:", closeErr);
            }
            // ⭐ สำคัญมากสำหรับ PM2 Cron job
            // process.exit(0);
        }
    }
};

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('exportHumatrix.js')) {
    humatrixExport();
}
