// Verifies the Daily Challenge cabinet (DD/DailyChallenge_DD.md, ROADMAP §4 C1):
// the day-key -> (cabinet, seed) picks are pure/stable, the once-per-day
// record() gate + streak semantics behave like the Rig's own daily gate, and
// two independent page loads of the same seeded cabinet produce byte-identical
// board state (the core "same seed ⇒ same board" contract).
// Run with: node test/daily-challenge.mjs
import { launch, loadPage } from './browser.mjs';

const browser = await launch();

// ---- 1. pure functions + streak/gate semantics ----
{
  const { page, errors } = await loadPage(browser, 'PlayTools.html', { enter: true, hash: '#/daily' });

  const r = await page.evaluate(() => {
    const KEY = 'playtools.gamerdna.v1';
    const dc = () => { try { return JSON.parse(localStorage.getItem(KEY)).dailyChallenge; } catch (e) { return null; } };
    const out = {};

    const today = window.DailyChallenge.today();
    out.cabStable = window.DailyChallenge.cabinetFor(today) === window.DailyChallenge.cabinetFor(today);
    out.seedStable = window.DailyChallenge.seedFor(today) === window.DailyChallenge.seedFor(today);
    out.poolHasCab = window.DailyChallenge.POOL.includes(window.DailyChallenge.cabinetFor(today));

    out.availBefore = window.DailyChallenge.available();
    out.rec1 = window.DailyChallenge.record('S', 1234);
    out.availAfter = window.DailyChallenge.available();
    out.rec2 = window.DailyChallenge.record('A', 999); // same day again -> blocked
    out.streakAfterFirst = dc().streak;
    out.historyLen = dc().history.length;

    return out;
  });

  console.log('day-key results:', JSON.stringify(r));
  console.log('errors:', errors.length ? errors : 'none');

  const checks = [
    ['cabinetFor is pure for a fixed day', r.cabStable],
    ['seedFor is pure for a fixed day', r.seedStable],
    ["today's cabinet is in the 14-cabinet pool", r.poolHasCab],
    ['available() true before first play today', r.availBefore],
    ['record() pays GRADE_COIN.S (100) on first S-grade clear', r.rec1.paid === 100],
    ['streak is 1 on a fresh save', r.streakAfterFirst === 1],
    ['available() false after playing today', r.availAfter === false],
    ['second record() same day pays 0 (locked)', r.rec2.paid === 0],
    ['history has exactly one entry', r.historyLen === 1],
    ['no console errors', errors.length === 0],
  ];
  let failed = 0;
  for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failed++; }
  if (failed) { await browser.close(); console.log(`\n${failed} check(s) failed`); process.exit(1); }
}

// ---- 2. same-seed determinism: Cold Stack's initial deal must be identical
//         across two independent page loads on the same calendar day. ----
// Note: don't close pages individually — the in-policy @sparticuz/chromium
// launches with --single-process, where closing the last page tears down the
// whole browser (see test/smoke.mjs). Pages are released when the shared
// browser closes at the end of this file.
async function dealFaceUp() {
  const { page, errors } = await loadPage(browser, 'PlayTools.html', { enter: true, hash: '#/arcade/coldstack?daily=1' });
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.controls-row .btn')].find(x => /START/.test(x.textContent));
    if (b) b.click();
  });
  await page.waitForTimeout(200);
  const faceUp = await page.evaluate(() =>
    [...document.querySelectorAll('.cs-card.up')].map(c => c.textContent.trim()));
  return { faceUp, errors };
}

const run1 = await dealFaceUp();
const run2 = await dealFaceUp();
console.log('deal 1:', JSON.stringify(run1.faceUp));
console.log('deal 2:', JSON.stringify(run2.faceUp));

const deckChecks = [
  ['deal produced 7 face-up cards', run1.faceUp.length === 7 && run2.faceUp.length === 7],
  ['same seed ⇒ identical initial deal', JSON.stringify(run1.faceUp) === JSON.stringify(run2.faceUp)],
  ['no console errors (deal 1)', run1.errors.length === 0],
  ['no console errors (deal 2)', run2.errors.length === 0],
];
let failed2 = 0;
for (const [name, ok] of deckChecks) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failed2++; }

await browser.close();
console.log(failed2 ? `\n${failed2} check(s) failed` : '\nAll checks passed');
process.exit(failed2 ? 1 : 0);
