// Ad-hoc driver for the Jack-In Blackjack cabinet. Routes to it, plays a batch
// of automated hands (bet → deal → stand/hit), then cashes out — asserting no
// console/page errors fire and the result panel renders a grade.
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch, loadPage } from './browser.mjs';

const outDir = fileURLToPath(new URL('./output/', import.meta.url));
mkdirSync(outDir, { recursive: true });

const browser = await launch();
const { page, errors } = await loadPage(browser, 'PlayTools.html', { enter: true, hash: '#/arcade/jackin' });

// the cabinet mounts in 'betting' state with a DEAL button
const hasDeal = await page.evaluate(() => !![...document.querySelectorAll('.ji-actions .btn')].find(b => /DEAL/.test(b.textContent)));
console.log('mounted with DEAL button:', hasDeal);

// play ~40 hands: click DEAL, then Stand (or Hit if low), looping
const clickByText = (re) => page.evaluate((src) => {
  const rx = new RegExp(src);
  const b = [...document.querySelectorAll('.ji-actions .btn, .ji-bank .ji-chip')].find(x => rx.test(x.textContent) && x.offsetParent !== null && !x.disabled);
  if (b) { b.click(); return true; }
  return false;
}, re.source);

// poll for a UI predicate up to `ms`
const waitFor = async (fn, ms = 3000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) { if (await page.evaluate(fn)) return true; await page.waitForTimeout(50); }
  return false;
};
const standVisible = () => [...document.querySelectorAll('.ji-actions .btn')].some(b => /Stand/.test(b.textContent) && b.offsetParent !== null);
const dealVisible = () => [...document.querySelectorAll('.ji-actions .btn')].some(b => /DEAL/.test(b.textContent) && b.offsetParent !== null);
const gameOver = () => !!document.querySelector('.result-tile');

for (let i = 0; i < 40; i++) {
  if (await page.evaluate(gameOver)) break;
  const dealt = await clickByText(/DEAL/);
  if (!dealt) break;
  // player turn: hit under 17, else stand — until the action buttons disappear
  for (let h = 0; h < 10; h++) {
    if (!(await page.evaluate(standVisible))) break;
    const total = await page.evaluate(() => parseInt(document.querySelectorAll('.ji-side')[1].querySelector('.tot').textContent, 10) || 0);
    await clickByText(total < 17 ? /Hit/ : /Stand/);
    await page.waitForTimeout(60);
  }
  // wait for the hand to settle: betting again (DEAL back) or session over
  await waitFor(() => (!document.querySelector('.ji-actions .btn') ? false :
    [...document.querySelectorAll('.ji-actions .btn')].some(b => /DEAL/.test(b.textContent) && b.offsetParent !== null)) || !!document.querySelector('.result-tile'));
}

// cash out if still solvent
await clickByText(/Cash Out/);
await page.waitForTimeout(200);

const summary = await page.evaluate(() => {
  const grade = document.querySelector('.result-tile .grade-badge');
  const peak = [...document.querySelectorAll('.result-tile')].find(t => /Peak/.test(t.textContent));
  const best = window.Store ? null : null;
  return {
    gradeShown: grade ? grade.textContent.trim() : null,
    peakShown: peak ? peak.querySelector('.v').textContent : null,
    hasShare: !!document.querySelector('.result-tile') && !![...document.querySelectorAll('button')].find(b => /Share Result/.test(b.textContent)),
  };
});

await page.screenshot({ path: outDir + 'jackin.png' });
console.log('result summary:', JSON.stringify(summary));
console.log('console/page errors:', errors.length ? errors : 'none');

await browser.close();
const ok = hasDeal && errors.length === 0 && summary.gradeShown && summary.hasShare;
console.log(ok ? '\nPASS' : '\nFAIL');
process.exit(ok ? 0 : 1);
