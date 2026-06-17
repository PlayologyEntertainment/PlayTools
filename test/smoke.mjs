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
  { name: 'playtools-pets', file: 'PlayTools.html', enter: true, hash: '#/pets', drive: 'pets' },
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
    // Buy a hardware part + a cosmetic, then convert NetCoin to Jack-In credits.
    await page.evaluate(() => {
      if (window.Rig) {
        window.Rig.buy('gpu1');
        window.Rig.buy('desktoy');
        window.Rig.buyCredits('cr1');
      }
      window.location.hash = '#/rig/store';
    });
    await page.waitForTimeout(300);
    // Click through all three NetStore tabs.
    for (const re of [/Battlestation/i, /Credits/i, /Hardware/i]) {
      await page.evaluate((src) => {
        const b = [...document.querySelectorAll('.seg button')].find((x) => new RegExp(src).test(x.textContent));
        if (b) b.click();
      }, re.source);
      await page.waitForTimeout(150);
    }
    // Open Jack-In so the seeded-session path (purchased credits) executes.
    await page.evaluate(() => { window.location.hash = '#/arcade/jackin'; });
    await page.waitForTimeout(400);
    await page.evaluate(() => { window.location.hash = '#/rig'; });
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      const share = [...document.querySelectorAll('button.btn')]
        .find((b) => /Share Battlestation/i.test(b.textContent));
      if (share) share.click();
    });
    await page.waitForTimeout(400);
  }

  // RetroPets: grant NetCoin, open Loot Boxes (gacha + pity + dupe→Shard), run the
  // care actions on the stable, then play the training mini-games so the gacha,
  // care, idle and GamerDNA-skill paths all execute — not just the route mount.
  if (c.drive === 'pets') {
    await page.evaluate(() => {
      if (window.Rig) window.Rig.grant(20000);
      // Open enough boxes to trip the pity timer and likely a duplicate, plus a
      // few of the pricier Uncommon box so the multi-box catalog path executes.
      if (window.Pets) {
        for (let i = 0; i < 14; i++) window.Pets.openBox();
        for (let i = 0; i < 3; i++) window.Pets.openBox('uncommon');
      }
      window.location.hash = '#/pets';
    });
    await page.waitForTimeout(300);
    // Feed + pet the first Pet a few times via the card buttons.
    await page.evaluate(() => {
      const click = (re) => [...document.querySelectorAll('.pet-actions .btn')]
        .filter((b) => re.test(b.textContent)).slice(0, 1).forEach((b) => b.click());
      for (let i = 0; i < 3; i++) { click(/Feed/i); click(/Pet/i); }
      const col = [...document.querySelectorAll('button.btn.primary')].find((b) => /Collect Foraged/i.test(b.textContent));
      if (col) col.click();
      // Exercise the Sell path (price calc + roster removal). The card's Sell
      // button goes through window.confirm, which Playwright auto-dismisses, so
      // drive the API directly to cover the actual liquidation.
      if (window.Pets && window.Pets.roster().length) {
        const id = window.Pets.roster()[0].id;
        window.Pets.sellPrice(window.Pets.roster()[0]);
        window.Pets.sell(id);
      }
    });
    await page.waitForTimeout(200);
    // Play Tap: start, then tap the bar a dozen times.
    await page.evaluate(() => { window.location.hash = '#/pets/feed'; });
    await page.waitForTimeout(200);
    await page.evaluate(() => {
      const s = [...document.querySelectorAll('button.btn.primary')].find((b) => /Start Feeding/i.test(b.textContent));
      if (s) s.click();
    });
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(400);
    // Tag (Reflex/Focus): start, then react with SPACE across the rounds. The
    // random arm delay + per-round gap mean we tap steadily for a few seconds so
    // the arm/go/foul/auto-miss + finish (recordRun/applyVector) paths all run.
    await page.evaluate(() => { window.location.hash = '#/pets/play'; });
    await page.waitForTimeout(200);
    await page.evaluate(() => {
      const s = [...document.querySelectorAll('button.btn.primary')].find((b) => /Start Tag/i.test(b.textContent));
      if (s) s.click();
    });
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(400);
    // Fetch (Precision/Control): start, then click the drifting ball's current
    // centre repeatedly so hits register and the run finishes.
    await page.evaluate(() => { window.location.hash = '#/pets/groom'; });
    await page.waitForTimeout(200);
    await page.evaluate(() => {
      const s = [...document.querySelectorAll('button.btn.primary')].find((b) => /Start Fetch/i.test(b.textContent));
      if (s) s.click();
    });
    for (let i = 0; i < 24; i++) {
      await page.evaluate(() => {
        const spot = document.querySelector('.groom-spot');
        const stage = document.querySelector('.groom-stage');
        if (spot && stage && spot.style.display !== 'none') {
          const r = stage.getBoundingClientRect();
          const x = r.left + parseFloat(spot.style.left || 0);
          const y = r.top + parseFloat(spot.style.top || 0);
          stage.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true }));
        }
      });
      await page.waitForTimeout(160);
    }
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
