// Verification for the per-game Touch Pad feature.
// Loads PlayTools.html, visits each touch-pad game, and checks:
//   - a "Touch Pad" switch exists in the controls row, pad hidden by default
//   - toggling the switch reveals/hides the pad (placed just below the CRT)
//   - the choice persists to prefs
//   - (Ecto) a pad pointer drag is forwarded to the game (it starts the round)
import { launch, loadPage } from './browser.mjs';

const games = [
  { name: 'StarDodger', hash: '#/arcade/dodge',     pref: 'dodgePad' },
  { name: 'Overdrive',  hash: '#/arcade/overdrive', pref: 'overdrivePad' },
  { name: 'Mac Pan',    hash: '#/arcade/macpan',    pref: 'macpanPad' },
  { name: 'Brick',      hash: '#/arcade/bricks',    pref: 'brickPad' },
  { name: 'Ecto',       hash: '#/arcade/ecto',      pref: 'ectoPad' },
];

const browser = await launch();
const { page, errors } = await loadPage(browser, 'PlayTools.html', { enter: true });
let failed = 0;
const check = (cond, msg) => { if (!cond) { failed++; console.log('  FAIL: ' + msg); } else console.log('  ok: ' + msg); };

for (const g of games) {
  console.log(`\n== ${g.name} ==`);
  await page.evaluate((h) => { location.hash = h; }, g.hash);
  await page.waitForTimeout(400);

  const sw = await page.locator('button', { hasText: 'Touch Pad' }).first();
  check(await sw.count() > 0, 'switch present');
  check(/touch pad off/i.test(await sw.innerText()), 'switch starts Off');

  const wrap = page.locator('.touchpad-wrap');
  check(!(await wrap.isVisible()), 'pad hidden by default');

  // pad sits just below the CRT housing (immediately after the .crt-wrap)
  const order = await page.evaluate(() => {
    const w = document.querySelector('.touchpad-wrap');
    return w && w.previousElementSibling && w.previousElementSibling.classList.contains('crt-wrap');
  });
  check(order, 'pad is the sibling right after the CRT housing');

  await sw.click();
  await page.waitForTimeout(120);
  check(await wrap.isVisible(), 'pad visible after enabling');
  check(/touch pad on/i.test(await sw.innerText()), 'switch reads On');
  check(await page.evaluate((p) => !!JSON.parse(localStorage.getItem('playtools.prefs.v1')||'{}')[p], g.pref),
        'pref persisted');

  if (g.name === 'Ecto') {
    // tapping the pad while idle should forward onDown -> startGame()
    await page.locator('.touchpad').scrollIntoViewIfNeeded();
    const box = await page.locator('.touchpad').boundingBox();
    await page.mouse.move(box.x + box.width*0.5, box.y + box.height*0.5);
    await page.mouse.down();
    await page.waitForTimeout(60);
    await page.mouse.up();
    await page.waitForTimeout(200);
    const overlayHidden = await page.evaluate(() => {
      const ov = document.querySelector('.pd-overlay');
      return ov && getComputedStyle(ov).display === 'none';
    });
    check(overlayHidden, 'pad tap reached the game and started the round');
  }

  // turn back off so we leave a clean state for the next route
  await sw.click();
  await page.waitForTimeout(80);
  check(!(await wrap.isVisible()), 'pad hidden after disabling');
}

console.log(`\nconsole errors: ${errors.length}`);
errors.slice(0,5).forEach(e => console.log('  - ' + e));
await browser.close();
console.log(failed ? `\n${failed} check(s) failed` : '\nAll touch-pad checks passed');
process.exit(failed || errors.length ? 1 : 0);
