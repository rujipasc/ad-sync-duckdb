export const selectRole = async (page) => {
    await page.locator('div.hasOpt').click();
    await page.waitForTimeout(15000);

    await page.locator('span[title="HR Compensation & Benefits"]').click();
    console.log('✔ Role Selected')
}

