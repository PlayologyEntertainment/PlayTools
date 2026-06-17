// Verifies the Arcade A/S-grade NetCoin payout (once per cabinet per local day).
// A fresh page load starts with a clean grade cap (rig.gradeDay = null).
// Run with: node test/arcade-grade-coins.mjs

import { launch, loadPage } from './browser.mjs';

const browser = await launch();
const { page, errors } = await loadPage(browser, 'PlayTools.html', { enter: true, hash: '#/rig' });

const r = await page.evaluate(() => {
  const KEY = 'playtools.gamerdna.v1';
  const bal = () => { try { return JSON.parse(localStorage.getItem(KEY)).rig.netcoin; } catch (e) { return null; } };
  const out = {};

  out.start = bal();
  out.payA = window.Rig.payArcadeGrade('memory', 'A');     // A-grade Arcade clear
  out.afterA = bal();
  out.payAgain = window.Rig.payArcadeGrade('memory', 'A'); // same cabinet, same day → 0
  out.payS = window.Rig.payArcadeGrade('dodge', 'S');      // different cabinet, S grade
  out.payB = window.Rig.payArcadeGrade('snake', 'B');      // below A → 0
  out.payReaction = window.Rig.payArcadeGrade('reaction', 'S'); // non-Arcade applet → 0
  out.afterAll = bal();
  out.cfg = { A: window.Rig.cfg.GRADE_A, S: window.Rig.cfg.GRADE_S };
  return out;
});

await browser.close();

const checks = [
  ['A pays GRADE_A', r.payA === r.cfg.A],
  ['balance rose by A', r.afterA - r.start === r.cfg.A],
  ['same cabinet same day pays 0', r.payAgain === 0],
  ['S pays GRADE_S', r.payS === r.cfg.S],
  ['B grade pays 0', r.payB === 0],
  ['non-arcade reaction pays 0', r.payReaction === 0],
  ['net total = A + S', r.afterAll - r.start === r.cfg.A + r.cfg.S],
  ['no console errors', errors.length === 0],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
console.log(`\nGRADE_A=${r.cfg.A} GRADE_S=${r.cfg.S}  start=${r.start} end=${r.afterAll}`);
console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
