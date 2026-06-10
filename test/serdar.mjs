// Ad-hoc check for the footer-logo easter egg: clicking #footerLogo opens a
// .serdar-overlay lightbox, and clicking the backdrop (or Esc) closes it.
import { launch, loadPage } from './browser.mjs';

const browser = await launch();
const { page, errors } = await loadPage(browser, 'PlayTools.html', { enter: true });

let failed = 0;
const check = (cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`); if (!cond) failed++; };

// Footer logo should be wired up as a button.
const wired = await page.evaluate(() => {
  const l = document.getElementById('footerLogo');
  return !!l && l.getAttribute('role') === 'button' && l.getAttribute('tabindex') === '0';
});
check(wired, 'footer logo is keyboard-focusable button');

// Click it -> overlay appears with the expected image src.
await page.evaluate(() => document.getElementById('footerLogo').click());
await page.waitForTimeout(100);
const opened = await page.evaluate(() => {
  const ov = document.querySelector('.serdar-overlay');
  const img = ov && ov.querySelector('img');
  return !!ov && !!img && img.src === 'https://www.playologyentertainment.com/personal/Serdar.jpg';
});
check(opened, 'click opens overlay with Serdar.jpg');

// A second click while open should not stack a duplicate overlay.
await page.evaluate(() => document.getElementById('footerLogo').click());
await page.waitForTimeout(50);
const single = await page.evaluate(() => document.querySelectorAll('.serdar-overlay').length === 1);
check(single, 'no duplicate overlay when clicked again');

// Clicking the overlay closes it.
await page.evaluate(() => document.querySelector('.serdar-overlay').click());
await page.waitForTimeout(100);
const closed = await page.evaluate(() => !document.querySelector('.serdar-overlay'));
check(closed, 'clicking overlay closes it');

// Esc also closes (re-open first).
await page.evaluate(() => document.getElementById('footerLogo').click());
await page.waitForTimeout(50);
await page.keyboard.press('Escape');
await page.waitForTimeout(100);
const escClosed = await page.evaluate(() => !document.querySelector('.serdar-overlay'));
check(escClosed, 'Escape closes overlay');

const noErrors = errors.length === 0;
check(noErrors, 'no console/page errors');
for (const e of errors.slice(0, 5)) console.log('   - error: ' + e);

await browser.close();
console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
