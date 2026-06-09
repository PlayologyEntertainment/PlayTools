// Headless-browser harness for the PlayTools single-file HTML app.
//
// Auto-detects which Chromium is available:
//   1. Stock Playwright browser — used if its binary is installed. That
//      requires the network policy to allow the Playwright CDN
//      (cdn.playwright.dev), then `npx playwright install chromium`.
//   2. Fallback: @sparticuz/chromium — a Chromium build that ships through
//      the npm registry, so it installs entirely in-policy with no settings
//      change. Driven through Playwright's own API.
//
// Used as a module (launch / loadPage) by test/smoke.mjs, or directly as a
// CLI for ad-hoc checks:
//   node test/browser.mjs <file-or-url> [--out shot.png] [--enter] [--hash #/dna]

import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { chromium as pwChromium } from 'playwright';

// Launch a headless Chromium, preferring the stock Playwright browser and
// falling back to the npm-hosted build when no stock binary is installed.
export async function launch() {
  try {
    return await pwChromium.launch({ headless: true });
  } catch {
    const sparticuz = (await import('@sparticuz/chromium')).default;
    return await pwChromium.launch({
      headless: true,
      executablePath: await sparticuz.executablePath(),
      args: sparticuz.args,
    });
  }
}

// Turn a CLI argument into a navigable URL. Bare paths resolve against the
// current working directory (the repo root when run via npm scripts).
function toUrl(target) {
  if (/^[a-z]+:\/\//i.test(target)) return target;
  return pathToFileURL(resolve(process.cwd(), target)).href;
}

// Open a page, optionally click through the intro splash and set a hash
// route, and collect console + uncaught page errors along the way.
export async function loadPage(browser, target, opts = {}) {
  const page = await browser.newPage();
  const errors = [];
  const warnings = [];
  // Blocked/failed external resources (fonts, CDNs) surface as console errors
  // but reflect the sandbox network policy, not app logic — track them as
  // warnings so they don't produce false test failures.
  const isNetwork = (t) => /Failed to load resource|net::|ERR_/.test(t);
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    (isNetwork(m.text()) ? warnings : errors).push(m.text());
  });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  await page.goto(toUrl(target), { waitUntil: 'load' });

  if (opts.enter) {
    const play = await page.$('#splashPlay');
    if (play) {
      await play.click();
      // Intro choreography: the play click starts a ~9s cinematic; only once
      // it completes does a gesture dismiss the splash (adding .hide, then
      // removing #splash). Earlier gestures are no-ops on first play. So poll:
      // nudge the splash with a pointerdown and check whether it's gone.
      const entered = () =>
        page.evaluate(() => {
          const s = document.querySelector('#splash');
          return !s || s.classList.contains('hide');
        });
      const deadline = Date.now() + 20000;
      while (Date.now() < deadline && !(await entered())) {
        const splash = await page.$('#splash');
        if (splash) await splash.dispatchEvent('pointerdown');
        await page.waitForTimeout(1000);
      }
    }
  }
  if (opts.hash) {
    await page.evaluate((h) => {
      window.location.hash = h;
    }, opts.hash);
    await page.waitForTimeout(500);
  }
  return { page, errors, warnings };
}

// CLI entry point.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const target = args.find((a) => !a.startsWith('--'));
  if (!target) {
    console.error('usage: node test/browser.mjs <file-or-url> [--out shot.png] [--enter] [--hash #/dna]');
    process.exit(2);
  }
  const getFlag = (name) => {
    const i = args.indexOf(name);
    return i !== -1 ? args[i + 1] : undefined;
  };

  const browser = await launch();
  const { page, errors, warnings } = await loadPage(browser, target, {
    enter: args.includes('--enter'),
    hash: getFlag('--hash'),
  });
  console.log('title:', await page.title());
  const out = getFlag('--out');
  if (out) {
    await page.screenshot({ path: out });
    console.log('screenshot:', out);
  }
  if (warnings.length) console.log('network warnings:', warnings);
  console.log('console/page errors:', errors.length ? errors : 'none');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
}
