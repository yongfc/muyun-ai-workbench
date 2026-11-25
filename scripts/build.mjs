import fs from 'fs';
import path from 'path';
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
html = html.replace('</body>', '<script>\n' + bundle + '\n</script>\n</body>');

const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });
const out = path.join(dist, 'index.html');
fs.writeFileSync(out, html);
const kb = (fs.statSync(out).size / 1024).toFixed(1);
console.log('wrote ' + path.relative(root, out) + ' (' + kb + ' KB, ' + scripts.length + ' scripts)');
