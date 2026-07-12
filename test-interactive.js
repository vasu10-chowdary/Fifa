const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  const errors = [];
  const logs = [];
  
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => errors.push(`PAGE ERROR: ${err.toString()}`));
  page.on('requestfailed', req => errors.push(`FAILED: ${req.url()} — ${req.failure().errorText}`));
  page.on('response', res => {
    if (res.status() >= 400) errors.push(`HTTP ${res.status()}: ${res.url()}`);
  });
  
  await page.goto('http://127.0.0.1:8080/dashboard.html', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  // Check which nav items are visible vs hidden
  const navItems = await page.evaluate(() => {
    const items = document.querySelectorAll('.sidebar-item');
    return Array.from(items).map(el => ({
      label: el.textContent.trim(),
      display: el.style.display,
      view: el.getAttribute('data-view'),
      visible: el.offsetParent !== null
    }));
  });
  
  console.log('=== NAV ITEMS STATE ===');
  navItems.forEach(item => console.log(JSON.stringify(item)));
  
  // What is the current role in localStorage?
  const role = await page.evaluate(() => localStorage.getItem('pulseos_selectedRole'));
  console.log('\nRole in localStorage:', role);
  
  // What is the active view?
  const activeView = await page.evaluate(() => {
    const av = document.querySelector('.dashboard-view.active');
    return av ? av.id : 'NONE';
  });
  console.log('Active view:', activeView);
  
  if (errors.length > 0) {
    console.log('\n=== ERRORS ===');
    errors.forEach(e => console.log(e));
  }
  
  await browser.close();
})();
