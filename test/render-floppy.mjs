import { launch } from './browser.mjs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const b = await launch();
const p = await b.newPage();
await p.setViewportSize({ width: 820, height: 560 });
await p.goto(pathToFileURL(resolve('test/floppy-preview.html')).href, { waitUntil: 'load' });
await p.waitForTimeout(300);
await p.screenshot({ path: 'test/floppy-preview.png' });
await b.close();
console.log('done');
