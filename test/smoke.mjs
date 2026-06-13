// Smoke tests for the PlayTools HTML apps. Loads each page in headless
// Chromium, clicks through the intro where present, exercises a hash route,
// captures a screenshot, and fails if any console or page errors fire.
//
// Run with: npm run test:browser

import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch, loadPage } from './browser.mjs';

const outDir = fileURLToPath(new URL('./output/', import.meta.url));
mkdirSync(outDir, { recursive: true });

const cases = [
  { name: 'playtools-dna', file: 'PlayTools.html', enter: true, hash: '#/dna' },
  { name: 'playtools-crossload', file: 'PlayTools.html', enter: true, hash: '#/arcade/crossload', drive: 'crossload' },
  { name: 'playtools-rig', file: 'PlayTools.html', enter: true, hash: '#/rig', drive: 'rig' },
  { name: 'sharecard-studio', file: 'sharecard-studio.html' },
];

const browser = await launch();
let failed = 0;

for (const c of cases) {
  const { page, errors, warnings } = await loadPage(browser, c.file, c);

  // For real-time cabinets, actually start the game and drive a few inputs so
  // the RAF loop, collision/death/respawn and dock paths get exercised — a
  // static route mount alone won't catch runtime errors inside the loop.
  if (c.drive === 'crossload') {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('button.btn.primary')]
        .find((x) => /START|Restart/i.test(x.textContent));
      if (b) b.click();
    });
    for (let i = 0; i < 24; i++) {
      await page.keyboard.press(i % 6 === 5 ? 'ArrowLeft' : 'ArrowUp');
      await page.waitForTimeout(110);
    }
    await page.waitForTimeout(400);
  }

  // The Rig: collect the daily payout (a fresh load grants +100 NetCoin),
  // buy the 80-cost entry part from the NetStore, then open the battlestation
  // Share Card — so the idle/daily/store/share paths all execute, not just the
  // route mount.
  if (c.drive === 'rig') {
    await page.evaluate(() => {
      const claim = [...document.querySelectorAll('button.btn.primary')]
        .find((b) => /Collect Daily/i.test(b.textContent));
      if (claim) claim.click();
    });
    await page.waitForTimeout(200);
    await page.evaluate(() => { if (window.Rig) window.Rig.buy('gpu1'); window.location.hash = '#/rig/store'; });
    await page.waitForTimeout(300);
    await page.evaluate(() => { window.location.hash = '#/rig'; });
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      const share = [...document.querySelectorAll('button.btn')]
        .find((b) => /Share Battlestation/i.test(b.textContent));
      if (share) share.click();
    });
    await page.waitForTimeout(400);
  }

  const title = await page.title();
  await page.screenshot({ path: outDir + c.name + '.png' });
  const ok = errors.length === 0 && title.length > 0;
  if (!ok) failed++;
  const warnNote = warnings.length ? `  warnings=${warnings.length}` : '';
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.file}  title="${title}"  errors=${errors.length}${warnNote}`);
  for (const e of errors.slice(0, 5)) console.log('   - error: ' + e);
  for (const w of warnings.slice(0, 3)) console.log('   - warn:  ' + w);
  // Note: don't close pages individually — the in-policy @sparticuz/chromium
  // launches with --single-process, where closing the last page tears down
  // the whole browser. Pages are released when the browser closes below.
}

await browser.close();
console.log(failed ? `\n${failed} case(s) failed` : '\nAll cases passed');
process.exit(failed ? 1 : 0);
