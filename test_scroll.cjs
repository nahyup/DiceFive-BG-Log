const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 1080 } });
  
  let connected = false;
  for (const port of [5173, 5174, 5175, 5176]) {
    try {
      await page.goto(`http://localhost:${port}/statistics`, { timeout: 3000 });
      connected = true;
      break;
    } catch(e) {}
  }
  
  await page.waitForLoadState('networkidle');
  
  // Scroll down specifically to the games section
  const headingHandle = await page.locator('text=Most Played Games').first();
  await headingHandle.scrollIntoViewIfNeeded();
  
  await page.waitForTimeout(500);
  
  await page.screenshot({ path: 'tie_test_top_player_games.png' });
  await browser.close();
})();
