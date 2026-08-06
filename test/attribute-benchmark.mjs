// Verifies the Attribute Engine's Stage 1 logistic benchmark curve (DD §3.1.3):
// each anchored tool's floor/median/elite raw values should map to
// q≈0.1/0.5/0.95 via Attr.benchmarkQuality.
// Run with: node test/attribute-benchmark.mjs

import { launch, loadPage } from './browser.mjs';

const browser = await launch();
const { page, errors } = await loadPage(browser, 'PlayTools.html', { enter: true });

const anchors = {
  reaction:   { lowerBetter: true,  floor: 420, median: 270, elite: 160 },
  cps:        { lowerBetter: false, floor: 4.0, median: 6.5, elite: 11 },
  precision:  { lowerBetter: false, floor: 55,  median: 78,  elite: 97 },
  tracking:   { lowerBetter: false, floor: 50,  median: 75,  elite: 95 },
};

const r = await page.evaluate((anchors) => {
  const out = {};
  for (const [name, a] of Object.entries(anchors)) {
    out[name] = {
      floor:  window.Attr.benchmarkQuality(a.floor, a),
      median: window.Attr.benchmarkQuality(a.median, a),
      elite:  window.Attr.benchmarkQuality(a.elite, a),
    };
  }
  return out;
}, anchors);

await browser.close();

const checks = [];
for (const [name, q] of Object.entries(r)) {
  checks.push([`${name} median lands exactly at q=0.5`, Math.abs(q.median - 0.5) < 1e-9]);
  checks.push([`${name} floor lands near q≈0.1 (got ${q.floor.toFixed(3)})`, q.floor > 0.02 && q.floor < 0.2]);
  checks.push([`${name} elite lands near q≈0.95 (got ${q.elite.toFixed(3)})`, q.elite > 0.85 && q.elite < 0.99]);
  checks.push([`${name} floor < median < elite (monotonic)`, q.floor < q.median && q.median < q.elite]);
}
checks.push(['no console errors', errors.length === 0]);

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
