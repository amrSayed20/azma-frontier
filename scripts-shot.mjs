import { chromium } from 'playwright';
const routes = (process.argv[2] || '/').split(',');
const suffix = process.argv[3] || 'x';
const full = process.argv[4] === 'full';
const browser = await chromium.launch();
const ctx = await browser.newContext();
await ctx.addCookies([{ name: 'azma_session', value: '3b2d8a88-5f2b-42ff-9139-e141c4725010', domain: 'localhost', path: '/' }]);
for (const r of routes) {
  for (const [name, vp] of [['m', {width: 390, height: 844}], ['d', {width: 1440, height: 900}]]) {
    const page = await ctx.newPage();
    await page.setViewportSize(vp);
    await page.goto('http://localhost:3001' + r, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e=>console.log('nav err', r, e.message.split('\n')[0]));
    await page.waitForTimeout(4000);
    try { await page.screenshot({ timeout: 15000, path: `/downloads/shots/${(r.replaceAll('/','_') || 'home')}-${name}${suffix}.png`, fullPage: full }); } catch(e) { console.log("shot timeout", r, name); }
    console.log('shot', r, name, page.url().includes(r) ? '' : ('REDIRECT->' + page.url()));
    await page.close();
  }
}
await browser.close();
