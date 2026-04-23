export const selectClassification = async (page, keyword) => {
  const input = page.locator('#token-input-ctl00_ContentHolder_acClassification');

  console.log(`🔍 Selecting classification: ${keyword}`);

  // 1) focus + clear
  await input.click();
  await input.fill('');
  await page.waitForTimeout(200);

  // 2) type keyword
  await input.type(keyword, { delay: 120 });

  // 3) รอ autocomplete request (Humatrix จะยิง handler)
  await page.waitForResponse(
    (res) =>
      res.url().includes("acClassification") &&
      res.status() === 200,
    { timeout: 5000 }
  ).catch(() => console.log("⚠ No autocomplete response, using keyboard fallback"));

  // 4) รอ dropdown render
  await page.waitForTimeout(600);

  // 5) press arrowDown (บางครั้งต้องกด 2 รอบ)
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(200);
  await page.keyboard.press("Enter");

  // 6) confirm selection (optional)
  console.log(`✔ Classification selected: ${keyword.toUpperCase()}`);
};


export const selectTemplate = async (page, keyword) => {
  const input = page.locator('#token-input-ctl00_ContentHolder_acTemplateCode');

  console.log(`🔍 Selecting classification: ${keyword}`);

  // 1) focus + clear
  await input.click();
  await input.fill('');
  await page.waitForTimeout(200);

  // 2) type keyword
  await input.type(keyword, { delay: 120 });

  // 3) รอ autocomplete request (Humatrix จะยิง handler)
  await page.waitForResponse(
    (res) =>
      res.url().includes("acClassification") &&
      res.status() === 200,
    { timeout: 5000 }
  ).catch(() => console.log("⚠ No autocomplete response, using keyboard fallback"));

  // 4) รอ dropdown render
  await page.waitForTimeout(600);

  // 5) press arrowDown (บางครั้งต้องกด 2 รอบ)
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(200);
  await page.keyboard.press("Enter");

  // 6) confirm selection (optional)
  console.log(`✔ Classification selected: ${keyword.toUpperCase()}`);
};
