const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('file://' + __dirname + '/dashboard.html', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'screenshot.png' });
  
  console.log('Took screenshot of dashboard.html');
  
  await page.goto('file://' + __dirname + '/login.html', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'screenshot_login.png' });
  
  console.log('Took screenshot of login.html');
  
  await browser.close();
})();
