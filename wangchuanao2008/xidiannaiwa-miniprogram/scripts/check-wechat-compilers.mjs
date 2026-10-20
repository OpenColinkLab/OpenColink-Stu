// Optional: use the compiler binaries bundled with YOUR installed WeChat DevTools.
import { readdir, mkdtemp } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
const root = resolve(import.meta.dirname, '../miniprogram');
const compilerDir = process.env.WECHAT_COMPILER_DIR;
if (!compilerDir) throw new Error('Set WECHAT_COMPILER_DIR to the directory containing wcc and wcsc. See docs/TESTING.md.');
async function walk(directory) { const output = []; for (const entry of await readdir(directory, {withFileTypes:true})) { const path=resolve(directory,entry.name); if(entry.isDirectory())output.push(...await walk(path));else output.push(relative(root,path)); }return output; }
const files = await walk(root);
const output = await mkdtemp(resolve(tmpdir(), 'naiwa-compiler-'));
for (const [compiler, extension] of [['wcc','.wxml'],['wcsc','.wxss']]) {
  const result = spawnSync(resolve(compilerDir, process.platform === 'win32' ? compiler+'.exe' : compiler), ['-o',resolve(output,compiler+'.js'),...files.filter(file=>file.endsWith(extension))], { cwd:root, encoding:'utf8' });
  if(result.status!==0) throw new Error(result.stderr || result.stdout || `${compiler} did not run: ${result.error}`);
  console.log(`${compiler}: passed (${files.filter(file=>file.endsWith(extension)).length} files)`);
}
console.log('WXML/WXSS syntax passed. This does not replace simulator or device testing.');
