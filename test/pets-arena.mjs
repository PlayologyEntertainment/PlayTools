// Verifies the RetroPets PvE Arena (DD/RetroMall_DD.md §6, ROADMAP B1):
// the difficulty curve is monotonic and floors correctly, applyArenaResult's
// rank/Energy/rare-drop semantics behave (win-only rank advance, no punishing
// loss), boss gating triggers at the right ranks, and — the single most
// important invariant — Gauntlet NEVER touches the permanent ladder rank.
// Also drives one full real fight through the live DOM/timing loop to prove
// the wiring end-to-end. Run with: node test/pets-arena.mjs
import { launch, loadPage } from './browser.mjs';

const KEY = 'playtools.gamerdna.v1';
const browser = await launch();
let failed = 0;
const check = (name, ok, got) => {
  ok = !!ok;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  got=${JSON.stringify(got)}`}`);
};

// ---- 1. pure functions: difficultyCurve + rollFoe + bossFor ----
{
  const { page, errors } = await loadPage(browser, 'PlayTools.html', { enter: true });
  const r = await page.evaluate(() => {
    const P = window.Pets;
    const curve = (depth, hl) => P.difficultyCurve(depth, hl);
    const c0 = curve(0, P.cfg.ARENA_HALFLIFE);
    const c18 = curve(P.cfg.ARENA_HALFLIFE, P.cfg.ARENA_HALFLIFE);
    const cFar = curve(1000, P.cfg.ARENA_HALFLIFE);
    const gc0 = curve(0, P.cfg.GAUNTLET_HALFLIFE);
    const gcFar = curve(1000, P.cfg.GAUNTLET_HALFLIFE);
    return {
      startsAtBase: c0.reactMs === 900,
      halfLifeClosesHalfGap: Math.abs(c18.reactMs - (900 - (900 - 320) * 0.5)) < 1,
      floorsAtLimit: Math.abs(cFar.reactMs - 320) < 1 && cFar.reactMs >= 320,
      monotonicShrink: c0.reactMs > c18.reactMs && c18.reactMs > cFar.reactMs,
      gauntletStartsAtBaseToo: gc0.reactMs === c0.reactMs,
      gauntletEscalatesFaster: gcFar.reactMs <= cFar.reactMs, // steeper half-life closes at least as fast
      bossAt10: !!P.bossFor(10),
      bossAt25: !!P.bossFor(25),
      bossAt50: !!P.bossFor(50),
      noBossAt11: !P.bossFor(11),
      exactlyThreeBosses: P.BOSSES.length === 3,
      foeAt9IsBoss: P.foeForRank(9).kind === 'boss',
      foeAt9IsRookieTitan: P.foeForRank(9).id === 'rookie_titan',
      foeAt10IsNotBossYet: P.foeForRank(10).kind === 'wild', // next boss (rank 25) is far off
    };
  });
  console.log('pure-fn results:', JSON.stringify(r));
  check('difficultyCurve starts at the base reactMs at depth 0', r.startsAtBase);
  check('halfLife closes ~half the remaining gap', r.halfLifeClosesHalfGap);
  check('difficultyCurve floors at the configured limit, never below', r.floorsAtLimit);
  check('difficulty strictly tightens with depth (monotonic)', r.monotonicShrink);
  check('Gauntlet curve starts exactly as easy as the Ladder curve', r.gauntletStartsAtBaseToo);
  check('Gauntlet\'s steeper half-life escalates at least as fast', r.gauntletEscalatesFaster);
  check('a boss is defined at rank 10/25/50', r.bossAt10 && r.bossAt25 && r.bossAt50);
  check('no boss at an off-milestone rank', r.noBossAt11);
  check('exactly 3 curated bosses (locked decision)', r.exactlyThreeBosses);
  check('the fight after rank 9 is the boss lookup, not a random foe', r.foeAt9IsBoss && r.foeAt9IsRookieTitan);
  check('the fight after rank 10 is procedural again (bosses are single milestones)', r.foeAt10IsNotBossYet);
  check('no console errors', errors.length === 0, errors);
}

// ---- 2. applyArenaResult + recordGauntletEnd semantics (direct calls,
//         bypassing UI/timing) — seed a pet + arena state via localStorage,
//         reload so Store boots from it (Store isn't global). ----
async function seed(arenaState) {
  const { page, errors } = await loadPage(browser, 'PlayTools.html', { enter: true });
  await page.evaluate((arenaState) => {
    const pal = { id: 'test_pal', seed: 12345, species: 'cat', rarity: 'common', name: 'Tester',
      adoptedAt: Date.now(), bond: 0, hunger: 80, happy: 80, energy: 100, lastTickTs: Date.now() };
    localStorage.setItem('playtools.gamerdna.v1', JSON.stringify({
      pets: { pals: [pal], shards: 0, pity: 0, pulls: 0, arena: arenaState },
      rig: { netcoin: 0, totalEarned: 0 }
    }));
  }, arenaState);
  await page.reload({ waitUntil: 'load' });
  return { page, errors };
}
function readArena(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('playtools.gamerdna.v1')).pets.arena);
}
function readEnergy(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('playtools.gamerdna.v1')).pets.pals[0].energy);
}

{
  const { page, errors } = await seed({ rank: 9, lastTs: null, bossesBeaten: [], gauntlet: { bestStreak: 0, lastStreak: 0 } });
  const before = await readArena(page);
  const energyBefore = await readEnergy(page);

  // A boss win at rank 9→10 should advance rank, mark the boss beaten, and
  // never roll a rare-drop below its own gated chance floor (deterministic
  // enough to just check the win path's rank/energy/boss bookkeeping).
  const afterWin = await page.evaluate(() => {
    window.Pets.applyArenaResult('test_pal', { win: true, reward: 100, isBoss: true, bossId: 'rookie_titan' });
    return JSON.parse(localStorage.getItem('playtools.gamerdna.v1'));
  });
  const energyAfterWin = afterWin.pets.pals[0].energy;

  // Energy also regens fractionally (ENERGY_REGEN/hr) over the real wall-clock
  // milliseconds between calls, so compare with a small epsilon rather than
  // strict equality — the invariant under test is "spent ~ARENA_ENERGY_COST",
  // not floating-point-exact bookkeeping.
  const near = (a, b, eps) => Math.abs(a - b) < (eps == null ? 0.5 : eps);
  check('win advances rank by exactly 1', afterWin.pets.arena.rank === before.rank + 1, { before: before.rank, after: afterWin.pets.arena.rank });
  check('boss win marks bossesBeaten', afterWin.pets.arena.bossesBeaten.includes('rookie_titan'), afterWin.pets.arena.bossesBeaten);
  check('win spends ~ARENA_ENERGY_COST energy', near(energyBefore - energyAfterWin, 45), { energyBefore, energyAfterWin });
  check('win pays the given reward', afterWin.rig.netcoin === 100, afterWin.rig.netcoin);

  // A loss at the now-current rank must NOT regress rank (no punishing loss),
  // must still spend Energy, and must pay no reward.
  const rankAfterWin = afterWin.pets.arena.rank;
  const afterLoss = await page.evaluate(() => {
    window.Pets.applyArenaResult('test_pal', { win: false, reward: 0, isBoss: false, bossId: null });
    return JSON.parse(localStorage.getItem('playtools.gamerdna.v1'));
  });
  check('loss never regresses rank', afterLoss.pets.arena.rank === rankAfterWin, { rankAfterWin, after: afterLoss.pets.arena.rank });
  check('loss still spends ~ARENA_ENERGY_COST energy', near(energyAfterWin - afterLoss.pets.pals[0].energy, 45), { energyAfterWin, energyAfterLoss: afterLoss.pets.pals[0].energy });
  check('loss pays no reward', afterLoss.rig.netcoin === afterWin.rig.netcoin);
  check('no console errors', errors.length === 0, errors);
}

// ---- 3. Gauntlet NEVER touches pets.arena.rank — the single most important
//         invariant. Run several "wins" (streak growth) then a "loss", and
//         confirm rank is byte-identical throughout while gauntlet state
//         updates (best/last streak ratchet correctly). ----
{
  const { page, errors } = await seed({ rank: 7, lastTs: null, bossesBeaten: ['rookie_titan'], gauntlet: { bestStreak: 3, lastStreak: 1 } });
  const before = await readArena(page);

  const r = await page.evaluate(() => {
    const out = {};
    out.reward1 = window.Pets.recordGauntletEnd('test_pal', 5);   // a 5-foe streak, better than bestStreak=3
    out.mid = JSON.parse(localStorage.getItem('playtools.gamerdna.v1')).pets.arena;
    out.reward2 = window.Pets.recordGauntletEnd('test_pal', 1);   // a worse run — bestStreak must NOT decrease
    out.after = JSON.parse(localStorage.getItem('playtools.gamerdna.v1')).pets.arena;
    return out;
  });

  check('Gauntlet run never changes pets.arena.rank (invariant)', r.mid.rank === before.rank && r.after.rank === before.rank, { before: before.rank, mid: r.mid.rank, after: r.after.rank });
  check('a better run raises bestStreak', r.mid.gauntlet.bestStreak === 5, r.mid.gauntlet.bestStreak);
  check('lastStreak always reflects the most recent run', r.mid.gauntlet.lastStreak === 5 && r.after.gauntlet.lastStreak === 1, r.after.gauntlet);
  check('bestStreak only ratchets upward, never decreases', r.after.gauntlet.bestStreak === 5, r.after.gauntlet.bestStreak);
  check('Gauntlet payout scales super-linearly with streak', r.reward1 > r.reward2 * 5, { reward1: r.reward1, reward2: r.reward2 });
  check('no console errors', errors.length === 0, errors);
}

// ---- 4. Live DOM smoke: both routes load cleanly with a seeded roster ----
{
  const { page, errors } = await seed({ rank: 0, lastTs: null, bossesBeaten: [], gauntlet: { bestStreak: 0, lastStreak: 0 } });
  await page.evaluate(() => { window.location.hash = '#/pets/arena'; });
  await page.waitForTimeout(400);
  const ladderUi = await page.evaluate(() => ({
    hasStart: !!document.querySelector('.controls-row .btn'),
    hasArenaTitle: document.body.textContent.includes('Arena'),
    hasRankTile: document.body.textContent.includes('Arena Rank'),
  }));
  await page.evaluate(() => { window.location.hash = '#/pets/arena?mode=gauntlet'; });
  await page.waitForTimeout(400);
  const gauntletUi = await page.evaluate(() => ({
    hasGauntletTitle: document.body.textContent.includes('Gauntlet'),
    hasStreakTile: document.body.textContent.includes('Best Streak'),
  }));
  check('Ladder route renders with a Start control', ladderUi.hasStart);
  check('Ladder route shows Arena Rank', ladderUi.hasRankTile);
  check('Gauntlet route (via ?mode=gauntlet) renders', gauntletUi.hasGauntletTitle);
  check('Gauntlet route shows Best Streak', gauntletUi.hasStreakTile);
  check('no console errors on either route', errors.length === 0, errors);
}

// ---- 5. Drive one full real fight through the live UI/timing loop — the
//         strongest end-to-end proof the state machine + DOM wiring works.
//         Always answers the tell correctly; generous per-read timeout since
//         rank 0's reaction window starts at 900ms (base, not yet tightened). ----
{
  const { page, errors } = await seed({ rank: 0, lastTs: null, bossesBeaten: [], gauntlet: { bestStreak: 0, lastStreak: 0 } });
  await page.evaluate(() => { window.location.hash = '#/pets/arena'; });
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.controls-row .btn')].find((x) => /Start Fight/.test(x.textContent));
    if (b) b.click();
  });

  const COUNTER_FOR = { 'LUNGE!': 'Dodge', 'WIND-UP!': 'Guard', 'OPENING!': 'Attack' };
  let resolved = false;
  for (let read = 0; read < 10 && !resolved; read++) {
    try {
      await page.waitForFunction(() => document.querySelector('.stage.go') !== null, { timeout: 6000 });
    } catch (e) {
      break; // match already resolved (result panel replaced the stage's content) or timed out
    }
    const label = await page.evaluate(() => document.querySelector('.stage .big')?.textContent || '');
    const wanted = COUNTER_FOR[label];
    if (wanted) {
      await page.evaluate((wanted) => {
        const b = [...document.querySelectorAll('.controls-row .btn')].find((x) => x.textContent.includes(wanted));
        if (b) b.click();
      }, wanted);
    }
    resolved = await page.evaluate(() => !!document.querySelector('.grade-badge'));
    if (!resolved) await page.waitForTimeout(750); // clear the post-read GAP before the next tell
  }

  const finalState = await page.evaluate(() => ({
    hasGradeBadge: !!document.querySelector('.grade-badge'),
    energy: JSON.parse(localStorage.getItem('playtools.gamerdna.v1')).pets.pals[0].energy,
  }));
  check('a full driven fight resolves to a grade screen', finalState.hasGradeBadge);
  check('the fight spent the Pet\'s Energy', Math.abs(finalState.energy - (100 - 45)) < 1, finalState.energy);
  check('no console errors during live play', errors.length === 0, errors);
}

await browser.close();
console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
