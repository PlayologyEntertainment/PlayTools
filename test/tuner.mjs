// Ad-hoc check for the Rig Economy Tuner's NetStore authoring + export.
// Loads DD/Rig_Economy_Tuner.html, verifies the catalog table renders with the
// new fields, that adding a part recomputes, and that Export produces a catalog
// entry + a manifest stub for items that name a 3D model.
import { launch, loadPage } from './browser.mjs';

const browser = await launch();
const { page, errors } = await loadPage(browser, 'DD/Rig_Economy_Tuner.html');

let failed = 0;
const check = (cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`); if (!cond) failed++; };

// Catalog mirrors the live store: 29 rows, each carrying the new fields.
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
check(rowInfo.n === 29, `catalog has 29 rows (got ${rowInfo.n})`);
check(rowInfo.fields, 'each row exposes id/name/cat/cost/rate/cap/score/needs/model/desc inputs');
check(rowInfo.hasGpu1, "synced to live catalog (gpu1 present)");
check(rowInfo.monitorModel === 'monitor', `monitor maps to its 3D model (got "${rowInfo.monitorModel}")`);

// Headline cards render (sim ran without throwing).
const cards = await page.evaluate(() => document.querySelectorAll('#cards .card').length);
check(cards > 0, `headline metrics rendered (${cards} cards)`);

// The Part + Description fields auto-fit: no input clips its text (scrollWidth
// never exceeds clientWidth), and the longer Description column is wider.
const fit = await page.evaluate(() => {
  const clips = (sel) => [...document.querySelectorAll('#partsBody ' + sel)]
    .filter(i => i.scrollWidth > i.clientWidth + 1).length;
  const w = (sel) => parseFloat(document.querySelector('#partsBody ' + sel).style.width);
  return { nameClips: clips('.p-name'), descClips: clips('.p-desc'),
           nameW: w('.p-name'), descW: w('.p-desc') };
});
check(fit.nameClips === 0, `no Part field clips its text (${fit.nameClips} clipped)`);
check(fit.descClips === 0, `no Description field clips its text (${fit.descClips} clipped)`);
check(fit.descW > fit.nameW, `Description column wider than Part (${fit.descW}px > ${fit.nameW}px)`);

// Auto-fit is live: typing a long value grows its field so it still fits.
const grew = await page.evaluate(() => {
  const row = document.querySelector('#partsBody tr');
  const inp = row.querySelector('.p-desc');
  const before = parseFloat(inp.style.width);
  inp.value = 'X'.repeat(200);
  inp.dispatchEvent(new Event('input', { bubbles: true }));
  return { grew: parseFloat(inp.style.width) > before, fits: inp.scrollWidth <= inp.clientWidth + 1 };
});
check(grew.grew && grew.fits, 'Description field grows to fit a long live edit');

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
