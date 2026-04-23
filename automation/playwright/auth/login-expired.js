import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { login } from "./login.js";

const statePath = process.env.PLAYWRIGHT_STATE_PATH
  ? path.resolve(process.env.PLAYWRIGHT_STATE_PATH)
  : path.resolve("automation/playwright/auth/state.json");

const HUMATRIX_BASE_URL = "https://cardx.myhumatrix.com/";
const SESSION_CHECK_URL =
  process.env.SESSION_CHECK_URL ||
  "https://cardx.myhumatrix.com/COMMON/ReportPortal/ReportPortal.aspx";
const SESSION_CHECK_SELECTOR =
  '#Container_Tab a[href="#tab-Interface"]';

const isLoginUrl = (url = "") =>
  url.includes("login.microsoftonline.com") ||
  url.includes("signin") ||
  url.includes("saml");

const isHumatrixUrl = (url = "") => url.startsWith(HUMATRIX_BASE_URL);

export const loginIfExpired = async () => {
  // ไม่มีไฟล์ session → login ใหม่
  if (!fs.existsSync(statePath)) {
    console.log("⚠️ No session detected. Logging in...");
    await login();
    return;
  }

  console.log("🔍 Session file found. Checking validity...");

  const browser = await chromium.launch({ headless: true }); 
  const context = await browser.newContext({
    storageState: statePath
  });

  const page = await context.newPage();

  try {
    await page.goto(SESSION_CHECK_URL, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => null);

    let currentUrl = page.url();

    // ถ้า redirect ไปหน้า login/signout ให้ถือว่าหมดอายุทันที
    if (isLoginUrl(currentUrl)) {
      console.log("⛔ Session expired → Re-login");
      await browser.close();
      await login();
      return;
    }

    // CASE 1: Session ใช้ได้ ต้องยังอยู่ใน myhumatrix และเห็น element ของหน้า portal จริง
    if (isHumatrixUrl(currentUrl)) {
      const portalSelector = page.locator(SESSION_CHECK_SELECTOR).first();
      const isPortalReady = await portalSelector
        .waitFor({ state: "visible", timeout: 10000 })
        .then(() => true)
        .catch(() => false);

      currentUrl = page.url();
      if (isPortalReady && isHumatrixUrl(currentUrl) && !isLoginUrl(currentUrl)) {
        console.log("✔ Session valid");
        await browser.close();
        return;
      }
    }

    // CASE 3: ไม่รู้หน้าอะไร หรือยังเปิด portal ไม่ได้ → บังคับ relogin
    console.log(`⚠️ Unknown state, relogin enforced (url: ${currentUrl})`);
    await browser.close();
    await login();

  } catch (err) {
    console.error("❌ Error checking session:", err);
  }

  await browser.close();
};

if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("login-expired.js")
) {
  loginIfExpired().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}