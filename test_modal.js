const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5175/logs');
  
  // Wait for network idle and elements to load
  await page.waitForLoadState('networkidle');
  
  // Click the first delete button (Trash icon)
  await page.locator('button[title="Delete Log"]').first().click();
  
  // Wait for modal animation to finish
  await page.waitForTimeout(500);
  
  // Capture screenshot
  await page.screenshot({ path: 'playlog_delete_modal.png' });
  await browser.close();
})();
