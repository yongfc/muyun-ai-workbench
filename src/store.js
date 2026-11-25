/* 主进度：localStorage 键名保持 muyang_v6。只补字段，不删旧字段。 */
(function (MY) {
  'use strict';

  var KEY = 'muyang_v6';
  MY.STORAGE_KEYS = [KEY, 'gushi337_v2', 'gushi337_v1'];

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  MY.pad = pad;
  MY.ymd = function (d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  };
  MY.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  function nl(s) { return MY.esc(s).replace(/\n/g, '<br>'); }
  MY.nl = nl;

  function todayStamp() { return new Date().toDateString(); }

  function defaultSystem() {
    var t = MY.ymd(new Date());
    return {
      version: 'v1.0',
      vnum: 1,
      mainline: {
        title: '人生设计师',
        declaration: MY.DECLARATION,
        since: t
      },
      rules: [
        { id: 'r1', text: '先做完，再玩', by: '陈咏', date: t, draft: true },
        { id: 'r2', text: '今天的事今天完成', by: '陈咏', date: t, draft: true },
        { id: 'r3', text: '不会的先自己想 3 分钟', by: '陈咏', date: t, draft: true }
      ],
      dailyNotes: {},
      reviews: [],
      patches: [{ v: 'v1.0', date: t, note: '人生系统安装完成，主线确立：人生设计师' }],
      cards: [],
      workflow: null,
      yuanli: { life: 0, drive: 0, learn: 0 },
      sound: true,
      flags: {}
    };
  }
  MY.defaultSystem = defaultSystem;

  function defaultState() {
    var today = todayStamp();
    return {
      coins: 100,
      tasks: {},
      feast: [],
      logs: [],
      ownedPets: [],
      activePet: null,
      homePet: '',
      petData: {},
      lawn: new Array(15).fill(null),
      selectedSeed: null,
      lastDate: today,
      confirmed: false,
      streak: 1,
      lastStreakDate: today
    };
  }

  function ensureSystem(s) {
    var d = defaultSystem();
    var changed = false;
    if (!s.system || typeof s.system !== 'object' || Array.isArray(s.system)) {
      s.system = d;
      return true;
    }
    var sys = s.system;
    ['version', 'vnum', 'mainline', 'rules', 'dailyNotes', 'reviews', 'patches', 'cards', 'workflow', 'yuanli', 'sound', 'flags'].forEach(function (k) {
      if (sys[k] === undefined) { sys[k] = d[k]; changed = true; }
    });
    if (!sys.mainline || typeof sys.mainline !== 'object' || Array.isArray(sys.mainline)) {
      sys.mainline = d.mainline; changed = true;
    } else if (!sys.mainline.declaration) {
      sys.mainline.declaration = d.mainline.declaration; changed = true;
    }
    if (!Array.isArray(sys.rules)) { sys.rules = d.rules; changed = true; }
    if (!sys.dailyNotes || typeof sys.dailyNotes !== 'object' || Array.isArray(sys.dailyNotes)) {
      sys.dailyNotes = {}; changed = true;
    }
    if (!Array.isArray(sys.reviews)) { sys.reviews = []; changed = true; }
    if (!Array.isArray(sys.patches)) { sys.patches = d.patches; changed = true; }
    if (!Array.isArray(sys.cards)) { sys.cards = []; changed = true; }
    if (!sys.flags || typeof sys.flags !== 'object' || Array.isArray(sys.flags)) {
      sys.flags = {}; changed = true;
    }
    if (!sys.yuanli || typeof sys.yuanli !== 'object' || Array.isArray(sys.yuanli)) {
      sys.yuanli = { life: 0, drive: 0, learn: 0 }; changed = true;
    } else {
      ['life', 'drive', 'learn'].forEach(function (k) {
        if (typeof sys.yuanli[k] !== 'number') { sys.yuanli[k] = 0; changed = true; }
      });
    }
    return changed;
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(MY.state));
  }
  MY.save = save;

  function load() {
    var s = null;
    var dirty = false;
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) s = JSON.parse(raw);
    } catch (e) { s = null; }
    if (!s || typeof s !== 'object' || Array.isArray(s)) {
      s = defaultState();
      dirty = true;
    }
    var today = todayStamp();
    if (s.lastDate !== today) {
      if (!s.dayArchive || typeof s.dayArchive !== 'object' || Array.isArray(s.dayArchive)) s.dayArchive = {};
      var archiveKey = s.lastDate || 'earlier';
      if (!s.dayArchive[archiveKey]) {
        s.dayArchive[archiveKey] = {
          tasks: (s.tasks && typeof s.tasks === 'object' && !Array.isArray(s.tasks)) ? s.tasks : {},
          feast: Array.isArray(s.feast) ? s.feast.slice() : [],
          confirmed: !!s.confirmed
        };
      }
      if (!Array.isArray(s.logs)) s.logs = [];
      s.tasks = {};
      s.feast = [];
      s.confirmed = false;
      if (s.lastStreakDate && Math.round((new Date(today) - new Date(s.lastStreakDate)) / 86400000) === 1) {
        s.streak = (s.streak || 1) + 1;
      } else {
        s.streak = 1;
      }
      s.lastStreakDate = today;
      s.lastDate = today;
      dirty = true;
    }
    if (ensureSystem(s)) dirty = true;
    MY.state = s;
    if (dirty) save();
    return s;
  }
  MY.reloadState = load;

  function coins() {
    var n = MY.state && MY.state.coins;
    return (typeof n === 'number' && isFinite(n)) ? n : 0;
  }
  MY.coins = coins;

  function taskMap() {
    var t = MY.state && MY.state.tasks;
    return (t && typeof t === 'object' && !Array.isArray(t)) ? t : {};
  }
  MY.taskMap = taskMap;

  function feastList() {
    return (MY.state && Array.isArray(MY.state.feast)) ? MY.state.feast : [];
  }
  MY.feastList = feastList;

  function logs() {
    return (MY.state && Array.isArray(MY.state.logs)) ? MY.state.logs : [];
  }
  MY.logs = logs;

  function addLog(text) {
    if (!Array.isArray(MY.state.logs)) MY.state.logs = [];
    var now = new Date();
    var time = pad(now.getMonth() + 1) + '/' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    MY.state.logs.unshift({ time: time, text: text });
    if (MY.state.logs.length > 50) MY.state.logs.pop();
  }
  MY.addLog = addLog;

  function getPetData(id) {
    if (!MY.state.petData || typeof MY.state.petData !== 'object' || Array.isArray(MY.state.petData)) MY.state.petData = {};
    if (!MY.state.petData[id] || typeof MY.state.petData[id] !== 'object' || Array.isArray(MY.state.petData[id])) {
      MY.state.petData[id] = { level: 1, exp: 0, hunger: 80, happiness: 80 };
    }
    var pd = MY.state.petData[id];
    if (typeof pd.level !== 'number') pd.level = 1;
    if (typeof pd.exp !== 'number') pd.exp = 0;
    if (typeof pd.hunger !== 'number') pd.hunger = 80;
    if (typeof pd.happiness !== 'number') pd.happiness = 80;
    return pd;
  }
  MY.getPetData = getPetData;

  function expNeed(lv) { return (lv || 1) * 50; }
  MY.expNeed = expNeed;

  function levelUpCheck(id) {
    var pd = MY.state.petData && MY.state.petData[id];
    if (!pd) return 0;
    var pet = MY.PET_TYPES.filter(function (p) { return p.id === id; })[0];
    var gained = 0;
    var guard = 0;
    while (pd.exp >= expNeed(pd.level) && guard < 40) {
      pd.exp -= expNeed(pd.level);
      pd.level += 1;
      gained += 1;
      guard += 1;
      addLog((pet ? pet.name : '宠物') + '升到' + pd.level + '级！');
      pd.hunger = 100;
      pd.happiness = 100;
    }
    return gained;
  }
  MY.levelUpCheck = levelUpCheck;

  function todayNote() {
    ensureSystem(MY.state);
    var t = MY.ymd(new Date());
    if (!MY.state.system.dailyNotes[t] || typeof MY.state.system.dailyNotes[t] !== 'object') {
      MY.state.system.dailyNotes[t] = { done: [], missed: [], cheer: '', yuanli: { life: 0, drive: 0, learn: 0 }, link: '', ts: '' };
    }
    return MY.state.system.dailyNotes[t];
  }
  MY.todayNote = todayNote;

  function completeTask(id) {
    var task = MY.taskById(id);
    if (!task) return { ok: false };
    if (!MY.state.tasks || typeof MY.state.tasks !== 'object' || Array.isArray(MY.state.tasks)) MY.state.tasks = {};
    if (MY.state.tasks[id]) return { ok: false, already: true, task: task };
    MY.state.tasks[id] = true;
    MY.state.coins = coins() + task.reward;
    addLog('完成「' + task.name + '」(' + task.dish + ') +' + task.reward + '阳光');
    var levels = 0;
    if (MY.state.activePet) {
      var pd = getPetData(MY.state.activePet);
      pd.exp += 10;
      levels = levelUpCheck(MY.state.activePet);
    }
    if (Array.isArray(MY.state.feast)) {
      var fi = MY.state.feast.indexOf(id);
      if (fi >= 0) MY.state.feast.splice(fi, 1);
    }
    ensureSystem(MY.state);
    var map = MY.YL[id];
    if (map) {
      MY.state.system.yuanli[map[0]] += 1;
      var note = todayNote();
      if (!Array.isArray(note.done)) note.done = [];
      if (note.done.indexOf(id) < 0) note.done.push(id);
    }
    save();
    return { ok: true, task: task, yl: map ? map[0] : null, levels: levels };
  }
  MY.completeTask = completeTask;

  function age(now) {
    now = now || new Date();
    var b = MY.BIRTHDAY;
    var y = now.getFullYear() - b.getFullYear();
    var m = now.getMonth() - b.getMonth();
    var d = now.getDate() - b.getDate();
    if (d < 0) {
      m -= 1;
      d += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (m < 0) { y -= 1; m += 12; }
    return { years: y, months: m, days: d, totalDays: Math.floor((now - b) / 86400000) };
  }
  MY.age = age;

  function radarVals() {
    var done = MY.ALL_TASKS.filter(function (t) { return !!taskMap()[t.id]; }).length;
    var base = 40 + done * 4;
    var petLv = MY.state.activePet ? getPetData(MY.state.activePet).level : 0;
    return MY.CORE_ATTRS.map(function (a) {
      var v = base;
      a.tasks.forEach(function (id) { if (taskMap()[id]) v += 5; });
      if (MY.state.activePet) v += petLv * 1.5;
      return Math.min(95, Math.round(v));
    });
  }
  MY.radarVals = radarVals;

  function petById(id) {
    return MY.PET_TYPES.filter(function (p) { return p.id === id; })[0] || null;
  }
  MY.petById = petById;

  function onShop(pid) {
    var pet = petById(pid);
    if (!pet) return { ok: false };
    if (!Array.isArray(MY.state.ownedPets)) MY.state.ownedPets = [];
    if (MY.state.ownedPets.indexOf(pid) >= 0) {
      MY.state.activePet = pid;
      save();
      return { ok: true, switched: true, pet: pet };
    }
    if (coins() < pet.cost) return { ok: false, need: pet.cost - coins(), pet: pet };
    MY.state.coins = coins() - pet.cost;
    MY.state.ownedPets.push(pid);
    getPetData(pid);
    MY.state.activePet = pid;
    addLog('领养了' + pet.name);
    save();
    return { ok: true, bought: true, pet: pet };
  }
  MY.onShop = onShop;

  function feedPet() {
    if (!MY.state.activePet) return { ok: false, reason: 'nopet' };
    if (coins() < 10) return { ok: false, need: 10 - coins() };
    MY.state.coins = coins() - 10;
    var pd = getPetData(MY.state.activePet);
    pd.hunger = Math.min(100, pd.hunger + 25);
    pd.exp += 5;
    var levels = levelUpCheck(MY.state.activePet);
    addLog('喂了' + (petById(MY.state.activePet) || {}).name);
    save();
    return { ok: true, levels: levels, pet: petById(MY.state.activePet) };
  }
  MY.feedPet = feedPet;

  function playPet() {
    if (!MY.state.activePet) return { ok: false, reason: 'nopet' };
    if (coins() < 15) return { ok: false, need: 15 - coins() };
    MY.state.coins = coins() - 15;
    var pd = getPetData(MY.state.activePet);
    pd.happiness = Math.min(100, pd.happiness + 25);
    pd.exp += 8;
    var levels = levelUpCheck(MY.state.activePet);
    addLog('陪' + (petById(MY.state.activePet) || {}).name + '玩了一会儿');
    save();
    return { ok: true, levels: levels, pet: petById(MY.state.activePet) };
  }
  MY.playPet = playPet;

  function selectSeed(idx) {
    var seed = MY.SEEDS[idx];
    if (!seed) return { ok: false };
    if (coins() < seed.cost) return { ok: false, need: seed.cost - coins(), seed: seed };
    MY.state.selectedSeed = MY.state.selectedSeed === idx ? null : idx;
    save();
    return { ok: true, seed: seed };
  }
  MY.selectSeed = selectSeed;

  function plantAt(i) {
    var idx = MY.state.selectedSeed;
    if (idx == null) return { ok: false, reason: 'noseed' };
    var seed = MY.SEEDS[idx];
    if (!seed) return { ok: false, reason: 'noseed' };
    if (!Array.isArray(MY.state.lawn)) MY.state.lawn = [];
    if (MY.state.lawn[i]) return { ok: false, reason: 'occupied' };
    if (coins() < seed.cost) return { ok: false, need: seed.cost - coins(), seed: seed };
    while (MY.state.lawn.length < 15) MY.state.lawn.push(null);
    MY.state.coins = coins() - seed.cost;
    MY.state.lawn[i] = { type: seed.id };
    MY.state.selectedSeed = null;
    addLog('种下了' + seed.name);
    save();
    return { ok: true, seed: seed };
  }
  MY.plantAt = plantAt;

  function asObject(val) {
    if (typeof val === 'string') val = JSON.parse(val);
    if (!val || typeof val !== 'object' || Array.isArray(val)) return null;
    return val;
  }

  function exportArchive() {
    save();
    if (MY.gushi && MY.gushi.persist) MY.gushi.persist();
    var out = { format: 'muyun-archive-v1', exportedAt: new Date().toISOString() };
    MY.STORAGE_KEYS.forEach(function (k) {
      var raw = localStorage.getItem(k);
      if (raw == null) return;
      try { out[k] = JSON.parse(raw); }
      catch (e) { out[k + '_raw'] = raw; }
    });
    return out;
  }
  MY.exportArchive = exportArchive;

  function importArchive(obj) {
    obj = asObject(obj);
    if (!obj) throw new Error('bad');
    var bag = {};
    if (asObject(obj.muyang_v6)) bag[KEY] = asObject(obj.muyang_v6);
    if (asObject(obj.gushi337_v2)) bag.gushi337_v2 = asObject(obj.gushi337_v2);
    if (asObject(obj.gushi337_v1)) bag.gushi337_v1 = asObject(obj.gushi337_v1);
    if (!bag[KEY] && obj.s && typeof obj.s === 'object' && !Array.isArray(obj.s) && (obj.s.coins != null || obj.s.tasks || obj.s.logs)) {
      bag[KEY] = obj.s;
    }
    var looksMain = obj.coins != null || obj.tasks || obj.lawn || obj.ownedPets || obj.petData;
    if (!bag[KEY] && looksMain && !obj.poems) bag[KEY] = obj;
    if (!bag.gushi337_v2 && obj.poems && typeof obj.poems === 'object' && (obj.ver != null || obj.days || obj.xp != null)) {
      bag.gushi337_v2 = obj;
    }
    var keys = Object.keys(bag);
    if (!keys.length) throw new Error('empty');
    keys.forEach(function (k) { localStorage.setItem(k, JSON.stringify(bag[k])); });
    load();
    if (MY.gushi && MY.gushi.reload) MY.gushi.reload();
    return MY.state;
  }
  MY.importArchive = importArchive;

  function tone(freq, dur, gain) {
    if (MY.state && MY.state.system && MY.state.system.sound === false) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = tone.ac || (tone.ac = new Ctx());
      if (ctx.state === 'suspended') ctx.resume();
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(gain || 0.12, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (dur || 0.14));
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + (dur || 0.14) + 0.02);
    } catch (e) { /* 没有音频也不挡住 */ }
  }
  MY.tone = tone;
  MY.ding = function () {
    tone(988, 0.14, 0.14);
    setTimeout(function () { tone(1319, 0.22, 0.11); }, 120);
  };

  load();
})(window.MY = window.MY || {});
