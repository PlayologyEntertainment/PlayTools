// Ad-hoc driver for the Cold Stack (Klondike solitaire) cabinet. Routes to it,
// starts a deal, exercises the engine (deal/recycle the stock, select + send to
// roots, undo) and then banks the run — asserting the board renders, no console/
// page errors fire, and the result panel shows a grade + Share button.
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch, loadPage } from './browser.mjs';

const outDir = fileURLToPath(new URL('./output/', import.meta.url));
mkdirSync(outDir, { recursive: true });

const browser = await launch();
const { page, errors } = await loadPage(browser, 'PlayTools.html', { enter: true, hash: '#/arcade/coldstack' });

// cabinet mounts idle with a START button and the COLD STACK overlay
const mounted = await page.evaluate(() =>
  !![...document.querySelectorAll('.controls-row .btn')].find(b => /START/.test(b.textContent)) &&
  /COLD STACK/.test((document.querySelector('.pd-overlay') || {}).textContent || ''));
console.log('mounted idle with START:', mounted);

const clickBtn = (re) => page.evaluate((src) => {
  const rx = new RegExp(src);
  const b = [...document.querySelectorAll('.controls-row .btn')].find(x => rx.test(x.textContent) && x.offsetParent !== null && !x.disabled);
  if (b) { b.click(); return true; }
  return false;
}, re.source);

// START the deal
await clickBtn(/START/);
await page.waitForTimeout(150);

const layout = await page.evaluate(() => ({
  cols: document.querySelectorAll('.cs-col').length,
  slots: document.querySelectorAll('.cs-slot').length,
  cards: document.querySelectorAll('.cs-card').length,
  faceUp: document.querySelectorAll('.cs-card.up').length,
}));
console.log('board layout:', JSON.stringify(layout));

// Exercise the engine: repeatedly deal the stock, and after each deal try to
// send the waste top and every tableau column top onto each root slot (only the
// legal Ace/next-rank move sticks — the rest are harmless no-ops that flex the
// rules engine + invalid-move path).
const tryHomeAll = () => page.evaluate(() => {
  const slots = [...document.querySelectorAll('.cs-slot')];
  const pickTops = () => {
    const tops = [];
    const w = document.querySelector('.cs-waste .cs-card.up:last-child');
    if (w) tops.push(w);
    document.querySelectorAll('.cs-col').forEach(col => { const c = col.querySelector('.cs-card.up:last-child'); if (c) tops.push(c); });
    return tops;
  };
  for (const t of pickTops()) { t.click(); slots.forEach(s => s.click()); }
});

for (let i = 0; i < 30; i++) {
  await page.evaluate(() => { const s = document.querySelector('.cs-stock'); if (s) s.click(); });
  await tryHomeAll();
  await page.waitForTimeout(20);
}

// undo a few times — must not throw even if the stack is shallow
for (let i = 0; i < 3; i++) { await clickBtn(/Undo/); await page.waitForTimeout(20); }

const mid = await page.evaluate(() => {
  const pill = [...document.querySelectorAll('.mem-hud .pill')].find(p => /Recovered/.test(p.textContent));
  const score = [...document.querySelectorAll('.mem-hud .pill')].find(p => /Score/.test(p.textContent));
  return { recovered: pill ? pill.querySelector('b').textContent : null, score: score ? score.querySelector('b').textContent : null };
});
console.log('mid-run hud:', JSON.stringify(mid));

// bank the run → result panel
await clickBtn(/Give Up/);
await page.waitForTimeout(200);

const summary = await page.evaluate(() => {
  const grade = document.querySelector('.result-tile .grade-badge');
  const recovered = [...document.querySelectorAll('.result-tile')].find(t => /Recovered/.test(t.textContent));
  return {
    gradeShown: grade ? grade.textContent.trim() : null,
    recoveredShown: recovered ? recovered.querySelector('.v').textContent : null,
    hasShare: !![...document.querySelectorAll('button')].find(b => /Share Result/.test(b.textContent)),
  };
});

await page.screenshot({ path: outDir + 'coldstack.png' });
console.log('result summary:', JSON.stringify(summary));
console.log('console/page errors:', errors.length ? errors : 'none');

await browser.close();
const ok = mounted && layout.cols === 7 && layout.slots === 4 && layout.faceUp >= 7 &&
  errors.length === 0 && summary.gradeShown && summary.hasShare;
console.log(ok ? '\nPASS' : '\nFAIL');
process.exit(ok ? 0 : 1);
