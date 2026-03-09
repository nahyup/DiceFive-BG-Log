const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  // Inject a play log directly into state so we have something to delete
  if (fs.existsSync('./data.json')) {
    const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
    if (!data.state.logs.length) {
      data.state.logs.push({
        id: 'test-delete-log-1',
        gameId: 'bgg-real-1',
        date: new Date().toISOString(),
        players: [{ playerId: 'p1', score: 100 }],
        winnerId: 'p1',
        reviewMemo: 'Trying to delete this'
      });
      fs.writeFileSync('./data.json', JSON.stringify(data));
    }
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  // We need to figure out what port Vite is actually running on. Typical is 5174 or 5175 if 5173 is busy.
  // We'll try a few because the background process might still be running.
  let connected = false;
  for (const port of [5173, 5174, 5175, 5176]) {
    try {
      await page.goto(`http://localhost:${port}/logs`, { timeout: 3000 });
      connected = true;
      break;
    } catch(e) {}
  }
  
  if (!connected) {
    console.error("Could not find dev server");
    process.exit(1);
  }
  
  await page.waitForLoadState('networkidle');
  
  // Wait for the delete button to exist
  await page.waitForSelector('button[title="Delete Log"]', { state: 'attached', timeout: 10000 });
  
  // Click the first delete button using force since it might be hidden by CSS opacity-0
  await page.locator('button[title="Delete Log"]').first().click({ force: true });
  
  // Wait for modal animation to finish
  await page.waitForTimeout(500);
  
  // Capture screenshot
  await page.screenshot({ path: 'playlog_delete_modal.png' });
  await browser.close();
})();
