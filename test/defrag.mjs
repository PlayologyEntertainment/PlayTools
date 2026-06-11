// Ad-hoc driver for the Defrag match-3 cabinet. Routes to it, starts a Zen run,
// drives a batch of synthetic adjacent swaps on the canvas (exercising the
// match / cascade / forge / reshuffle paths), then banks the run — asserting no
// console/page errors fire and the result panel renders a grade + share row.
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch, loadPage } from './browser.mjs';

const outDir = fileURLToPath(new URL('./output/', import.meta.url));
mkdirSync(outDir, { recursive: true });

const browser = await launch();
const { page, errors } = await loadPage(browser, 'PlayTools.html', { enter: true, hash: '#/arcade/defrag' });

// cabinet mounts with a START button + a canvas
const mounted = await page.evaluate(() =>
  !!document.querySelector('.pd-canvas') &&
  !![...document.querySelectorAll('.controls-row .btn')].find(b => /START/.test(b.textContent)));
console.log('mounted with canvas + START:', mounted);

// pick Zen mode (gives a Bank Run button to end the session quickly)
await page.evaluate(() => {
  const z = [...document.querySelectorAll('.seg button')].find(b => /Zen/.test(b.textContent));
  if (z) z.click();
});
// START
await page.evaluate(() => {
  const s = [...document.querySelectorAll('.controls-row .btn')].find(b => /START/.test(b.textContent));
  if (s) s.click();
});
await page.waitForTimeout(200);

// fire a synthetic adjacent swap by pointer events at two cell centres
async function swap(r, c, dir) {
  await page.evaluate(({ r, c, dir }) => {
    const W = 384, PAD = 6, GAP = 3, COLS = 8, CELL = (W - PAD * 2 - GAP * (COLS - 1)) / COLS;
    const cv = document.querySelector('.pd-canvas');
    const rect = cv.getBoundingClientRect(), scale = rect.width / W;
    const ctr = (col, row) => ({
      x: rect.left + (PAD + col * (CELL + GAP) + CELL / 2) * scale,
      y: rect.top + (PAD + row * (CELL + GAP) + CELL / 2) * scale,
    });
    const a = ctr(c, r);
    const b = ctr(c + (dir === 'h' ? 1 : 0), r + (dir === 'v' ? 1 : 0));
    const ev = (type, p) => cv.dispatchEvent(new PointerEvent(type, { clientX: p.x, clientY: p.y, bubbles: true, pointerId: 1 }));
    ev('pointerdown', a); ev('pointerup', b);
  }, { r, c, dir });
  await page.waitForTimeout(220);
}

// ~24 random adjacent swaps across the board
for (let i = 0; i < 24; i++) {
  const r = Math.floor(Math.random() * 8), c = Math.floor(Math.random() * 7);
  await swap(r, c, Math.random() < 0.5 ? 'h' : 'v');
}

// bank the Zen run -> results
await page.evaluate(() => {
  const b = [...document.querySelectorAll('.controls-row .btn')].find(x => /Bank Run/.test(x.textContent) && x.offsetParent !== null);
  if (b) b.click();
});
await page.waitForTimeout(300);

const summary = await page.evaluate(() => {
  const grade = document.querySelector('.result-tile .grade-badge');
  const score = [...document.querySelectorAll('.result-tile')].find(t => /Score/.test(t.textContent));
  return {
    gradeShown: grade ? grade.textContent.trim() : null,
    scoreShown: score ? score.querySelector('.v').textContent : null,
    hasShare: !![...document.querySelectorAll('button')].find(b => /Share Result/.test(b.textContent)),
  };
});

await page.screenshot({ path: outDir + 'defrag.png' });
console.log('result summary:', JSON.stringify(summary));
console.log('console/page errors:', errors.length ? errors : 'none');

await browser.close();
const ok = mounted && errors.length === 0 && summary.gradeShown && summary.hasShare;
console.log(ok ? '\nPASS' : '\nFAIL');
process.exit(ok ? 0 : 1);
