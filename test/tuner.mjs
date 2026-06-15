// Ad-hoc check for the Rig Economy Tuner's NetStore authoring + export.
// Loads DD/Rig_Economy_Tuner.html, verifies the catalog table renders with the
// new fields, that adding a part recomputes, and that Export produces a catalog
// entry + a manifest stub for items that name a 3D model.
import { launch, loadPage } from './browser.mjs';

const browser = await launch();
const { page, errors } = await loadPage(browser, 'DD/Rig_Economy_Tuner.html');

let failed = 0;
const check = (cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`); if (!cond) failed++; };

// Catalog mirrors the live store: 28 rows, each carrying the new fields.
const rowInfo = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#partsBody tr')];
  return {
    n: rows.length,
    fields: rows[0] && ['p-id','p-name','p-cat','p-cost','p-rate','p-cap','p-score','p-needs','p-model','p-desc']
      .every(c => rows[0].querySelector('.' + c)),
    hasGpu1: rows.some(r => r.querySelector('.p-id').value === 'gpu1'),
    monitorModel: (() => { const r = rows.find(r => r.querySelector('.p-id').value === 'monitor');
      return r && r.querySelector('.p-model').value; })(),
  };
});
check(rowInfo.n === 28, `catalog has 28 rows (got ${rowInfo.n})`);
check(rowInfo.fields, 'each row exposes id/name/cat/cost/rate/cap/score/needs/model/desc inputs');
check(rowInfo.hasGpu1, "synced to live catalog (gpu1 present)");
check(rowInfo.monitorModel === 'monitor', `monitor maps to its 3D model (got "${rowInfo.monitorModel}")`);

// Headline cards render (sim ran without throwing).
const cards = await page.evaluate(() => document.querySelectorAll('#cards .card').length);
check(cards > 0, `headline metrics rendered (${cards} cards)`);

// Add a new item, then export and confirm it appears in both outputs.
await page.evaluate(() => {
  document.getElementById('addRow').click();
  const last = [...document.querySelectorAll('#partsBody tr')].pop();
  last.querySelector('.p-id').value = 'neon_rug';
  last.querySelector('.p-name').value = "Neon Rug";
  last.querySelector('.p-cat').value = 'Cosmetic';
  last.querySelector('.p-cost').value = '250';
  last.querySelector('.p-model').value = 'neon_rug';
  last.querySelector('.p-desc').value = "A glowing floor rug for under the deck.";
  last.querySelector('.p-desc').dispatchEvent(new Event('input', { bubbles: true }));
  document.getElementById('exportBtn').click();
});
await page.waitForTimeout(100);

const out = await page.evaluate(() => ({
  open: document.getElementById('exportModal').classList.contains('open'),
  cos: document.getElementById('outCos').textContent,
  man: document.getElementById('outMan').textContent,
}));
check(out.open, 'export modal opens');
check(/id:'neon_rug'/.test(out.cos) && /cost:250/.test(out.cos) && /blurb:'A glowing floor rug/.test(out.cos),
  'new item appears as a COSMETICS catalog entry with price + blurb');
check(/"neon_rug":\s*\{/.test(out.man) && /models\/neon_rug\.glb/.test(out.man),
  'new item appears as a rig_manifest.json model stub');

const noErrors = errors.length === 0;
check(noErrors, 'no console/page errors');
for (const e of errors.slice(0, 5)) console.log('   - error: ' + e);

await browser.close();
console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
