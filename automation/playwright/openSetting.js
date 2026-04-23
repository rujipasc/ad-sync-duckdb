export const openPopup = async (page) => {
  for (let i = 0; i < 3; i++) {
    console.log(`🟦 Opening popup… attempt ${i + 1}`);

    await page.click('#ctl00_ContentHolder_lblEdit', { force: true });

    try {
      await page.waitForSelector('li.TabHeader', {
        timeout: 3000,
        state: 'attached'
      });

      console.log("⚙️ Setting popup opened");
      break;
    } catch (_) {}
  }

  console.log("✔ Popup ready");

  // เปิด Format tab
  await page.click('a[href="#tabs_pop-3"]');
  await page.waitForTimeout(500);
  console.log("🎉 Format tab opened");

  // ตั้งค่า Format
  await page.selectOption('.LayoutFileType select.ddlColumns_format', 'CSV');
  await page.selectOption('.LayoutDelimiter select.ddlColumns_format', 'Semicolon');
  await page.selectOption('.LayoutDataTime select.ddlColumns_format', 'D08');

  console.log("✔ Format settings applied");

  await page.waitForTimeout(500);
  await page.locator('#tabs_pop-3 td.c_content', { hasText: 'OK' }).click({ force: true });
  console.log("🎉 Format OK clicked");

  await page.waitForTimeout(2000);
};
