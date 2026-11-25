/* gushi-337：键名 gushi337_v2，没有 v2 时读 gushi337_v1。排程、计分与原引擎一致。 */
(function (MY) {
  'use strict';

  var KEY = 'gushi337_v2';
  var KEY1 = 'gushi337_v1';
  var PUNCT = /[，。、？！；：""''《》·,!?;:"'\s]/g;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function today() { return ymd(new Date()); }
  function addDays(s, n) {
    var d = new Date(s + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return ymd(d);
  }
  function diffDays(a, b) {
    return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);
  }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = rnd(i + 1);
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }
  function plain(s) { return String(s == null ? '' : s).replace(PUNCT, ''); }

  function blank() {
    return { ver: 2, start: today(), xp: 0, poems: {}, days: {}, badges: [], plan: null, sound: true };
  }

  var state = null;

  function load() {
    var base = blank();
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) {
        var old = localStorage.getItem(KEY1);
        if (old) return Object.assign(base, JSON.parse(old));
        return base;
      }
      return Object.assign(base, JSON.parse(raw));
    } catch (e) { return base; }
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function reload() {
    state = load();
    return state;
  }
  state = load();

  function byId(id) {
    return MY.POEMS.filter(function (p) { return p.id === +id; })[0] || null;
  }
  function P(id) {
    if (!state.poems || typeof state.poems !== 'object' || Array.isArray(state.poems)) state.poems = {};
    var k = 'p' + id;
    if (!state.poems[k] || typeof state.poems[k] !== 'object' || Array.isArray(state.poems[k])) {
      state.poems[k] = { reads: 0, days: [], stage: -1, due: null, last: null, best: 0, tests: 0, mastered: false };
    }
    var p = state.poems[k];
    if (typeof p.reads !== 'number') p.reads = 0;
    if (!Array.isArray(p.days)) p.days = [];
    if (typeof p.stage !== 'number') p.stage = -1;
    if (p.due === undefined) p.due = null;
    if (p.last === undefined) p.last = null;
    if (typeof p.best !== 'number') p.best = 0;
    if (typeof p.tests !== 'number') p.tests = 0;
    if (typeof p.mastered !== 'boolean') p.mastered = false;
    return p;
  }
  function day(date) {
    if (!state.days || typeof state.days !== 'object' || Array.isArray(state.days)) state.days = {};
    var d = date || today();
    if (!state.days[d] || typeof state.days[d] !== 'object') {
      state.days[d] = { reads: 0, tests: 0, xp: 0, ok: 0, done: false, hit: 0, acc: 0, total: 0, mid: 0, no: 0 };
    }
    return state.days[d];
  }
  function dayIndex() {
    if (!state.start) state.start = today();
    return Math.max(1, diffDays(state.start, today()) + 1);
  }
  function weekOf(d) { return Math.min(4, Math.floor((d - 1) / 7)); }

  function buildPlan() {
    var pool = { wuyan: [], qiyan: [], ciqu: [] };
    MY.POEMS.forEach(function (p) { if (pool[p.genre]) pool[p.genre].push(p.id); });
    var ptr = { wuyan: 0, qiyan: 0, ciqu: 0 };
    var weeks = MY.WEEK_NEW_PLAN.map(function (q) {
      var ids = [];
      ['wuyan', 'qiyan', 'ciqu'].forEach(function (g) {
        for (var i = 0; i < q[g]; i++) {
          if (ptr[g] < pool[g].length) ids.push(pool[g][ptr[g]++]);
        }
      });
      return ids;
    });
    return { weeks: weeks, built: today() };
  }
  function getPlan() {
    if (!state.plan || !state.plan.weeks) { state.plan = buildPlan(); persist(); }
    return state.plan;
  }
  function todayList() {
    var d = dayIndex();
    var w = weekOf(d);
    var weeks = getPlan().weeks || [];
    var ids = (weeks[w] || []).slice();
    var need = 9 - ids.length;
    if (need > 0) {
      var cand = MY.POEMS.filter(function (p) { return ids.indexOf(p.id) < 0 && P(p.id).stage >= 0; });
      cand.sort(function (a, b) {
        var A = P(a.id), B = P(b.id);
        if (A.due !== B.due) return String(A.due).localeCompare(String(B.due));
        return A.best - B.best;
      });
      for (var i = 0; i < Math.min(need, cand.length); i++) ids.push(cand[i].id);
    }
    return ids;
  }
  function dueList() {
    var t = today();
    return MY.POEMS.filter(function (p) {
      var s = P(p.id);
      return s.stage >= 0 && s.due && s.due <= t && s.last !== t;
    }).sort(function (a, b) {
      var A = P(a.id), B = P(b.id);
      var ua = A.stage >= 3 ? 0 : 1, ub = B.stage >= 3 ? 0 : 1;
      if (ua !== ub) return ua - ub;
      if (A.due !== B.due) return String(A.due).localeCompare(String(B.due));
      return A.best - B.best;
    });
  }
  function deckToday() {
    var set = todayList();
    dueList().forEach(function (p) {
      if (set.indexOf(p.id) < 0 && set.length < 12) set.push(p.id);
    });
    set.sort(function (a, b) { return byId(a).level - byId(b).level; });
    return set;
  }

  var RANKS = ['蒙童', '学子', '秀才', '举人', '贡士', '进士', '翰林', '诗魁', '诗仙'];
  function rank() { return RANKS[Math.min(RANKS.length - 1, Math.floor((state.xp || 0) / 120))]; }
  function addXp(n) { state.xp = (state.xp || 0) + n; day().xp = (day().xp || 0) + n; }
  function masteredCount() {
    return MY.POEMS.filter(function (p) { return !!P(p.id).mastered; }).length;
  }
  function streak() {
    var n = 0;
    var cur = today();
    if (!state.days || !state.days[cur] || !(state.days[cur].reads || state.days[cur].tests)) cur = addDays(cur, -1);
    while (state.days && state.days[cur] && (state.days[cur].reads || state.days[cur].tests)) {
      n += 1;
      cur = addDays(cur, -1);
    }
    return n;
  }

  var BADGES = [
    { id: 'first', nm: '开卷第一读', ok: function () { return MY.POEMS.some(function (p) { return P(p.id).reads > 0; }); } },
    { id: 's3', nm: '三日不辍', ok: function () { return streak() >= 3; } },
    { id: 's7', nm: '七日成诵', ok: function () { return MY.POEMS.some(function (p) { return P(p.id).days.length >= 7; }); } },
    { id: 'full', nm: '一字不差', ok: function () { return MY.POEMS.some(function (p) { return P(p.id).best === 100; }); } },
    { id: 'm5', nm: '掌握 5 篇', ok: function () { return masteredCount() >= 5; } },
    { id: 'm13', nm: '掌握 13 篇', ok: function () { return masteredCount() >= 13; } },
    { id: 'm25', nm: '25 篇全通', ok: function () { return masteredCount() >= 25; } },
    { id: 'cut8', nm: '单日斩 8 首', ok: function () { return Object.keys(state.days || {}).some(function (k) { return (state.days[k].hit || 0) >= 8; }); } },
    { id: 'read100', nm: '朗读满 100 遍', ok: function () { return MY.POEMS.reduce(function (a, p) { return a + P(p.id).reads; }, 0) >= 100; } },
    { id: 'xp600', nm: '进士及第', ok: function () { return (state.xp || 0) >= 600; } }
  ];
  function checkBadges() {
    if (!Array.isArray(state.badges)) state.badges = [];
    var got = [];
    BADGES.forEach(function (b) {
      if (state.badges.indexOf(b.id) < 0 && b.ok()) { state.badges.push(b.id); got.push(b); }
    });
    if (got.length) persist();
    return got;
  }

  function markRead(id) {
    var p = P(id);
    var t = today();
    p.reads += 1;
    if (p.days.indexOf(t) < 0) p.days.push(t);
    if (p.stage < 0) { p.stage = 0; p.due = t; p.last = null; }
    day().reads = (day().reads || 0) + 1;
    addXp(2);
    persist();
    return { record: p, badges: checkBadges() };
  }

  function grade(id, score) {
    var p = P(id);
    var t = today();
    p.tests += 1;
    p.best = Math.max(p.best, score);
    if (p.stage < 0) p.stage = 0;
    if (p.last !== t) {
      if (score >= 80) {
        p.stage = Math.min(p.stage + 1, MY.EBBINGHAUS_STEPS.length);
        p.due = addDays(t, MY.EBBINGHAUS_STEPS[Math.min(p.stage - 1, MY.EBBINGHAUS_STEPS.length - 1)]);
        if (p.stage >= 4 && p.best >= 70) p.mastered = true;
      } else if (score >= 60) {
        p.due = addDays(t, 1);
      } else {
        p.stage = Math.max(0, p.stage - 1);
        p.due = addDays(t, 1);
      }
    }
    p.last = t;
    var rec = day();
    rec.tests = (rec.tests || 0) + 1;
    if (score >= 80) rec.ok = (rec.ok || 0) + 1;
    addXp(Math.round(score / 6) + 3);
    persist();
    return { record: p, badges: checkBadges() };
  }

  var CHEERS = {
    perfect: ['一字不差，今天你就是诗仙', '全中！这记性够去考状元', '一首不落，稳'],
    good: ['一天不落，一月成诵', '手感来了，乘胜追击', '越背越快，就是这个节奏'],
    ok: ['慢一点没关系，明天继续', '记住的都是自己的，不急', '没记住的那几首，明天再来'],
    low: ['开了头就赢了，明天再来', '背诗如登山，一步一步来', '今天种下，明天发芽']
  };
  function cheerOf(acc, hit) {
    function pick(a) { return a[rnd(a.length)]; }
    if (hit > 0 && acc === 100) return pick(CHEERS.perfect);
    if (acc >= 80) return pick(CHEERS.good);
    if (acc >= 55) return pick(CHEERS.ok);
    return pick(CHEERS.low);
  }

  function finishToday(counts, ids, resultMap) {
    var t = today();
    var rec = day(t);
    var ok = counts.ok, mid = counts.mid, no = counts.no;
    var tries = ok + mid + no;
    var acc = tries ? Math.round(ok / tries * 100) : 0;
    rec.done = true;
    rec.hit = Math.max(rec.hit || 0, ok);
    rec.total = ids.length;
    rec.acc = acc;
    rec.mid = mid;
    rec.no = no;
    var best = null;
    ids.forEach(function (id) {
      if (resultMap[id] === 'ok') {
        var p = byId(id);
        if (p && (!best || p.level > best.level)) best = p;
      }
    });
    if (!best) best = byId(ids[0]) || MY.POEMS[0];
    rec.ach = {
      day: dayIndex(),
      date: t.replace(/-/g, '.'),
      weekday: '日一二三四五六'[new Date(t + 'T00:00:00').getDay()],
      hit: ok,
      total: ids.length,
      acc: acc,
      streak: streak(),
      mastered: masteredCount(),
      reads: rec.reads || 0,
      bestId: best ? best.id : ids[0]
    };
    persist();
    return {
      acc: acc, ok: ok, mid: mid, no: no, total: ids.length, best: best,
      badges: checkBadges(), cheer: cheerOf(acc, ok), mode: 'today'
    };
  }

  var TYPES = ['blank', 'next', 'prev', 'title', 'author'];
  var LABEL = { blank: '补上被挖掉的字', next: '它的下一句是', prev: '它的上一句是', title: '这出自哪一首', author: '它的作者是' };
  function pickType() {
    var w = [42, 26, 14, 11, 7];
    var s = 0;
    w.forEach(function (v) { s += v; });
    var r = rnd(s);
    for (var i = 0; i < w.length; i++) {
      if (r < w[i]) return TYPES[i];
      r -= w[i];
    }
    return 'blank';
  }
  function distract(kind, len, others, avoid) {
    for (var g = 0; g < 400; g++) {
      var q = others[rnd(others.length)];
      var c = null;
      if (kind === 'frag') {
        var ls = q.lines.map(plain).filter(function (x) { return x.length > len; });
        if (!ls.length) continue;
        var t = ls[rnd(ls.length)];
        c = t.substr(rnd(t.length - len + 1), len);
      } else if (kind === 'line') {
        var lines = q.lines.map(plain).filter(function (x) { return x.length >= 4; });
        if (!lines.length) continue;
        c = lines[rnd(lines.length)];
      } else if (kind === 'title') c = q.title;
      else if (kind === 'author') c = q.dynasty + '·' + q.author;
      if (c && avoid.indexOf(c) < 0) return c;
    }
    return null;
  }
  function makeQ(p, type) {
    var others = MY.POEMS.filter(function (x) { return x.id !== p.id; });
    var lines = p.lines.map(plain).filter(function (x) { return x.length >= 3; });
    if (!lines.length) return null;
    var opts = [], ans = '', stem = '', full = '', big = false;
    if (type === 'blank') {
      var s = lines[rnd(lines.length)];
      var len = s.length >= 10 ? 3 : 2;
      var st = rnd(Math.max(1, s.length - len));
      ans = s.substr(st, len);
      opts = [ans];
      while (opts.length < 4) { var c1 = distract('frag', len, others, opts); if (!c1) break; opts.push(c1); }
      stem = MY.esc(s.slice(0, st)) + '<span class="blank">' + '　'.repeat(len) + '</span>' + MY.esc(s.slice(st + len));
      full = s;
    } else if (type === 'next') {
      if (lines.length < 2) return null;
      var i1 = rnd(lines.length - 1);
      ans = lines[i1 + 1];
      opts = [ans];
      while (opts.length < 4) { var c2 = distract('line', 0, others, opts); if (!c2) break; opts.push(c2); }
      stem = MY.esc(lines[i1]);
      full = lines[i1] + '，' + ans;
      big = ans.length > 7;
    } else if (type === 'prev') {
      if (lines.length < 2) return null;
      var i2 = 1 + rnd(lines.length - 1);
      ans = lines[i2 - 1];
      opts = [ans];
      while (opts.length < 4) { var c3 = distract('line', 0, others, opts); if (!c3) break; opts.push(c3); }
      stem = MY.esc(lines[i2]);
      full = ans + '，' + lines[i2];
      big = ans.length > 7;
    } else if (type === 'title') {
      var s2 = lines[rnd(lines.length)];
      ans = p.title;
      opts = [ans];
      while (opts.length < 4) { var c4 = distract('title', 0, others, opts); if (!c4) break; opts.push(c4); }
      stem = '「' + MY.esc(s2) + '」';
      full = s2;
      big = s2.length > 9;
    } else {
      var s3 = lines[rnd(lines.length)];
      ans = p.dynasty + '·' + p.author;
      opts = [ans];
      while (opts.length < 4) { var c5 = distract('author', 0, others, opts); if (!c5) break; opts.push(c5); }
      stem = '「' + MY.esc(s3) + '」';
      full = s3;
      big = s3.length > 9;
    }
    if (opts.length < 4) return null;
    var idx = shuffle(opts.map(function (o, i) { return i; }));
    return {
      type: type,
      label: LABEL[type],
      stemHtml: stem,
      big: big,
      opts: idx.map(function (i) { return opts[i]; }),
      ans: idx.indexOf(0),
      full: full,
      poemId: p.id
    };
  }
  function makeQuestion(poem, type) {
    var t = type || pickType();
    var q = makeQ(poem, t);
    if (!q) q = makeQ(poem, 'blank');
    if (!q) q = makeQ(poem, 'title');
    return q;
  }

  var WEEK_NAMES = ['第一周 · 开卷', '第二周 · 进境', '第三周 · 攻坚', '第四周 · 收官', '冲刺 · 总复习'];

  function stats() {
    var rec = state.days && state.days[today()];
    var deck = deckToday();
    var last = null;
    if (state.badges && state.badges.length) {
      var id = state.badges[state.badges.length - 1];
      last = BADGES.filter(function (b) { return b.id === id; })[0] || null;
    }
    var w = weekOf(dayIndex());
    return {
      day: dayIndex(),
      weekName: WEEK_NAMES[w] || WEEK_NAMES[0],
      mastered: masteredCount(),
      deck: deck,
      due: dueList().length,
      todayDone: !!(rec && rec.done),
      badge: last ? last.nm : '',
      xp: state.xp || 0,
      rank: rank(),
      streak: streak()
    };
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) {
      if (MY.toast) MY.toast('这台设备暂时读不出来，我们看着字一起背');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    } catch (e) {
      if (MY.toast) MY.toast('这台设备暂时读不出来，我们看着字一起背');
    }
  }

  MY.gushi = {
    reload: reload,
    persist: persist,
    stats: stats,
    deck: deckToday,
    poem: byId,
    record: P,
    markRead: markRead,
    grade: grade,
    finishToday: finishToday,
    makeQuestion: makeQuestion,
    cheerOf: cheerOf,
    speak: speak,
    fullText: function (p) { return p.lines.join(''); },
    todayDone: function () {
      var rec = state.days && state.days[today()];
      return !!(rec && rec.done);
    },
    badges: function () {
      return BADGES.map(function (b) {
        return { id: b.id, nm: b.nm, got: !!(state.badges && state.badges.indexOf(b.id) >= 0) };
      });
    }
  };
})(window.MY = window.MY || {});
