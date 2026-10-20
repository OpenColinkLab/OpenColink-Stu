import assert from 'node:assert/strict';
import { readFile, readdir, stat, access } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { isIP } from 'node:net';
const root = resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const appRoot = resolve(root, 'miniprogram');
async function filesUnder(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) output.push(...await filesUnder(path)); else output.push(path);
  }
  return output;
}
const files = await filesUnder(appRoot);
const app = JSON.parse(await readFile(resolve(appRoot, 'app.json'), 'utf8'));
const project = JSON.parse(await readFile(resolve(root, 'project.config.json'), 'utf8'));
assert.equal(project.miniprogramRoot, 'miniprogram/');
for (const page of app.pages) for (const ext of ['js', 'json', 'wxml', 'wxss']) await access(resolve(appRoot, page + '.' + ext));
for (const file of files) {
  const source = ['js', 'json', 'wxml', 'wxss'].some(ext => file.endsWith('.' + ext)) ? await readFile(file, 'utf8') : '';
  if (file.endsWith('.json')) {
    const config = JSON.parse(source);
    for (const component of Object.values(config.usingComponents || {})) {
      const componentPath = component.startsWith('/') ? resolve(appRoot, '.' + component) : resolve(dirname(file), component);
      for (const extension of ['js', 'json', 'wxml', 'wxss']) await access(componentPath + '.' + extension);
    }
  }
  if (file.endsWith('.js')) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert(!/\b(?:document|window)\.|\bfetch\s*\(|wx\.cloud\b/.test(source), 'Browser/cloud dependency: ' + relative(root, file));
  }
  for (const match of source.matchAll(/(?:src|imageUrl):?\s*[=:]\s*['"](\/assets\/[^'"]+)['"]/g)) await access(resolve(appRoot, '.' + match[1]));
}
const canonical = JSON.parse(await readFile(resolve(root, 'content/catalog.json'), 'utf8'));
const generated = require(resolve(appRoot, 'data/catalog.js'));
assert.deepEqual(generated, canonical, 'Run npm run catalog:sync');
assert.equal(new Set(canonical.works.map(work => work.id)).size, canonical.works.length, 'Duplicate artwork IDs');
for (const gallery of canonical.galleries) {
  const works = canonical.works.filter(work => work.gallery === gallery.id);
  assert.equal(gallery.count, works.length, 'Incorrect gallery count');
  assert.deepEqual(gallery.eras.map(era => era.id), canonical.era_order[gallery.id]);
  for (const era of gallery.eras) assert.equal(era.count, works.filter(work => work.era === era.id).length, 'Incorrect era count');
}
for (const work of canonical.works) {
  assert(canonical.galleries.some(item => item.id === work.gallery), 'Unknown gallery');
  assert(canonical.era_order[work.gallery].includes(work.era), 'Unknown era');
  assert.equal(work.era_name, canonical.era_labels[work.era]);
  for (const path of [work.image, work.thumbnail]) {
    assert(/^museum\/(artworks|thumbnails)\/[a-zA-Z0-9._-]+$/.test(path), 'Invalid image path');
    await access(resolve(root, 'assets', path));
  }
}
const bytes = (await Promise.all(files.map(async file => (await stat(file)).size))).reduce((a, b) => a + b, 0);
// 工程预算，不代表微信上传工具的最终压缩包大小。
assert(bytes < 1.5 * 1024 * 1024, 'Source package exceeds 1.5 MiB engineering budget; move assets out of miniprogram/');
console.log(`Checked ${app.pages.length} pages, ${canonical.works.length} works, ${Object.keys(canonical.era_labels).length} eras. Mini program source: ${(bytes / 1024).toFixed(1)} KiB.`);
if (process.argv.includes('--release')) {
  const { baseUrl, allowIpHttps } = require(resolve(appRoot, 'config/assets.js'));
  const url = new URL(baseUrl);
  assert.equal(url.protocol, 'https:', 'Release requires an HTTPS asset URL');
  assert(!url.username && !url.password && !url.search && !url.hash && !url.port, 'Use an HTTPS base URL without credentials, port, query or fragment');
  assert(!/^(localhost|127\.|0\.|\[)/i.test(url.hostname), 'Use a public HTTPS host');
  if (isIP(url.hostname)) assert(allowIpHttps === true, 'Explicitly acknowledge the IP HTTPS image endpoint; WeChat network APIs still require domains');
  assert(!/(^|\.)(example\.(com|org|net)|invalid|test|localhost)$/.test(url.hostname), 'Replace example domain');
  assert(/^wx[a-zA-Z0-9]{16}$/.test(project.appid), 'Set your own real AppID in project.config.json');
  console.log('Release configuration passes local checks. Still verify domains, HTTPS access and devices in WeChat.');
}
