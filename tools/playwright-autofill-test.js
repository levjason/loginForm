const { chromium } = require('playwright');

(async () => {
  const url = process.env.APP_URL || 'http://localhost:4200';
  console.log('Starting Playwright test against', url);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for the simulate button to be present
    await page.waitForSelector('button:has-text("Simulate autofill")', { timeout: 10000 });

    // Click the simulate autofill button
    await page.click('button:has-text("Simulate autofill")');

    // Wait briefly for the CVA and form to update
    await page.waitForTimeout(300);

    // Read values from the web components
    const username = await page.$eval('cds-text-input', (el) => (el && (el.value ?? el.getAttribute('value'))) || '');
    const password = await page.$eval('cds-password-input', (el) => (el && (el.value ?? el.getAttribute('value'))) || '');

    console.log('Detected username:', username);
    console.log('Detected password:', password ? '***' : '(empty)');

    const pass = username === 'alice@example.com' && password === 'Password123';
    if (!pass) {
      console.error('Autofill test failed.');
      process.exit(2);
    }

    console.log('Autofill test passed');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Error running Playwright autofill test:', err);
    try { await browser.close(); } catch (e) {}
    process.exit(3);
  }
})();
