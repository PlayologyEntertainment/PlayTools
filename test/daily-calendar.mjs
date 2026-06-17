// Verifies the re-aligned 30-day-cycle daily bonuses and the Daily Payout
// calendar state. Loads PlayTools.html, then seeds rig streak/lastClaimDay via
// localStorage + reload (Store isn't global) and reads back Rig's live state.
// Run with: node test/daily-calendar.mjs
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { launch } from './browser.mjs';

const url = pathToFileURL(resolve(process.cwd(), 'PlayTools.html')).href;
const browser = await launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::|ERR_/.test(m.text())) errors.push(m.text()); });
await page.goto(url, { waitUntil: 'load' });

let failed = 0;
const check = (name, cond, got) => {
  const ok = !!cond;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  got=${JSON.stringify(got)}`}`);
};

// Seed streak + lastClaimDay into the persisted save, reload so Store boots from
// it, then read back the re-aligned preview and the calendar state.
const probe = async (streak, lastClaim) => {
  await page.evaluate(({ streak, lastClaim }) => {
    const k = 'playtools.gamerdna.v1';
    const d = JSON.parse(localStorage.getItem(k));
    const key = (off) => { const t = new Date(Date.now() - off * 86400000); return t.getFullYear() + '-' + (t.getMonth() + 1) + '-' + t.getDate(); };
    d.rig.streak = streak;
    d.rig.lastClaimDay = lastClaim === 'today' ? key(0) : lastClaim === 'yesterday' ? key(1) : null;
    localStorage.setItem(k, JSON.stringify(d));
  }, { streak, lastClaim });
  await page.reload({ waitUntil: 'load' });
  return page.evaluate((streak) => {
    const Rig = window.Rig;
    const prev = Rig.dailyPreview();
    const cal = Rig.dailyCalendar();
    return {
      cycleDay: Rig.cycleDayOf(streak),
      preview: { streak: prev.streak, cycleDay: prev.cycleDay, weekly: prev.weekly, monthly: prev.monthly },
      cal: { collected: cal.collected, todayCell: cal.todayCell, kinds: cal.cells.map((c) => c.kind) },
    };
  }, streak);
};

// --- Bonus re-alignment (preview is for the *next* claim) ---
let r = await probe(6, 'yesterday');   // next claim = day 7 -> weekly
check('day 7 weekly bonus fires', r.preview.weekly === 750 && r.preview.monthly === 0, r.preview);

r = await probe(27, 'yesterday');      // next = day 28 -> weekly
check('day 28 weekly bonus fires', r.preview.weekly === 750 && r.preview.cycleDay === 28, r.preview);

r = await probe(29, 'yesterday');      // next = day 30 -> monthly, no weekly
check('day 30 monthly bonus fires', r.preview.monthly === 5000 && r.preview.weekly === 0, r.preview);

r = await probe(34, 'yesterday');      // next = abs 35 == cycle day 5 -> NO bonus (drift fixed)
check('abs day 35 (cycle 5) pays no bonus', r.preview.weekly === 0 && r.preview.monthly === 0 && r.preview.cycleDay === 5, r.preview);

r = await probe(36, 'yesterday');      // next = abs 37 == cycle day 7 -> weekly
check('cycle 2 day 7 (abs 37) weekly fires', r.preview.weekly === 750 && r.preview.cycleDay === 7, r.preview);

// --- Calendar state ---
r = await probe(10, 'today');          // claimed today at 10 -> 10 green, today = 10
check('collected = 10 when claimed today at streak 10', r.cal.collected === 10 && r.cal.todayCell === 10, r.cal);
check('cells 1..10 are green (collected)', r.cal.kinds.slice(0, 10).every((k) => k === 'collected'), r.cal.kinds);
check('day 7 (collected) is green not purple', r.cal.kinds[6] === 'collected', r.cal.kinds);
check('day 14 (upcoming weekly) is purple', r.cal.kinds[13] === 'weekly', r.cal.kinds);
check('day 30 (upcoming monthly) is orange', r.cal.kinds[29] === 'monthly', r.cal.kinds);

r = await probe(30, 'today');          // completed a cycle -> all 30 green
check('full cycle: 30 collected', r.cal.collected === 30 && r.cal.kinds.every((k) => k === 'collected'), r.cal);

r = await probe(31, 'today');          // cycle reset -> 1 green, today = 1
check('cycle resets after 30: collected = 1 at streak 31', r.cal.collected === 1 && r.cal.todayCell === 1, r.cal);
check('after reset day 30 is orange again', r.cal.kinds[29] === 'monthly', r.cal.kinds);

r = await probe(12, null);             // broken streak -> fresh cycle, today = 1
check('broken streak: 0 collected, today = 1', r.cal.collected === 0 && r.cal.todayCell === 1, r.cal);

check('no console errors', errors.length === 0, errors);

await browser.close();
console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
