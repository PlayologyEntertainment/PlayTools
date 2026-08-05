// Smoke tests for the PlayTools HTML apps. Loads each page in headless
// Chromium, clicks through the intro where present, exercises a hash route,
// captures a screenshot, and fails if any console or page errors fire.
//
// Run with: npm run test:browser

import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch, loadPage } from './browser.mjs';

const outDir = fileURLToPath(new URL('./output/', import.meta.url));
mkdirSync(outDir, { recursive: true });

const cases = [
  { name: 'playtools-dna', file: 'PlayTools.html', enter: true, hash: '#/dna' },
  { name: 'playtools-crossload', file: 'PlayTools.html', enter: true, hash: '#/arcade/crossload', drive: 'crossload' },
  { name: 'playtools-rig', file: 'PlayTools.html', enter: true, hash: '#/rig', drive: 'rig' },
  { name: 'playtools-pets', file: 'PlayTools.html', enter: true, hash: '#/pets', drive: 'pets' },
  { name: 'playtools-account', file: 'PlayTools.html', enter: true, hash: '#/account', drive: 'account' },
  { name: 'playtools-friends', file: 'PlayTools.html', enter: true, drive: 'friends-cloud' },
  { name: 'sharecard-studio', file: 'sharecard-studio.html' },
];

const browser = await launch();
let failed = 0;

for (const c of cases) {
  const { page, errors, warnings } = await loadPage(browser, c.file, c);
  let driveOk = true;

  // For real-time cabinets, actually start the game and drive a few inputs so
  // the RAF loop, collision/death/respawn and dock paths get exercised — a
  // static route mount alone won't catch runtime errors inside the loop.
  if (c.drive === 'crossload') {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('button.btn.primary')]
        .find((x) => /START|Restart/i.test(x.textContent));
      if (b) b.click();
    });
    for (let i = 0; i < 24; i++) {
      await page.keyboard.press(i % 6 === 5 ? 'ArrowLeft' : 'ArrowUp');
      await page.waitForTimeout(110);
    }
    await page.waitForTimeout(400);
  }

  // The Rig: collect the daily payout (a fresh load grants +100 NetCoin),
  // buy the 80-cost entry part from the NetStore, then open the battlestation
  // Share Card — so the idle/daily/store/share paths all execute, not just the
  // route mount.
  if (c.drive === 'rig') {
    await page.evaluate(() => {
      const claim = [...document.querySelectorAll('button.btn.primary')]
        .find((b) => /Collect Daily/i.test(b.textContent));
      if (claim) claim.click();
    });
    await page.waitForTimeout(200);
    // Buy a hardware part + a cosmetic, then convert NetCoin to Jack-In credits.
    await page.evaluate(() => {
      if (window.Rig) {
        window.Rig.buy('gpu1');
        window.Rig.buy('desktoy');
        window.Rig.buyCredits('cr1');
      }
      window.location.hash = '#/rig/store';
    });
    await page.waitForTimeout(300);
    // Click through all three NetStore tabs.
    for (const re of [/Battlestation/i, /Credits/i, /Hardware/i]) {
      await page.evaluate((src) => {
        const b = [...document.querySelectorAll('.seg button')].find((x) => new RegExp(src).test(x.textContent));
        if (b) b.click();
      }, re.source);
      await page.waitForTimeout(150);
    }
    // Open Jack-In so the seeded-session path (purchased credits) executes.
    await page.evaluate(() => { window.location.hash = '#/arcade/jackin'; });
    await page.waitForTimeout(400);
    await page.evaluate(() => { window.location.hash = '#/rig'; });
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      const share = [...document.querySelectorAll('button.btn')]
        .find((b) => /Share Battlestation/i.test(b.textContent));
      if (share) share.click();
    });
    await page.waitForTimeout(400);
  }

  // RetroPets: grant NetCoin, open Loot Boxes (gacha + pity + dupe→Shard), run the
  // care actions on the stable, then play the training mini-games so the gacha,
  // care, idle and GamerDNA-skill paths all execute — not just the route mount.
  if (c.drive === 'pets') {
    await page.evaluate(() => {
      if (window.Rig) window.Rig.grant(20000);
      // Open enough boxes to trip the pity timer and likely a duplicate, plus a
      // few of the pricier Uncommon box so the multi-box catalog path executes.
      if (window.Pets) {
        for (let i = 0; i < 14; i++) window.Pets.openBox();
        for (let i = 0; i < 3; i++) window.Pets.openBox('uncommon');
      }
      window.location.hash = '#/pets';
    });
    await page.waitForTimeout(300);
    // Feed + pet the first Pet a few times via the card buttons.
    await page.evaluate(() => {
      const click = (re) => [...document.querySelectorAll('.pet-actions .btn')]
        .filter((b) => re.test(b.textContent)).slice(0, 1).forEach((b) => b.click());
      for (let i = 0; i < 3; i++) { click(/Feed/i); click(/Pet/i); }
      const col = [...document.querySelectorAll('button.btn.primary')].find((b) => /Collect Foraged/i.test(b.textContent));
      if (col) col.click();
      // Exercise the Sell path (price calc + roster removal). The card's Sell
      // button goes through window.confirm, which Playwright auto-dismisses, so
      // drive the API directly to cover the actual liquidation.
      if (window.Pets && window.Pets.roster().length) {
        const id = window.Pets.roster()[0].id;
        window.Pets.sellPrice(window.Pets.roster()[0]);
        window.Pets.sell(id);
      }
    });
    await page.waitForTimeout(200);
    // Play Tap: start, then tap the bar a dozen times.
    await page.evaluate(() => { window.location.hash = '#/pets/feed'; });
    await page.waitForTimeout(200);
    await page.evaluate(() => {
      const s = [...document.querySelectorAll('button.btn.primary')].find((b) => /Start Feeding/i.test(b.textContent));
      if (s) s.click();
    });
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(400);
    // Tag (Reflex/Focus): start, then react with SPACE across the rounds. The
    // random arm delay + per-round gap mean we tap steadily for a few seconds so
    // the arm/go/foul/auto-miss + finish (recordRun/applyVector) paths all run.
    await page.evaluate(() => { window.location.hash = '#/pets/play'; });
    await page.waitForTimeout(200);
    await page.evaluate(() => {
      const s = [...document.querySelectorAll('button.btn.primary')].find((b) => /Start Tag/i.test(b.textContent));
      if (s) s.click();
    });
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(400);
    // Fetch (Precision/Control): start, then click the drifting ball's current
    // centre repeatedly so hits register and the run finishes.
    await page.evaluate(() => { window.location.hash = '#/pets/groom'; });
    await page.waitForTimeout(200);
    await page.evaluate(() => {
      const s = [...document.querySelectorAll('button.btn.primary')].find((b) => /Start Fetch/i.test(b.textContent));
      if (s) s.click();
    });
    for (let i = 0; i < 24; i++) {
      await page.evaluate(() => {
        const spot = document.querySelector('.groom-spot');
        const stage = document.querySelector('.groom-stage');
        if (spot && stage && spot.style.display !== 'none') {
          const r = stage.getBoundingClientRect();
          const x = r.left + parseFloat(spot.style.left || 0);
          const y = r.top + parseFloat(spot.style.top || 0);
          stage.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true }));
        }
      });
      await page.waitForTimeout(160);
    }
    await page.waitForTimeout(400);
  }

  // Cloud Account (opt-in Discord OAuth2 + sync): Supabase is configured in
  // this build, so this asserts the feature surfaces correctly — rail entry
  // and header shortcut both present, route mounts, and (since
  // Auth.ensureClient() has been given a chance to resolve) no auth-client
  // errors — per DD/CloudSync_DD.md.
  if (c.drive === 'account') {
    const state = await page.evaluate(() => ({
      configured: window.Auth ? window.Auth.isConfigured() : null,
      railHasAccount: !!document.querySelector('#rail a[data-route="#/account"]'),
      headerBtnVisible: !document.getElementById('cloudAcctBtn')?.hidden,
    }));
    if (state.configured !== true || state.railHasAccount !== true || state.headerBtnVisible !== true) {
      driveOk = false;
      console.log(`   - assertion failed: expected {configured:true, railHasAccount:true, headerBtnVisible:true}, got ${JSON.stringify(state)}`);
    }
  }

  // Friends v2 (DD/CloudSync_DD.md §7): a real round trip needs two signed-in
  // Discord/Supabase accounts, which no CI environment has. Instead, fake out
  // only the Supabase transport (a tiny .from()/.rpc() emulator over an
  // in-memory store) and drive the real Cloud + Views.friends + friendCard
  // code as two identities sharing that store, flipping which id
  // Auth.user() returns between visits to #/friends — everything except the
  // network layer is the shipped code.
  if (c.drive === 'friends-cloud') {
    const setupOk = await page.evaluate(() => {
      const store = {
        profiles: [
          { id: 'userA', discord_username: 'alice', discord_avatar_url: null, gamer_tag: 'Alice' },
          { id: 'userB', discord_username: 'bob', discord_avatar_url: null, gamer_tag: 'Bob' },
        ],
        friend_links: [],
        dna_states: [],
        dna: {
          userA: { profile: { gamerTag: 'Alice', accent: '#16f2c8' },
            attributes: { reflex: 80, precision: 70, speed: 60, focus: 50, consistency: 40, control: 30, strategy: 20 },
            achievements: ['ach_first_tool', 'ach_reflex_90'], toolsCompleted: 5, runs: 10, rig: { rigScore: 1234 } },
          userB: { profile: { gamerTag: 'Bob', accent: '#ff5cc8' },
            attributes: { reflex: 55, precision: 65, speed: 75, focus: 45, consistency: 35, control: 25, strategy: 60 },
            achievements: ['ach_first_tool'], toolsCompleted: 3, runs: 4, rig: { rigScore: 500 } },
        },
      };
      window.__mockStore = store;
      window.__actor = { id: 'userA' };

      const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const condMatch = (cond, row) => {
        const m = /^([a-zA-Z_]+)\.eq\.(.*)$/.exec(cond);
        return m ? String(row[m[1]]) === String(m[2]) : false;
      };
      const orMatch = (expr, row) => {
        const clauses = []; let depth = 0, cur = '';
        for (const ch of expr) {
          if (ch === ',' && depth === 0) { clauses.push(cur); cur = ''; }
          else { if (ch === '(') depth++; if (ch === ')') depth--; cur += ch; }
        }
        if (cur) clauses.push(cur);
        return clauses.some((clause) => {
          const m = /^and\((.*)\)$/.exec(clause);
          return m ? m[1].split(',').every((p) => condMatch(p, row)) : condMatch(clause, row);
        });
      };
      // A minimal chainable emulator covering only the .from()/.rpc() call
      // shapes Cloud's friend functions actually use (select/eq/neq/ilike/
      // in/or/limit/insert/update/delete/upsert), thenable like real
      // supabase-js so `await client.from(...)...` resolves to {data,error}.
      function builder(table) {
        let filters = [], op = 'select', patch = null, insertRow = null, limitN = null, single = false;
        const b = {
          select() { return b; },
          eq(col, val) { filters.push((r) => String(r[col]) === String(val)); return b; },
          neq(col, val) { filters.push((r) => String(r[col]) !== String(val)); return b; },
          ilike(col, pat) {
            const re = new RegExp('^' + pat.split('%').map(esc).join('.*') + '$', 'i');
            filters.push((r) => re.test(r[col] || '')); return b;
          },
          in(col, vals) { filters.push((r) => vals.includes(r[col])); return b; },
          or(expr) { filters.push((r) => orMatch(expr, r)); return b; },
          limit(n) { limitN = n; return b; },
          maybeSingle() { single = true; return b; },
          insert(row) { op = 'insert'; insertRow = row; return b; },
          update(p) { op = 'update'; patch = p; return b; },
          delete() { op = 'delete'; return b; },
          upsert(row) { op = 'upsert'; insertRow = row; return b; },
          then(onF, onR) {
            let result;
            try {
              const rows = () => (store[table] || (store[table] = [])).filter((r) => filters.every((f) => f(r)));
              if (op === 'select') {
                let out = rows();
                if (limitN != null) out = out.slice(0, limitN);
                result = { data: single ? (out[0] || null) : out, error: null };
              } else if (op === 'insert') {
                // Mirrors the migration's column defaults (status/created_at)
                // since this fake has no real Postgres schema behind it.
                const defaults = table === 'friend_links' ? { status: 'pending', created_at: new Date().toISOString() } : {};
                const r = Object.assign({ id: table + '_' + (store[table].length + 1) }, defaults, insertRow);
                store[table].push(r);
                result = { data: [r], error: null };
              } else if (op === 'update') {
                rows().forEach((r) => Object.assign(r, patch));
                result = { data: rows(), error: null };
              } else if (op === 'delete') {
                const matched = rows();
                store[table] = store[table].filter((r) => !matched.includes(r));
                result = { data: matched, error: null };
              } else if (op === 'upsert') {
                const key = insertRow.user_id || insertRow.id;
                const idx = store[table].findIndex((r) => (r.user_id || r.id) === key);
                if (idx >= 0) Object.assign(store[table][idx], insertRow); else store[table].push(insertRow);
                result = { data: [insertRow], error: null };
              }
            } catch (e) { result = { data: null, error: e }; }
            return Promise.resolve(result).then(onF, onR);
          },
        };
        return b;
      }
      const fakeClient = {
        from(t) { if (!store[t]) store[t] = []; return builder(t); },
        rpc(fn, args) {
          return Promise.resolve().then(() => {
            if (fn !== 'get_friend_dna') return { data: null, error: new Error('unknown rpc ' + fn) };
            const me = window.__actor.id, friendId = args.friend_id;
            const isFriend = (store.friend_links || []).some((l) => l.status === 'accepted' &&
              ((l.requester_id === me && l.addressee_id === friendId) || (l.addressee_id === me && l.requester_id === friendId)));
            return { data: isFriend ? (store.dna[friendId] || null) : null, error: null };
          });
        },
      };

      window.Auth.isConfigured = () => true;
      window.Auth.isSignedIn = () => true;
      window.Auth.ensureClient = async () => fakeClient;
      window.Auth.user = () => ({ id: window.__actor.id, user_metadata: { full_name: window.__actor.id } });
      return true;
    });

    const asActor = (id) => page.evaluate((uid) => { window.__actor.id = uid; }, id);
    const goFriends = async () => {
      await page.evaluate(() => { window.location.hash = '#/'; });
      await page.waitForTimeout(50);
      await page.evaluate(() => { window.location.hash = '#/friends'; });
      await page.waitForTimeout(500);
    };
    const screenText = () => page.evaluate(() => document.querySelector('#screen').innerText);
    const railDotTitle = () => page.evaluate(() => {
      const link = document.querySelector('#rail a[data-route="#/friends"]');
      const dot = link && link.querySelector('.rail-dot');
      return dot ? dot.title : null;
    });
    const check = (label, cond) => {
      if (!cond) { driveOk = false; console.log('   - assertion failed: ' + label); }
    };

    check('mock Supabase transport installed', setupOk === true);

    // Alice searches for Bob by Discord username and sends a request.
    await asActor('userA');
    await goFriends();
    check('Discord Friends box renders for a signed-in player', (await screenText()).includes('Discord Friends'));
    await page.evaluate(() => {
      document.querySelector('.discord-add input[type="text"]').value = 'bob';
      document.querySelector('.discord-add .btn').click();
    });
    await page.waitForTimeout(300);
    check('search finds a player by Discord username', (await screenText()).includes('bob'));
    await page.evaluate(() => {
      [...document.querySelectorAll('.request-list .request-row')]
        .find((r) => r.textContent.includes('bob')).querySelector('button.btn.primary').click();
    });
    await page.waitForTimeout(300);
    let links = await page.evaluate(() => window.__mockStore.friend_links);
    check('sendFriendRequest creates a pending friend_links row', links.length === 1 && links[0].status === 'pending');

    // A second request to the same person is rejected client-side.
    await page.evaluate(() => {
      document.querySelector('.discord-add input[type="text"]').value = 'bob';
      document.querySelector('.discord-add .btn').click();
    });
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      [...document.querySelectorAll('.request-list .request-row')]
        .find((r) => r.textContent.includes('bob')).querySelector('button.btn.primary').click();
    });
    await page.waitForTimeout(300);
    links = await page.evaluate(() => window.__mockStore.friend_links);
    check('a duplicate request is rejected (still exactly one link)', links.length === 1);

    // Bob sees the incoming request and the rail's pending-request dot, then accepts.
    await asActor('userB');
    await goFriends();
    check('the addressee sees the incoming request', (await screenText()).includes('Incoming friend requests'));
    check('the rail shows a pending-request dot', (await railDotTitle()) === '1 incoming friend request');
    await page.evaluate(() => {
      [...document.querySelectorAll('.request-list .request-row')]
        .find((r) => r.textContent.includes('alice')).querySelector('button.btn.primary').click(); // Accept
    });
    await page.waitForTimeout(400);
    links = await page.evaluate(() => window.__mockStore.friend_links);
    check('accepting flips the link to accepted', !!links[0] && links[0].status === 'accepted');
    check('the accepted friend appears with a Discord badge',
      (await screenText()).includes('Alice') && (await screenText()).includes('DISCORD'));
    check('the rail dot clears once resolved', (await railDotTitle()) === null);

    // Alice sees the mutual friendship, then unfriends Bob.
    await asActor('userA');
    await goFriends();
    check('the friendship is mutual', (await screenText()).includes('Bob'));
    await page.evaluate(() => {
      const card = [...document.querySelectorAll('.friend-card')].find((el) => el.textContent.includes('Bob'));
      window.confirm = () => true; // auto-confirm the Unfriend dialog
      [...card.querySelectorAll('button')].find((b) => /Unfriend/.test(b.textContent)).click();
    });
    await page.waitForTimeout(400);
    links = await page.evaluate(() => window.__mockStore.friend_links);
    check('unfriending removes the friend_links row', links.length === 0);
    check('the roster is empty again', (await screenText()).includes('No friends on your roster yet'));
  }

  const title = await page.title();
  await page.screenshot({ path: outDir + c.name + '.png' });
  const ok = errors.length === 0 && title.length > 0 && driveOk;
  if (!ok) failed++;
  const warnNote = warnings.length ? `  warnings=${warnings.length}` : '';
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.file}  title="${title}"  errors=${errors.length}${warnNote}`);
  for (const e of errors.slice(0, 5)) console.log('   - error: ' + e);
  for (const w of warnings.slice(0, 3)) console.log('   - warn:  ' + w);
  // Note: don't close pages individually — the in-policy @sparticuz/chromium
  // launches with --single-process, where closing the last page tears down
  // the whole browser. Pages are released when the browser closes below.
}

await browser.close();
console.log(failed ? `\n${failed} case(s) failed` : '\nAll cases passed');
process.exit(failed ? 1 : 0);
