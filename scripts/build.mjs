import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
let html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(src, 'styles.css'), 'utf8');
html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + css + '\n</style>');

const scripts = [];
html = html.replace(/<script src="([^"]+)"><\/script>/g, function (_, rel) {
  scripts.push(rel);
  return '';
});
let bundle = '';
scripts.forEach(function (rel) {
  bundle += '\n/* ===== ' + rel + ' ===== */\n';
  bundle += fs.readFileSync(path.join(src, rel), 'utf8');
  bundle += '\n';
});
bundle = bundle.replace(/<\/script/gi, '<\\/script');
const note = '<!-- 牧橒成长工作台预览。用浏览器直接打开本文件即可，无需联网。源码在 src/，重新构建：node scripts/build.mjs 。乐园这一期是平面形象，没有内嵌 GLB。 -->\n';
html = html.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n' + note);
html = html.replace('</body>', '<script>\ntry {\n' + bundle + '\n} catch (err) {\n  if (window.showBootError) window.showBootError(err);\n}\n</script>\n</body>');

const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });
const out = path.join(dist, 'index.html');
fs.writeFileSync(out, '\uFEFF' + html);
const notePath = path.join(dist, '打开说明.txt');
fs.writeFileSync(notePath, [
  '牧橒成长工作台预览',
  '',
  '1. 把压缩包解压到一个文件夹。',
  '2. 双击里面的 index.html。Edge、Chrome 都可以。',
  '3. 如果 Edge 是空白：在 index.html 上点右键 → 属性 → 勾选「解除锁定」→ 确定，再双击。',
  '4. 页面最上面有一行浅色字。能看见那一行，就说明文件已经被浏览器打开了。',
  ''
].join('\r\n'), 'utf8');
const zipPath = path.join(dist, 'muyun-preview.zip');
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
execFileSync('zip', ['-j', zipPath, out, notePath], { cwd: dist });
const kb = (fs.statSync(out).size / 1024).toFixed(1);
const zipKb = (fs.statSync(zipPath).size / 1024).toFixed(1);
console.log('wrote ' + path.relative(root, out) + ' (' + kb + ' KB, ' + scripts.length + ' scripts)');
console.log('wrote ' + path.relative(root, zipPath) + ' (' + zipKb + ' KB)');
