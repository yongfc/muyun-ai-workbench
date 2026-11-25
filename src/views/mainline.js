/* 主线：人生主线、军规、难题五步、周六复盘、成长记录、能力雷达。 */
(function (MY) {
  'use strict';

  var TABS = [
    ['mainline', '主线'],
    ['rules', '军规'],
    ['workflow', '五步'],
    ['review', '复盘'],
    ['log', '记录'],
    ['radar', '雷达']
  ];

  function isReviewTime(d) {
    d = d || new Date();
    return d.getDay() === 6 && d.getHours() >= 18;
  }
  function weekKey(d) {
    d = d || new Date();
    var day = (d.getDay() + 6) % 7;
    var m = new Date(d);
    m.setDate(d.getDate() - day);
    return MY.ymd(m);
  }
  function radarSVG(vals) {
    var cx = 150, cy = 132, r = 88, n = vals.length;
    function pt(i, scale) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [cx + Math.cos(ang) * r * scale, cy + Math.sin(ang) * r * scale];
    }
    var rings = [0.25, 0.5, 0.75, 1].map(function (s) {
      var d = [];
      for (var i = 0; i < n; i++) {
        var p = pt(i, s);
        d.push((i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1));
      }
      return '<path d="' + d.join(' ') + ' Z" fill="none" stroke="rgba(62,230,255,.28)"/>';
    }).join('');
    var axes = '';
    for (var i = 0; i < n; i++) {
      var p = pt(i, 1);
      axes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="rgba(167,139,250,.45)"/>';
    }
    var poly = vals.map(function (v, i) {
      var p = pt(i, v / 100);
      return p[0].toFixed(1) + ',' + p[1].toFixed(1);
    }).join(' ');
    return '<svg class="radar" viewBox="0 0 300 270" role="img" aria-label="能力雷达">' + rings + axes +
      '<polygon points="' + poly + '" fill="rgba(62,230,255,.28)" stroke="#3ee6ff" stroke-width="2"/></svg>';
  }

  var view = {
    tab: 'mainline',
    linkOpen: false,
    render: function () {
      var html = '<div class="seg wrap-seg">';
      TABS.forEach(function (t) {
        html += '<button type="button" class="' + (view.tab === t[0] ? 'on' : '') + '" data-act="tab" data-tab="' + t[0] + '">' + t[1] + '</button>';
      });
      html += '</div>';
      if (this.tab === 'rules') html += rulesHtml();
      else if (this.tab === 'workflow') html += wfHtml();
      else if (this.tab === 'review') html += reviewHtml();
      else if (this.tab === 'log') html += logHtml();
      else if (this.tab === 'radar') html += radarHtml();
      else html += mainHtml();
      var soundOn = MY.state.system.sound !== false;
      html += '<button type="button" class="link-quiet" data-act="sound-toggle">' + (soundOn ? '音效：开' : '音效：关') + '</button>';
      return html;
    }
  };

  function mainHtml() {
    var sys = MY.state.system;
    var ml = sys.mainline;
    var total = (sys.yuanli.life || 0) + (sys.yuanli.drive || 0) + (sys.yuanli.learn || 0);
    var lv = 1 + Math.floor(total / 300);
    var pct = Math.min(100, Math.round((total % 300) / 300 * 100));
    var html = '<section class="card">';
    html += '<div class="kicker">我的主线 · 系统 ' + MY.esc(sys.version || 'v1.0') + '</div>';
    html += '<h1>' + MY.esc(ml.title || '人生设计师') + '</h1>';
    html += '<p class="decl">' + MY.nl(ml.declaration || MY.DECLARATION) + '</p>';
    html += '<p class="fine">主线确立于 ' + MY.esc(ml.since || '') + '</p>';
    ['life', 'drive', 'learn'].forEach(function (k) {
      html += '<div class="ml-bar"><span style="color:' + MY.YL_COLOR[k] + '">' + MY.YL_NAME[k] + '</span>';
      html += '<i><b style="width:' + Math.min(100, (sys.yuanli[k] || 0) / 3) + '%;background:' + MY.YL_COLOR[k] + '"></b></i>';
      html += '<em style="color:' + MY.YL_COLOR[k] + '">' + (sys.yuanli[k] || 0) + '</em></div>';
    });
    html += '<div class="bar lv"><i style="width:' + pct + '%"></i></div>';
    html += '<p class="fine">主线里程 Lv.' + lv + ' · 元力 ' + total + ' · 距下一级 ' + (300 - (total % 300)) + '</p>';
    html += '<button type="button" class="btn-main" data-act="link-toggle">' + (view.linkOpen ? '收起梦想连线' : '今日梦想连线') + '</button>';
    html += '<button type="button" class="btn-ghost" data-act="publish">叮！任务发布</button>';
    html += '</section>';
    if (view.linkOpen) html += linkHtml();
    if (view.publishing) html += publishHtml();
    return html;
  }

  function linkHtml() {
    var tasks = MY.taskMap();
    var doneIds = Object.keys(tasks).filter(function (id) { return tasks[id] && MY.YL[id]; });
    var allIds = MY.ALL_TASKS.map(function (t) { return t.id; }).filter(function (id) { return MY.YL[id]; });
    var missed = allIds.filter(function (id) { return !tasks[id]; });
    var yl = { life: 0, drive: 0, learn: 0 };
    var html = '<section class="card">';
    html += '<div class="kicker">今日梦想连线 · ' + MY.ymd(new Date()) + '</div>';
    html += '<p class="lead">今天做的这些，跟「人生设计师」有什么关系？</p>';
    if (!doneIds.length) html += '<p>今天还没打卡，先去看看今天的菜谱吧。</p>';
    doneIds.forEach(function (id) {
      var m = MY.YL[id];
      yl[m[0]] += 1;
      var task = MY.taskById(id);
      html += '<div class="link-row"><span class="tag" style="color:' + MY.YL_COLOR[m[0]] + '">' + MY.YL_NAME[m[0]] + '</span>';
      html += '<div><b>' + MY.esc(task ? task.name : id) + '</b><small>' + MY.esc(m[1]) + '</small></div></div>';
    });
    if (missed.length) {
      var cheer = MY.CHEER[new Date().getDate() % MY.CHEER.length];
      html += '<p class="note">还有 ' + missed.length + ' 道菜没上桌<br>' + missed.map(function (id) {
        var t = MY.taskById(id); return MY.esc(t ? t.name : id);
      }).join(' · ') + '</p>';
      html += '<p>' + MY.esc(cheer) + '</p>';
    } else {
      html += '<p class="lead">今天的菜全上齐了。元力满满！这就是人生设计师的一天。</p>';
    }
    html += '<p class="fine">这一屏是在看关系，元力在完成菜的时候已经记下了。</p>';
    html += '</section>';
    return html;
  }

  function publishHtml() {
    var feast = MY.feastList();
    var list = feast.length
      ? feast.map(function (id) { var t = MY.taskById(id); return t ? t.name : id; }).join(' · ')
      : '今天还没点菜，去今日大餐挑喜欢的菜';
    return '<section class="card"><div class="kicker">叮！任务发布</div>' +
      '<p>人生设计师 · 第 ' + (MY.state.system.vnum || 1) + ' 版系统</p>' +
      '<p class="lead">' + MY.esc(list) + '</p>' +
      '<p class="fine">做完一件，回来领一次「叮！奖励到账」。</p></section>';
  }

  function rulesHtml() {
    var rules = MY.state.system.rules || [];
    var html = '<section class="card"><div class="kicker">我的军规</div>';
    html += '<h1>有所为，有所不为</h1>';
    html += '<p class="fine">前三条是陈咏拟的草稿，等牧橒口述后修订。军规是筛选器，选择就不费力。</p>';
    rules.forEach(function (r, i) {
      html += '<div class="rule"><span class="no">' + (i + 1) + '</span><span>' + MY.esc(r.text) + '</span>';
      html += r.draft ? '<em>待牧橒口述修订</em>' : '<em>' + MY.esc(r.by || '') + ' 定</em>';
      html += '<button type="button" class="x" data-act="rule-del" data-id="' + MY.esc(r.id) + '" aria-label="去掉这条">×</button></div>';
    });
    html += '<div class="row-add"><input id="ruleInput" maxlength="24" placeholder="牧橒说一条，加进来">';
    html += '<button type="button" class="btn-main slim" data-act="rule-add">立为军规</button></div></section>';
    return html;
  }

  function wfHtml() {
    var w = MY.state.system.workflow;
    var html = '<section class="card"><div class="kicker">难题五步闯关</div>';
    if (!w) {
      html += '<h1>遇到难题走这五步</h1>';
      html += '<p>每走一步领阳光，最后得到一张经验卡。<br>人生设计师不靠灵感，靠流程。</p>';
      html += '<button type="button" class="btn-main" data-act="wf-new">开始一个难题</button></section>';
    } else if (w.done) {
      html += '<h1>这个难题已经走完了</h1><p class="lead">' + MY.esc(w.title) + '</p>';
      html += '<button type="button" class="btn-main" data-act="wf-new">再来一个难题</button></section>';
    } else {
      var st = MY.WF_STEPS[w.step];
      html += '<p class="fine">第 ' + (w.step + 1) + ' / 5 步</p><div class="chips">';
      MY.WF_STEPS.forEach(function (s, i) {
        html += '<span class="' + (i < w.step ? 'hit' : '') + (i === w.step ? ' now' : '') + '">' + (i < w.step ? '✓ ' : '') + s.n + '</span>';
      });
      html += '</div><h2>' + MY.esc(st.n) + '</h2><p>' + MY.esc(st.tip) + '</p>';
      if (w.step === 0) html += '<input id="wfInput" maxlength="40" placeholder="我遇到的难题是……">';
      else html += '<textarea id="wfInput" rows="3" placeholder="' + MY.esc(st.tip) + '"></textarea>';
      html += '<button type="button" class="btn-main" data-act="wf-next">走这一步 · 领 ' + st.c + ' 阳光</button></section>';
    }
    var cards = MY.state.system.cards || [];
    html += '<section class="card"><div class="kicker">我的经验卡 · ' + cards.length + '</div>';
    if (!cards.length) html += '<p>还没有经验卡。走完一次五步闯关，这里会出现你的第一张。</p>';
    cards.forEach(function (c) {
      html += '<article class="exp"><b>' + MY.esc(c.title) + '</b><p>' + MY.nl(c.body || '') + '</p><small>' + MY.esc(c.date || '') + '</small></article>';
    });
    html += '</section>';
    return html;
  }

  function reviewHtml() {
    var sys = MY.state.system;
    var key = weekKey();
    var done = (sys.reviews || []).filter(function (r) { return r.week === key; })[0];
    var html = '<section class="card"><div class="kicker">每周复盘卡 · 周六晚饭后</div>';
    if (done) {
      html += '<h1>本周复盘已完成</h1>';
      html += '<p>牧橒签字：' + MY.esc(done.signKid) + '<br>陈咏签字：' + MY.esc(done.signDad) + '</p>';
      html += '<p class="fine">系统已升级到 ' + MY.esc(done.after) + '</p>';
    } else if (!isReviewTime()) {
      var d = new Date();
      var left = (6 - d.getDay() + 7) % 7;
      html += '<h1>本周复盘 · 周六晚饭后开启</h1>';
      html += '<p>' + (left === 0 ? '今天就是周六，吃完晚饭再来' : '还有 ' + left + ' 天') + '</p>';
      html += '<p class="fine">复盘要一家人坐下来，慢慢说。</p>';
    } else {
      html += '<label class="q">1 · 这周我做对了什么？<textarea id="rvA" rows="2"></textarea></label>';
      html += '<label class="q">2 · 什么花了时间但没用？<textarea id="rvB" rows="2"></textarea></label>';
      html += '<label class="q">3 · 下次怎么改？<textarea id="rvC" rows="2"></textarea></label>';
      html += '<label class="q">4 · 沉淀成哪条经验？<textarea id="rvD" rows="2"></textarea></label>';
      html += '<div class="row2"><label class="q">牧橒签字<input id="rvK" maxlength="10"></label>';
      html += '<label class="q">陈咏签字<input id="rvD2" maxlength="10"></label></div>';
      html += '<button type="button" class="btn-main" data-act="rv-save">签字 · 升级系统</button>';
    }
    html += '</section>';
    if (sys.reviews && sys.reviews.length) {
      html += '<section class="card"><div class="kicker">复盘记录</div>';
      sys.reviews.forEach(function (r) {
        html += '<p><b>' + MY.esc(r.week) + '</b> ' + MY.esc(r.a || '') + ' <span class="fine">' + MY.esc(r.before) + ' → ' + MY.esc(r.after) + '</span></p>';
      });
      html += '</section>';
    }
    var patches = (sys.patches || []).slice().reverse();
    html += '<section class="card"><div class="kicker">系统升级日志 · 当前 ' + MY.esc(sys.version || '') + '</div>';
    patches.forEach(function (p) {
      html += '<p class="patch"><b>' + MY.esc(p.v) + '</b> ' + MY.esc(p.note) + ' <span class="fine">' + MY.esc(p.date || '') + '</span></p>';
    });
    html += '<p class="fine">体系不是石碑，是导航。过时的删掉，新的补上。</p></section>';
    return html;
  }

  function logHtml() {
    var list = MY.logs();
    var html = '<section class="card"><div class="kicker">成长记录</div>';
    if (!list.length) html += '<p>还没有记录，完成第一道菜就会写在这里。</p>';
    list.forEach(function (l) {
      html += '<p class="log"><span>' + MY.esc(l && l.time) + '</span>' + MY.esc(l && l.text) + '</p>';
    });
    html += '</section>';
    return html;
  }

  function radarHtml() {
    var vals = MY.radarVals();
    var html = '<section class="card"><div class="kicker">能力雷达</div>';
    html += radarSVG(vals);
    html += '<div class="radar-list">';
    MY.CORE_ATTRS.forEach(function (a, i) {
      html += '<p>' + a.icon + ' <b>' + MY.esc(a.key) + '</b> ' + MY.esc(a.desc) + '<em>' + vals[i] + '</em></p>';
    });
    html += '</div></section>';
    return html;
  }

  view.act = {
    tab: function (el) { view.tab = el.dataset.tab || 'mainline'; MY.render(); },
    'link-toggle': function () { view.linkOpen = !view.linkOpen; MY.render(); },
    publish: function () { view.publishing = !view.publishing; MY.render(); },
    'sound-toggle': function () {
      MY.state.system.sound = MY.state.system.sound === false;
      MY.save();
      if (MY.state.system.sound !== false && MY.ding) MY.ding();
      MY.render();
    },
    'rule-add': function () {
      var inp = document.getElementById('ruleInput');
      var v = inp ? inp.value.trim() : '';
      if (!v) { MY.toast('先说一句，再立规'); return; }
      if (!Array.isArray(MY.state.system.rules)) MY.state.system.rules = [];
      MY.state.system.rules.push({ id: 'r' + Date.now(), text: v.slice(0, 24), by: '牧橒', date: MY.ymd(new Date()) });
      MY.save();
      MY.toast('军规 +1 · 这是牧橒自己定的');
      if (MY.ding) MY.ding();
      MY.render();
    },
    'rule-del': function (el) {
      MY.state.system.rules = (MY.state.system.rules || []).filter(function (r) { return r.id !== el.dataset.id; });
      MY.save();
      MY.render();
    },
    'wf-new': function () {
      MY.state.system.workflow = { title: '', step: 0, vals: {}, date: MY.ymd(new Date()), done: false };
      MY.save();
      MY.render();
    },
    'wf-next': function () {
      var w = MY.state.system.workflow;
      if (!w || w.done) return;
      var inp = document.getElementById('wfInput');
      var v = inp ? inp.value.trim() : '';
      if (!v) { MY.toast('写一句再走，设计师不跳步'); return; }
      var st = MY.WF_STEPS[w.step];
      if (w.step === 0) w.title = v;
      if (!w.vals || typeof w.vals !== 'object') w.vals = {};
      w.vals[st.k] = v;
      MY.state.coins = MY.coins() + st.c;
      MY.addLog('五步闯关「' + st.n + '」+' + st.c + ' 阳光');
      w.step += 1;
      if (w.step >= MY.WF_STEPS.length) {
        w.done = true;
        if (!Array.isArray(MY.state.system.cards)) MY.state.system.cards = [];
        MY.state.system.cards.unshift({ title: w.title, body: w.vals.keep || '', date: MY.ymd(new Date()) });
        if (!Array.isArray(MY.state.system.patches)) MY.state.system.patches = [];
        MY.state.system.patches.push({ v: MY.state.system.version, date: MY.ymd(new Date()), note: '新增经验卡：' + w.title });
        MY.toast('叮！等级提升 · 五步走完，经验卡到手');
        if (MY.ding) MY.ding();
        if (MY.burst) MY.burst();
      } else {
        if (MY.tone) MY.tone(660, 0.09, 0.12);
        MY.toast('叮！第 ' + w.step + ' 步完成 · +' + st.c + ' 阳光');
      }
      MY.save();
      MY.render();
    },
    'rv-save': function () {
      var a = document.getElementById('rvA');
      var b = document.getElementById('rvB');
      var c = document.getElementById('rvC');
      var d = document.getElementById('rvD');
      var k = document.getElementById('rvK');
      var p = document.getElementById('rvD2');
      if (!a || !a.value.trim() || !k || !k.value.trim() || !p || !p.value.trim()) {
        MY.toast('三个签字和填空都要有，复盘才算数');
        return;
      }
      var sys = MY.state.system;
      var before = sys.version;
      sys.vnum = (sys.vnum || 1) + 1;
      sys.version = 'v1.' + (sys.vnum - 1);
      if (!Array.isArray(sys.reviews)) sys.reviews = [];
      var rec = {
        week: weekKey(), date: MY.ymd(new Date()),
        a: a.value.trim(), b: b ? b.value.trim() : '', c: c ? c.value.trim() : '', d: d ? d.value.trim() : '',
        signKid: k.value.trim(), signDad: p.value.trim(), before: before, after: sys.version
      };
      sys.reviews.unshift(rec);
      if (!Array.isArray(sys.patches)) sys.patches = [];
      sys.patches.push({ v: sys.version, date: rec.date, note: '周复盘升级：' + rec.c });
      MY.save();
      MY.toast('复盘完成 · 系统升级到 ' + sys.version);
      if (MY.ding) MY.ding();
      if (MY.burst) MY.burst();
      MY.render();
    }
  };

  MY.views = MY.views || {};
  MY.views.mainline = view;
})(window.MY = window.MY || {});
