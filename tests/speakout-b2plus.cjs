const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '../speakout-b2plus-active-teach');
const context = {window: {}};
for (const name of ['index', 'notes']) vm.runInNewContext(fs.readFileSync(path.join(root, `data/${name}.js`), 'utf8'), context);
const D = context.window.SPEAKOUT;
assert.equal(D.lessons.length, 32);
assert.equal(D.pages.sb, 139); assert.equal(D.pages.wb, 94);
assert.equal(D.media.video.length, 16);
assert.equal(D.media.classAudio.length, 105); assert.equal(D.media.wbAudio.length, 75);
const referenced = new Set();
function verify(value) {
  if (Array.isArray(value)) value.forEach(verify);
  else if (value && typeof value === 'object') for (const [key, v] of Object.entries(value)) {
    if (key === 'path' || Object.values(D.media.docs).includes(v)) {
      assert(fs.existsSync(path.join(root, 'content', v)), v); referenced.add(v);
    }
    verify(v);
  }
}
verify(D);
for (const book of ['sb', 'wb']) for (let n = 1; n <= D.pages[book]; n++) assert(fs.existsSync(path.join(root, `pages/${book}/${String(n).padStart(3, '0')}.jpg`)));
for (const l of D.lessons) {
  assert.equal(l.sbIdx + D.pages.sbOffset, l.sb);
  assert.equal(l.wbIdx + D.pages.wbOffset, l.wb);
  assert(l.sbIdx >= 0 && l.sbIdx < D.pages.sb && l.wbIdx >= 0 && l.wbIdx < D.pages.wb);
}
const source = JSON.parse(fs.readFileSync(path.join(root, 'audit/source-files.json')));
for (const f of source.files.filter(f => f.path.startsWith('pages/'))) {
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f.path))).digest('hex'), f.sha256, f.path);
}
console.log(`PASS 233 unchanged book scans, 32 lessons, 180 book audio tracks, 16 videos and ${referenced.size} linked resources.`);

if (process.argv.includes('--browser')) (async () => {
  const {chromium} = require(process.env.PLAYWRIGHT_PATH || '/Users/mak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
  const browser = await chromium.launch({channel: 'chrome', headless: true});
  const base = process.env.SPEAKOUT_BASE || 'http://127.0.0.1:8772';
  const url = base + '/speakout-b2plus-active-teach/index.html';
  const errors = [], failed = [];
  try {
    const page = await browser.newPage({viewport: {width: 1440, height: 960}});
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.url().startsWith(url.slice(0, -10)) && r.status() >= 400) failed.push([r.status(), r.url()]); });
    const ready = () => page.waitForFunction(() => document.querySelector('#pageImg')?.complete && document.querySelector('#pageImg').naturalWidth > 0);
    await page.goto(url + '?unit=1'); await ready();
    assert.equal(await page.locator('#pageImg').getAttribute('src'), 'pages/sb/007.jpg');
    assert.match(await page.locator('#crumb').innerText(), /1A.*стр\. 8/);
    await page.locator('#bNext').click(); await ready();
    assert(new URL(page.url()).searchParams.get('page') === '9');
    await page.goto(url + '?book=sb&page=11'); await ready();
    assert.match(await page.locator('#crumb').innerText(), /1B.*стр\. 11/);
    await page.locator('#bWB').click(); await ready();
    assert.equal(await page.locator('#pageImg').getAttribute('src'), 'pages/wb/004.jpg');
    assert.match(await page.locator('#crumb').innerText(), /стр\. 6/);
    await page.locator('[data-tab="ans"]').click();
    assert.match(await page.locator('#pbody').innerText(), /Ответы Workbook/i);
    assert.equal(await page.locator('#pbody [data-reveal]').count(), 0, 'Do not show SB keys for WB');
    await page.goto(url + '?book=sb&page=8'); await ready();
    await page.locator('[data-tab="ans"]').click();
    await page.locator('[data-reveal]').first().click();
    assert(!(await page.locator('[data-reveal]').first().getAttribute('class')).includes('blur'));
    await page.locator('[data-tab="audio"]').click();
    await page.locator('.trk').first().click();
    await page.waitForFunction(() => AU.readyState >= 1 && AU.duration > 0);
    await page.locator('#pRate').click();
    assert.equal(await page.evaluate(() => AU.playbackRate), 1.15);
    await page.evaluate(() => AU.pause());
    await page.locator('[data-tab="files"]').click();
    assert.equal(await page.locator('#pbody [data-video]').count(), 16);
    assert(await page.locator('#pbody').getByRole('link', {name: 'Workbook: аудиоскрипты'}).count());
    await page.locator('[data-video]').first().click();
    await page.locator('#vEl').evaluate(v => v.load());
    await page.waitForFunction(() => document.querySelector('#vEl').readyState >= 1 && document.querySelector('#vEl').duration > 0);
    await page.keyboard.press('Escape'); assert(!(await page.locator('#mdVideo').evaluate(d => d.open)));
    // Real drawing and legacy backup compatibility.
    await page.goto(url + '?book=sb&page=8'); await ready();
    await page.locator('[data-tool="pen"]').click();
    const rect = await page.locator('#pageImg').boundingBox();
    await page.mouse.move(rect.x + rect.width * .3, rect.y + rect.height * .4);
    await page.mouse.down(); await page.mouse.move(rect.x + rect.width * .5, rect.y + rect.height * .45, {steps: 8}); await page.mouse.up();
    assert(await page.evaluate(() => INK['sb:7']?.length > 0));
    await page.reload(); await ready();
    assert(await page.evaluate(() => INK['sb:7']?.length > 0));
    await page.evaluate(() => validateBackup({ink: INK, spots: {}, names: 'Asya'}));
    assert(await page.evaluate(() => { try { validateBackup({spots:{'sb:7':[{}]}}); return false; } catch { return true; } }));
    await page.locator('#bTimer').click();
    assert(await page.locator('#mdTimer').evaluate(d => d.open));
    await page.keyboard.press('Tab'); assert(await page.evaluate(() => !!document.activeElement.closest('#mdTimer')));
    await page.keyboard.press('Escape');
    await page.locator('#bRail').focus(); await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'courseHome', 'Tab must move focus');
    await page.screenshot({path: '/private/tmp/speakout-b2plus-desktop.png'});
    for (let unit = 1; unit <= 8; unit++) for (const book of ['sb', 'wb']) {
      await page.goto(url + `?unit=${unit}&book=${book}`); await ready();
      assert.match(await page.locator('#crumb').innerText(), new RegExp(unit + 'A'));
    }
    await page.goto(base + '/speakout-b2plus-u8-workbook.html'); await ready();
    assert.match(await page.locator('#crumb').innerText(), /8A.*стр\. 52/);
    await page.goto(base + '/speakout-book.html?course=speakout-b2plus&u=3'); await ready();
    assert.match(await page.locator('#crumb').innerText(), /3A/);
    await page.goto(url + '?book=sb&page=NaN'); await ready();
    assert.equal(await page.locator('#pgInput').inputValue(), '1');
    for (const width of [390, 768]) {
      await page.setViewportSize({width, height: 844});
      await page.goto(url + '?unit=1'); await ready();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert(await page.locator('#pageImg').isVisible());
      assert(!(await page.locator('#rail').isVisible()));
      await page.locator('#bRail').click(); assert(await page.locator('#rail').isVisible());
      await page.locator('[data-code="1B"]').click(); assert(!(await page.locator('#rail').isVisible()));
      await page.locator('#bPanel').click(); assert(await page.locator('#panel').isVisible());
      await page.locator('[data-tab="audio"]').click(); assert(await page.locator('.trk').first().isVisible());
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.locator('#bPanel').click();
      if (width === 390) await page.screenshot({path: '/private/tmp/speakout-b2plus-mobile.png'});
    }
    assert.deepEqual(errors, []); assert.deepEqual(failed, []);
    console.log('PASS desktop/mobile navigation, all units, media metadata, keys, drawings, backup validation, dialog focus and course redirects.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
