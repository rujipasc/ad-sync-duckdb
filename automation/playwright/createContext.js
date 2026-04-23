import { chromium } from "playwright";
import fs from "fs";
import path from "path";


const statePath = process.env.PLAYWRIGHT_STATE_PATH
  ? path.resolve(process.env.PLAYWRIGHT_STATE_PATH)
  : path.resolve("automation/playwright/auth/state.json");

const downloadsPath = process.env.PLAYWRIGHT_DOWNLOAD_PATH
  ? path.resolve(process.env.PLAYWRIGHT_DOWNLOAD_PATH)
  : path.resolve("datasource");

export const createPageContext = async () => {
  
    if (!fs.existsSync(downloadsPath)) {
    fs.mkdirSync(downloadsPath, { recursive: true });
  }
    const browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox"]
    });

    const context = await browser.newContext({
        storageState: statePath,
        acceptDownloads: true,
        downloadsPath: downloadsPath
    });

    const page = await context.newPage();

    // กัน error แบบ "Target closed"
    page.setDefaultTimeout(60000);

    return { browser, context, page };
};

