import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { sendTeamsNotification } from '../notification/sendTeamsNotification.js';

const statePath = process.env.PLAYWRIGHT_STATE_PATH
  ? path.resolve(process.env.PLAYWRIGHT_STATE_PATH)
  : path.resolve("automation/playwright/auth/state.json");

export const login = async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log("🌐 Opening login page...");
    await page.goto('https://cardx.myhumatrix.com/');

    console.log("✏️ Filling username...");
    await page.fill('input[type="email"]', process.env.USERNAMEX);
    // console.log(process.env.USERNAMEX);
    await page.click('input[type="submit"]');   // Next

    console.log("✏️ Filling password...");
    await page.fill('input[type="password"]', process.env.PASSWORD);
    // console.log(process.env.PASSWORD);
    await page.click('input[type="submit"]');   // Sign in
    console.log("📱 Waiting for MFA approval...");
    try {
        const mfaSelector = '#idRichContext_DisplaySign';
        await page.waitForSelector(mfaSelector, { state: 'visible', timeout: 15000 });
        const mfaNumber = await page.textContent(mfaSelector);
        console.log("🔢 MFA Number:", mfaNumber);
        await sendTeamsNotification(mfaNumber.trim());
    } catch (e) {
        console.error("❌ MFA Not found or Error sending Teams notification:", e);
    }

    // 🧠 Playwright จะรอจน redirect กลับเว็บหลัก
    await page.waitForURL(
        url => String(url).startsWith('https://cardx.myhumatrix.com/'),
        { timeout: 0 }
    );


    console.log("🎉 Login + MFA successful!");
    console.log("💾 Saving session...");

    const stateDir = path.dirname(statePath);
    if (!fs.existsSync(stateDir)) {
        fs.mkdirSync(stateDir, { recursive: true });
    }

    await context.storageState({ path: statePath });

    console.log(`✔ Saved to ${statePath}`);
    await browser.close();
};

// For testing purpose
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("login.js")
) {
  login().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
