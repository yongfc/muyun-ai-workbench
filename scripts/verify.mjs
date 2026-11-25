import fs from 'fs';
import http from 'http';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fail = [];
function check(name, cond, extra) {
  if (!cond) fail.push(name + (extra ? ' ' + extra : ''));
  else console.log('ok', name);
}

function extractLegacy() {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  function between(a, b) {
    const s = html.indexOf(a);
    const e = html.indexOf(b, s + a.length);
    if (s < 0 || e < 0) throw new Error('missing ' + a);
    return html.slice(s, e);
  }
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext([
    between('const TASK_GROUPS=[', 'const ALL_TASKS='),
    between('const POEMS=[', 'const GENRES='),
    between('const GENRES=', '/* 337'),
    between('const WEEK_NEW_PLAN=', '/* 艾宾浩斯'),
    between('const EBBINGHAUS_STEPS=', 'const SEEDS='),
    between('const SEEDS=', 'const PET_TYPES='),
    between('const PET_TYPES=', 'const RARITY='),
    between('const RARITY=', 'const CORE_ATTRS='),
    between('const CORE_ATTRS=', 'const BIRTHDAY=')
  ].join('\n') + `
    this.out = {TASK_GROUPS, POEMS, GENRES, WEEK_NEW_PLAN, EBBINGHAUS_STEPS, SEEDS, PET_TYPES, RARITY, CORE_ATTRS};
  `, ctx);
  return ctx.out;
}

function loadModule(rel) {
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, rel), 'utf8'), sandbox);
  return sandbox.window.MY;
}

const legacy = extractLegacy();
const poems = loadModule('src/data/poems.js');
const tasks = loadModule('src/data/tasks.js');
const pets = loadModule('src/data/pets.js');
const life = loadModule('src/data/life.js');

check('25 poems', poems.POEMS.length === 25 && legacy.POEMS.length === 25);
check('poem text', JSON.stringify(poems.POEMS) === JSON.stringify(legacy.POEMS));
check('genres', JSON.stringify(poems.GENRES) === JSON.stringify(legacy.GENRES));
check('plan', JSON.stringify(poems.WEEK_NEW_PLAN) === JSON.stringify(legacy.WEEK_NEW_PLAN));
check('ebbinghaus', JSON.stringify(poems.EBBINGHAUS_STEPS) === JSON.stringify(legacy.EBBINGHAUS_STEPS));
check('13 tasks', JSON.stringify(tasks.TASK_GROUPS) === JSON.stringify(legacy.TASK_GROUPS));
check('attrs', JSON.stringify(tasks.CORE_ATTRS) === JSON.stringify(legacy.CORE_ATTRS));
check('seeds', JSON.stringify(pets.SEEDS) === JSON.stringify(legacy.SEEDS));
check('pets', JSON.stringify(pets.PET_TYPES) === JSON.stringify(legacy.PET_TYPES));
check('declaration', life.DECLARATION.indexOf('我是陈牧橒，人生设计师。') === 0);
check('rules copy', life.YL.baji[1] === '身体是设计师的本钱，拳头硬，腰杆才能硬');
check('出塞用字', poems.POEMS[5].hint.indexOf('為') >= 0);

const dist = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
const distSize = fs.statSync(path.join(root, 'dist/index.html')).size;
check('dist size', distSize < 400 * 1024, String(distSize));
check('no cdn', !/https?:\/\//.test(dist.replace(/http:\/\/www\.w3\.org\/2000\/svg/g, '')));
check('no glb payload', dist.indexOf('PET_GLB') < 0 && dist.indexOf('Z2xURg') < 0);
check('keeps keys', dist.indexOf('muyang_v6') >= 0 && dist.indexOf('gushi337_v2') >= 0 && dist.indexOf('gushi337_v1') >= 0);
check('root index untouched in dist only', dist.indexOf('牧橒成长工作台') >= 0);

const legacyHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
check('production file still huge', legacyHtml.length > 1000000);

function serve(dir) {
  return new Promise(function (resolve) {
    const server = http.createServer(function (req, res) {
      const url = decodeURIComponent(req.url.split('?')[0]);
      const file = path.join(dir, url === '/' ? 'index.html' : url);
      if (!file.startsWith(dir)) { res.writeHead(403); res.end(); return; }
      fs.readFile(file, function (err, buf) {
        if (err) { res.writeHead(404); res.end('no'); return; }
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        res.end(buf);
      });
    });
    server.listen(0, '127.0.0.1', function () { resolve(server); });
  });
}

async function tap(page, selector) {
  const found = await page.evaluate(function (selector) {
    var el = document.querySelector(selector);
    if (!el) return false;
    if (!el.closest('.tabbar')) el.scrollIntoView({ block: 'center', inline: 'nearest' });
    return true;
  }, selector);
  if (!found) throw new Error('missing ' + selector);
  await page.click(selector);
}

async function fits(page, name) {
  const box = await page.evaluate(function () {
    const b = getComputedStyle(document.body);
    const h = getComputedStyle(document.documentElement);
    return {
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
      sh: document.documentElement.scrollHeight,
      ch: document.documentElement.clientHeight,
      bodyO: b.overflow + '/' + b.overflowY,
      htmlO: h.overflow + '/' + h.overflowY
    };
  });
  const locked = /hidden/.test(box.bodyO) || /hidden/.test(box.htmlO);
  if (locked || box.sw > box.cw + 1) fail.push(name + ' layout ' + JSON.stringify(box));
  else console.log('ok fit', name, box.cw + 'x' + box.ch, 'scrollH', box.sh);
  return box;
}

async function reciteToday(page) {
  for (let n = 0; n < 24; n++) {
    const state = await page.evaluate(function () {
      return {
        done: document.body.innerText.indexOf('今日打卡完成') >= 0,
        title: (document.querySelector('h2.rec-title') || {}).textContent || '',
        hasFlip: !!document.querySelector('[data-act=flip]'),
        hasRate: !!document.querySelector('[data-act=rate][data-r=ok]')
      };
    });
    if (state.done) return;
    if (state.hasFlip) {
      await tap(page, '[data-act=flip]');
      const match = await page.evaluate(function (title) {
        const poem = window.MY.POEMS.filter(function (p) { return p.title === title; })[0];
        const lines = Array.prototype.map.call(document.querySelectorAll('.poem-lines p'), function (p) { return p.textContent; });
        return {
          ok: !!(poem && lines.join('\n') === poem.lines.join('\n')),
          lines: lines.slice(0, 2),
          expect: poem ? poem.lines.slice(0, 2) : null
        };
      }, state.title);
      if (!match.ok) fail.push('诗句不一致 ' + state.title + ' ' + JSON.stringify(match));
      else console.log('ok lines', state.title);
      await tap(page, '[data-act=rate][data-r=ok]');
      await page.waitForFunction(function (prev) {
        const fin = document.body.innerText.indexOf('今日打卡完成') >= 0;
        const h = document.querySelector('h2.rec-title');
        return fin || (h && h.textContent !== prev);
      }, { timeout: 4000 }, state.title);
    } else if (!state.hasRate) {
      await new Promise(function (r) { setTimeout(r, 200); });
    }
  }
  fail.push('晨读卡组没有走完');
}

async function main() {
  if (fail.length) {
    console.error(fail.join('\n'));
    process.exit(1);
  }
  const server = await serve(path.join(root, 'dist'));
  const port = server.address().port;
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  const external = [];
  page.on('request', function (req) {
    const u = req.url();
    if (!u.startsWith('http://127.0.0.1:' + port) && !u.startsWith('data:')) external.push(u);
  });
  page.on('pageerror', function (err) { console.log('PAGE', err.message); });
  page.on('console', function (msg) { if (msg.type() === 'error') console.log('CONSOLE', msg.text()); });
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto('http://127.0.0.1:' + port + '/', { waitUntil: 'networkidle0' });

  const shot = path.join('/tmp', 'muyun-shots');
  fs.mkdirSync(shot, { recursive: true });
  await page.screenshot({ path: path.join(shot, 'today.png') });

  const home = await page.evaluate(function () {
    const tabs = Array.prototype.map.call(document.querySelectorAll('#tabbar button'), function (b) { return b.textContent.replace(/\s+/g, ''); });
    return {
      text: document.body.innerText,
      tabs: tabs.map(function (t) { return t.replace(/[^\u4e00-\u9fff]/g, ''); }),
      hidden: document.getElementById('tabbar').hidden
    };
  });
  check('tabs', home.tabs.join(',') === '今日,晨读,乐园,主线', home.tabs.join(','));
  check('today copy', home.text.indexOf('人生设计师') >= 0 && home.text.indexOf('开始大餐') >= 0 && home.text.indexOf('今日一句') >= 0);
  check('no feast tab', home.tabs.join('').indexOf('大餐') < 0);
  await fits(page, 'today');

  await tap(page, '[data-act=open-feast]');
  await tap(page, '[data-act=toggle-dish][data-id=baji]');
  await tap(page, '[data-act=feast-next]');
  const confirmText = await page.evaluate(function () { return document.body.innerText; });
  check('three confirms', confirmText.indexOf('桌面收拾干净了') >= 0 && confirmText.indexOf('喝好水了') >= 0 && confirmText.indexOf('上厕所了') >= 0);
  await tap(page, '[data-k=desk]');
  await tap(page, '[data-k=water]');
  await tap(page, '[data-k=toilet]');
  await tap(page, '[data-act=confirm-go]');
  const pomo = await page.evaluate(function () { return document.body.innerText; });
  check('pomo shows dish', pomo.indexOf('脆虾滑') >= 0 && pomo.indexOf('八极拳') >= 0);
  await page.screenshot({ path: path.join(shot, 'feast-pomo.png') });
  await tap(page, '[data-act=pomo-toggle]');
  const running = await page.evaluate(function () { return window.MY.views.feast.running; });
  check('timer running', running === true);
  await page.evaluate(function () { window.MY.views.feast.setRemain(1); window.MY.views.feast.tick(); });
  await page.waitForFunction(function () { return document.body.innerText.indexOf('大餐完成') >= 0; });
  const saved = await page.evaluate(function () {
    return JSON.parse(localStorage.getItem('muyang_v6'));
  });
  check('baji saved', saved.tasks && saved.tasks.baji === true);
  check('coins', saved.coins === 185, String(saved.coins));
  check('log', saved.logs && saved.logs[0] && saved.logs[0].text.indexOf('脆虾滑') >= 0 && saved.logs[0].text.indexOf('八极拳') >= 0);
  check('yuanli life', saved.system && saved.system.yuanli.life === 1, JSON.stringify(saved.system && saved.system.yuanli));
  check('unknown kept later', saved.homePet === '');
  await fits(page, 'feast-done');

  await tap(page, '[data-act=feast-exit]');
  await tap(page, '[data-act=open-feast]');
  await tap(page, '[data-act=toggle-dish][data-id=zaodu]');
  await tap(page, '[data-act=feast-next]');
  const readBtn = await page.evaluate(function () { return document.body.innerText; });
  check('zaodu to morning', readBtn.indexOf('去晨读') >= 0 && readBtn.indexOf('田园菠菜') >= 0);
  await tap(page, '[data-act=go-read]');
  await page.waitForSelector('h2.rec-title');
  const first = await page.evaluate(function () {
    const title = document.querySelector('h2.rec-title').textContent;
    const poem = window.MY.POEMS.filter(function (p) { return p.title === title; })[0];
    return { title: title, line: poem.lines[0] };
  });
  console.log('first card', first.title, first.line);
  await reciteToday(page);
  const afterRead = await page.evaluate(function () {
    const s = JSON.parse(localStorage.getItem('muyang_v6'));
    const g = JSON.parse(localStorage.getItem('gushi337_v2'));
    const today = (function () {
      const d = new Date();
      const p = function (n) { return (n < 10 ? '0' : '') + n; };
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    })();
    return {
      zaodu: s.tasks.zaodu === true,
      coins: s.coins,
      learn: s.system.yuanli.learn,
      done: g.days[today] && g.days[today].done,
      p1: g.poems.p1,
      text: document.body.innerText.slice(0, 200)
    };
  });
  console.log('after read', JSON.stringify(afterRead));
  check('zaodu saved', afterRead.zaodu === true);
  check('learn yuanli', afterRead.learn >= 1, String(afterRead.learn));
  check('gushi today done', afterRead.done === true);
  check('p1 graded', afterRead.p1 && afterRead.p1.best === 100 && afterRead.p1.stage >= 1);
  await page.screenshot({ path: path.join(shot, 'morning-done.png') });

  await tap(page, '[data-act=back-home]');
  await tap(page, '[data-act=open-poem][data-id="25"]');
  const jingwei = await page.evaluate(function () { return document.body.innerText; });
  check('精卫原文', jingwei.indexOf('炎帝之少女') >= 0 && jingwei.indexOf('以堙于东海') >= 0);
  await tap(page, '[data-act=back-home]');
  await tap(page, '[data-act=open-poem][data-id="6"]');
  const chusai = await page.evaluate(function () { return document.body.innerText; });
  check('出塞原文与用字', chusai.indexOf('秦时明月汉时关') >= 0 && chusai.indexOf('為') >= 0);
  await fits(page, 'poem');
  await tap(page, '[data-act=back-home]');
  const xpBefore = await page.evaluate(function () { return JSON.parse(localStorage.getItem('gushi337_v2')).xp; });
  await tap(page, '[data-act=start-quiz]');
  await tap(page, '.opt');
  await page.waitForFunction(function (xp) {
    var g = JSON.parse(localStorage.getItem('gushi337_v2'));
    return g.xp > xp;
  }, { timeout: 4000 }, xpBefore);
  const quizText = await page.evaluate(function () { return document.body.innerText; });
  check('quiz moved', quizText.indexOf('补上被挖掉的字') >= 0 || quizText.indexOf('下一句') >= 0 || quizText.indexOf('上一句') >= 0 || quizText.indexOf('哪一首') >= 0 || quizText.indexOf('作者') >= 0 || quizText.indexOf('这一句是') >= 0 || quizText.indexOf('斩获') >= 0);
  await fits(page, 'quiz');

  await tap(page, '#tabbar [data-go=park]');
  await fits(page, 'park');
  await tap(page, '[data-act=shop][data-id=dog]');
  await tap(page, '[data-act=panel][data-panel=garden]');
  await tap(page, '[data-act=seed][data-i="0"]');
  await tap(page, '[data-act=plant][data-i="3"]');
  await tap(page, '[data-act=panel][data-panel=pet]');
  await tap(page, '[data-act=feed]');
  await page.screenshot({ path: path.join(shot, 'park.png') });
  const park = await page.evaluate(function () {
    const s = JSON.parse(localStorage.getItem('muyang_v6'));
    return {
      owned: s.ownedPets,
      active: s.activePet,
      hunger: s.petData.dog && s.petData.dog.hunger,
      lawn: s.lawn && s.lawn[3],
      coins: s.coins,
      text: document.body.innerText
    };
  });
  console.log('park', JSON.stringify({ owned: park.owned, hunger: park.hunger, lawn: park.lawn, coins: park.coins }));
  check('adopted dog', park.active === 'dog' && park.owned.indexOf('dog') >= 0);
  check('planted sunflower', park.lawn && park.lawn.type === 'sunflower');
  check('fed', park.hunger === 100, String(park.hunger));
  check('pet visible', park.text.indexOf('小汪') >= 0 && park.text.indexOf('向日葵') < 0);
  await tap(page, '[data-act=panel][data-panel=garden]');
  const gardenText = await page.evaluate(function () { return document.body.innerText; });
  check('garden names', gardenText.indexOf('向日葵') >= 0 && gardenText.indexOf('坚果') >= 0 && gardenText.indexOf('樱桃') >= 0);
  await fits(page, 'garden');
  await page.screenshot({ path: path.join(shot, 'garden.png') });

  await tap(page, '#tabbar [data-go=mainline]');
  const mainText = await page.evaluate(function () { return document.body.innerText; });
  check('mainline', mainText.indexOf('我要设计我自己的人生') >= 0 && mainText.indexOf('先做完，再玩') < 0);
  await tap(page, '[data-act=tab][data-tab=rules]');
  const rules = await page.evaluate(function () { return document.body.innerText; });
  check('rules', rules.indexOf('先做完，再玩') >= 0 && rules.indexOf('今天的事今天完成') >= 0 && rules.indexOf('不会的先自己想 3 分钟') >= 0 && rules.indexOf('待牧橒口述修订') >= 0);
  await tap(page, '[data-act=tab][data-tab=workflow]');
  const wf = await page.evaluate(function () { return document.body.innerText; });
  check('workflow', wf.indexOf('遇到难题走这五步') >= 0 && wf.indexOf('人生设计师不靠灵感，靠流程。') >= 0);
  await tap(page, '[data-act=tab][data-tab=review]');
  const rv = await page.evaluate(function () { return document.body.innerText; });
  check('review lock', rv.indexOf('周六晚饭后') >= 0);
  await tap(page, '[data-act=tab][data-tab=log]');
  const log = await page.evaluate(function () { return document.body.innerText; });
  check('growth log', log.indexOf('八极拳') >= 0 && log.indexOf('早读') >= 0);
  await tap(page, '[data-act=tab][data-tab=radar]');
  const radar = await page.evaluate(function () {
    return { text: document.body.innerText, svg: !!document.querySelector('svg.radar') };
  });
  check('radar', radar.svg && radar.text.indexOf('道德修养') >= 0 && radar.text.indexOf('学业水平') >= 0);
  await fits(page, 'mainline');
  await page.screenshot({ path: path.join(shot, 'mainline.png') });

  await tap(page, '#tabbar [data-go=today]');
  await tap(page, '[data-go=parent]');
  const parent = await page.evaluate(function () {
    return {
      text: document.body.innerText,
      hidden: document.getElementById('tabbar').hidden,
      acts: Array.prototype.map.call(document.querySelectorAll('[data-act]'), function (el) { return el.getAttribute('data-act'); })
    };
  });
  check('parent readonly', parent.hidden && parent.text.indexOf('只看，不改任务') >= 0 && parent.text.indexOf('八极拳') >= 0);
  check('parent no edits', parent.acts.indexOf('toggle-dish') < 0 && parent.acts.indexOf('shop') < 0 && parent.acts.indexOf('feed') < 0 && parent.acts.indexOf('rule-add') < 0);
  await fits(page, 'parent');
  await page.screenshot({ path: path.join(shot, 'parent.png') });

  const archive = await page.evaluate(function () {
    window.MY.state.mysteryBox = { keep: 'yes', n: 7 };
    window.MY.state.petData.dog.handNote = '别删';
    window.MY.save();
    var g = JSON.parse(localStorage.getItem('gushi337_v2'));
    g.extraMark = 'stay';
    g.poems.p1.handNote = 'keep';
    localStorage.setItem('gushi337_v2', JSON.stringify(g));
    window.MY.gushi.reload();
    return window.MY.exportArchive();
  });
  const archivePath = path.join('/tmp', 'muyun-archive.json');
  fs.writeFileSync(archivePath, JSON.stringify(archive));
  check('export has mystery', archive.muyang_v6 && archive.muyang_v6.mysteryBox && archive.muyang_v6.mysteryBox.keep === 'yes');
  check('export has gushi extra', archive.gushi337_v2 && archive.gushi337_v2.extraMark === 'stay' && archive.gushi337_v2.poems.p1.handNote === 'keep');

  await page.evaluate(function () {
    localStorage.clear();
    var toast = document.getElementById('toast');
    if (toast) toast.textContent = '';
  });
  const chooserWait = page.waitForFileChooser();
  await tap(page, '[data-act=import-pick]');
  const chooser = await chooserWait;
  await chooser.accept([archivePath]);
  await page.waitForFunction(function () {
    var t = (document.getElementById('toast') || {}).textContent || '';
    return t.indexOf('存档接回来了') >= 0 || t.indexOf('打不开') >= 0;
  }, { timeout: 5000 });
  const imported = await page.evaluate(function () {
    var s = JSON.parse(localStorage.getItem('muyang_v6'));
    var g = JSON.parse(localStorage.getItem('gushi337_v2'));
    return {
      mystery: s.mysteryBox,
      note: s.petData && s.petData.dog && s.petData.dog.handNote,
      baji: s.tasks.baji,
      extra: g.extraMark,
      hand: g.poems.p1.handNote,
      best: g.poems.p1.best
    };
  });
  console.log('imported', JSON.stringify(imported));
  check('import mystery', imported.mystery && imported.mystery.keep === 'yes' && imported.mystery.n === 7);
  check('import pet note', imported.note === '别删');
  check('import tasks', imported.baji === true);
  check('import gushi extra', imported.extra === 'stay' && imported.hand === 'keep' && imported.best === 100);

  const targets = await page.evaluate(function () {
    return Array.prototype.map.call(document.querySelectorAll('.btn-main, .tabbar button, .dish, .ck'), function (el) {
      const r = el.getBoundingClientRect();
      return { h: r.height, w: r.width };
    }).filter(function (r) { return r.h > 0; });
  });
  const tiny = targets.filter(function (r) { return r.h < 44 || r.w < 44; });
  check('touch targets', tiny.length === 0, JSON.stringify(tiny.slice(0, 4)));
  check('no external requests', external.length === 0, external.slice(0, 5).join(' '));

  const ctx = await browser.createBrowserContext();
  const page2 = await ctx.newPage();
  await page2.goto('http://127.0.0.1:' + port + '/', { waitUntil: 'networkidle0' });
  const rolled = await page2.evaluate(function () {
    var y = new Date();
    y.setDate(y.getDate() - 1);
    var s = JSON.parse(localStorage.getItem('muyang_v6'));
    s.tasks = { homework: true, customTask: true };
    s.mysteryBox = { keep: 'yes' };
    s.streak = 4;
    s.lastDate = y.toDateString();
    s.lastStreakDate = y.toDateString();
    s.weird = [1, { a: 'b' }];
    localStorage.setItem('muyang_v6', JSON.stringify(s));
    window.MY.reloadState();
    var now = JSON.parse(localStorage.getItem('muyang_v6'));
    return {
      mystery: now.mysteryBox,
      weird: now.weird,
      tasks: now.tasks,
      archive: now.dayArchive[y.toDateString()],
      streak: now.streak,
      last: now.lastDate
    };
  });
  console.log('rollover', JSON.stringify(rolled));
  check('rollover keeps mystery', rolled.mystery && rolled.mystery.keep === 'yes' && rolled.weird && rolled.weird[1].a === 'b');
  check('rollover archives tasks', rolled.archive && rolled.archive.tasks.homework === true && rolled.archive.tasks.customTask === true);
  check('rollover fresh tasks', rolled.tasks && !rolled.tasks.homework);
  check('streak plus one', rolled.streak === 5, String(rolled.streak));

  const sync = JSON.parse(fs.readFileSync(path.join(root, 'data/sync.json'), 'utf8'));
  sync.s.legacyFlag = { from: 'sync' };
  const syncRes = await page2.evaluate(function (obj) {
    window.MY.importArchive(obj);
    var now = JSON.parse(localStorage.getItem('muyang_v6'));
    return { flag: now.legacyFlag, coins: now.coins, hasArchive: !!now.dayArchive };
  }, sync);
  console.log('sync import', JSON.stringify(syncRes));
  check('sync.json flag kept', syncRes.flag && syncRes.flag.from === 'sync');
  check('sync coins', syncRes.coins === 100);

  const oldGushi = {
    ver: 2, start: '2026-01-01', xp: 15,
    poems: { p3: { reads: 2, days: ['2026-01-01'], stage: 1, due: null, last: null, best: 80, tests: 1, mastered: false, handNote: 'keep-v1' } },
    days: {}, badges: ['first'], plan: null, sound: true, extraMark: 'from-old'
  };
  const gushiRes = await page2.evaluate(function (obj) {
    window.MY.importArchive(obj);
    var g = JSON.parse(localStorage.getItem('gushi337_v2'));
    return { extra: g.extraMark, note: g.poems.p3.handNote, xp: g.xp, badge: g.badges };
  }, oldGushi);
  check('old gushi import', gushiRes.extra === 'from-old' && gushiRes.note === 'keep-v1' && gushiRes.xp === 15);

  await browser.close();
  server.close();
  if (fail.length) {
    console.error('\nFAILED\n' + fail.join('\n'));
    process.exit(1);
  }
  console.log('\nall checks passed');
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
