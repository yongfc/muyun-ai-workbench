/* 大餐：从今日进入。点餐 → 三确认 → 番茄钟。走完回到今日。 */
(function (MY) {
  'use strict';

  function isRead(id) { return id === 'zaodu' || id === 'wandu'; }
  function nextDish() {
    return MY.feastList().filter(function (id) { return !MY.taskMap()[id]; })[0] || null;
  }
  function fmt(sec) {
    sec = Math.max(0, sec | 0);
    return Math.floor(sec / 60) + ':' + MY.pad(sec % 60);
  }
  function praise(res) {
    if (!res || !res.ok) return;
    var yl = res.yl ? MY.YL_NAME[res.yl] + ' +1 · ' : '';
    if (MY.toast) MY.toast('叮！「' + res.task.name + '」完成 · ' + yl + '阳光 +' + res.task.reward);
    if (MY.ding) MY.ding();
    if (MY.burst) MY.burst();
    if (res.levels && res.petName && MY.toast) {
      setTimeout(function () { MY.toast(res.petName + ' 升了一级，元力满满'); }, 700);
    }
  }

  var view = {
    step: 'menu',
    minutes: 10,
    remain: 600,
    running: false,
    timer: null,
    armedId: null,
    checks: { desk: false, water: false, toilet: false },

    stop: function () {
      this.running = false;
      if (this.timer) { clearInterval(this.timer); this.timer = null; }
    },
    unmount: function () { this.stop(); },
    setRemain: function (sec) {
      this.remain = sec;
      var el = document.getElementById('pomoTime');
      if (el) el.textContent = fmt(this.remain);
    },
    armFor: function (id) {
      if (this.armedId !== id) {
        this.armedId = id;
        this.remain = this.minutes * 60;
        this.stop();
      }
    },
    tick: function () {
      if (!this.running) return;
      this.remain -= 1;
      if (this.remain < 0) this.remain = 0;
      var el = document.getElementById('pomoTime');
      if (el) el.textContent = fmt(this.remain);
      if (this.remain <= 0) {
        this.stop();
        this.finishCurrent();
      }
    },
    finishCurrent: function () {
      var id = nextDish();
      if (!id || isRead(id)) { MY.render(); return; }
      var res = MY.completeTask(id);
      if (res.ok && MY.state.activePet) res.petName = (MY.petById(MY.state.activePet) || {}).name;
      praise(res);
      this.continueNext();
      MY.render();
    },
    continueNext: function () {
      var id = nextDish();
      if (!id) { this.step = 'done'; this.stop(); return; }
      this.step = 'work';
      if (!isRead(id)) this.armFor(id);
    },

    render: function () {
      var title = this.step === 'confirm' ? '开工确认' : (this.step === 'work' ? '番茄钟' : (this.step === 'done' ? '大餐完成' : '点餐'));
      var html = '<div class="flow-top"><button type="button" class="back" data-act="feast-exit">← 回到今日</button><div class="flow-title">' + title + '</div></div>';
      if (this.step === 'confirm') html += this.confirmHtml();
      else if (this.step === 'work') html += this.workHtml();
      else if (this.step === 'done') html += this.doneHtml();
      else html += this.menuHtml();
      return html;
    },

    menuHtml: function () {
      var tasks = MY.taskMap();
      var feast = MY.feastList();
      var shortName = { must: '招牌', veg: '时蔬', snack: '小食' };
      var html = '<div class="order-screen"><div class="order-layout"><nav class="order-nav">';
      MY.TASK_GROUPS.forEach(function (g) {
        html += '<button type="button" data-act="jump-group" data-group="' + g.key + '"><span>' + g.icon + '</span>' + (shortName[g.key] || '') + '</button>';
      });
      html += '</nav><div class="order-list">';
      MY.TASK_GROUPS.forEach(function (g) {
        html += '<h2 class="order-sec" id="group-' + g.key + '">' + MY.GROUP_TITLES[g.key] + '</h2><div class="order-grid">';
        g.tasks.forEach(function (t) {
          var done = !!tasks[t.id];
          var on = !done && feast.indexOf(t.id) >= 0;
          html += '<button type="button" class="menu-card' + (done ? ' done' : '') + (on ? ' on' : '') + '" data-act="toggle-dish" data-id="' + t.id + '">';
          html += '<span class="menu-ico" style="background:' + g.bg + '">' + g.icon + '</span>';
          html += '<span class="menu-main"><b>' + MY.esc(t.dish) + '</b><span class="menu-task">' + MY.esc(t.name) + '</span><span class="menu-meta">' + MY.esc(t.meta) + '</span></span>';
          html += '<span class="menu-side"><span class="menu-price"><b>' + t.reward + '</b><small>阳光</small></span>';
          html += '<span class="menu-qty">' + (done ? '吃完' : (on ? '1' : '+')) + '</span></span></button>';
        });
        html += '</div>';
      });
      html += '</div></div>';
      var picked = feast.filter(function (id) { return !tasks[id]; });
      var sum = 0;
      var names = [];
      picked.forEach(function (id) {
        var t = MY.taskById(id);
        if (!t) return;
        sum += t.reward;
        names.push(t.dish);
      });
      var label = '先点几道菜';
      var disabled = !feast.length;
      if (feast.length && !MY.state.confirmed) label = '确认下单';
      else if (picked.length) label = '开始做菜';
      else if (feast.length) label = '今天的菜吃完啦';
      html += '<div class="cart-bar"><div class="cart-info"><b>已点 ' + picked.length + ' 道</b>';
      html += '<span>' + (names.length ? MY.esc(names.join('、')) : '还没点菜，点喜欢的菜加入今日大餐~') + '</span>';
      html += '<em>阳光 +' + sum + '</em></div>';
      html += '<button type="button" class="btn-main cart-go" data-act="feast-next"' + (disabled ? ' disabled' : '') + '>' + label + '</button></div></div>';
      return html;
    },

    confirmHtml: function () {
      var self = this;
      var items = [
        ['desk', '🧹 桌面收拾干净了'],
        ['water', '💧 喝好水了'],
        ['toilet', '🚽 上厕所了']
      ];
      var html = '<section class="card confirm-card"><h2>准备开始啦！</h2>';
      html += '<p class="lead">菜点好了，开工前再确认三件事都做好了哦~</p>';
      items.forEach(function (it) {
        var on = !!self.checks[it[0]];
        html += '<button type="button" class="ck' + (on ? ' on' : '') + '" data-act="ck" data-k="' + it[0] + '" aria-pressed="' + (on ? 'true' : 'false') + '">';
        html += '<span class="box">' + (on ? '✓' : '') + '</span><span>' + it[1] + '</span></button>';
      });
      var ready = self.checks.desk && self.checks.water && self.checks.toilet;
      html += '<button type="button" class="btn-main" data-act="confirm-go"' + (ready ? '' : ' disabled') + '>' +
        (ready ? '太好了，开始做菜！' : '还有没做完的哦~') + '</button></section>';
      return html;
    },

    workHtml: function () {
      var id = nextDish();
      if (!id) { this.step = 'done'; return this.doneHtml(); }
      var t = MY.taskById(id);
      if (!t) { this.step = 'done'; return this.doneHtml(); }
      if (isRead(id)) {
        return '<section class="card work-card"><div class="kicker">这道菜在晨读</div><h2>' + MY.esc(t.name) + '</h2>' +
          '<p class="lead">🥘 ' + MY.esc(t.dish) + '</p>' +
          '<p>背完今天的卡组，这道菜就算吃完，阳光会记上。</p>' +
          '<button type="button" class="btn-main" data-act="go-read" data-id="' + id + '">去晨读</button>' +
          '<button type="button" class="btn-ghost" data-act="feast-back-menu">先回菜单</button></section>';
      }
      this.armFor(id);
      var self = this;
      var html = '<section class="card work-card">';
      html += '<div class="kicker" id="pomoTaskName">🍅 ' + MY.esc(t.name) + ' · ' + MY.esc(t.dish) + '</div>';
      html += '<div class="pomo-time" id="pomoTime">' + fmt(this.remain) + '</div>';
      html += '<p class="fine">慢慢做，做完这道菜就有 ' + t.reward + ' 阳光。</p>';
      html += '<div class="dur">';
      [5, 10, 15, 25].forEach(function (m) {
        html += '<button type="button" class="' + (self.minutes === m ? 'on' : '') + '" data-act="pomo-min" data-min="' + m + '">' + m + '分</button>';
      });
      html += '</div>';
      html += '<div class="row2">';
      html += '<button type="button" class="btn-ghost" data-act="pomo-skip">这道先放放</button>';
      html += '<button type="button" class="' + (this.running ? 'btn-stop' : 'btn-main') + '" data-act="pomo-toggle">' + (this.running ? '暂停' : '开始') + '</button>';
      html += '</div></section>';
      return html;
    },

    doneHtml: function () {
      var got = MY.ALL_TASKS.filter(function (t) { return !!MY.taskMap()[t.id]; }).reduce(function (s, t) { return s + t.reward; }, 0);
      return '<section class="card cele"><div class="cele-big">🎉</div><h2>大餐完成！</h2>' +
        '<p class="lead">牧橒今天的大餐全吃完啦！</p>' +
        '<p>元力满满！这就是人生设计师的一天。</p>' +
        '<p class="fine">今天已经记下 ' + got + ' 阳光 · 现在一共 ' + MY.coins() + ' 阳光</p>' +
        '<button type="button" class="btn-main" data-act="feast-exit">回到今日</button></section>';
    },

    act: {
      'feast-exit': function () {
        view.stop();
        view.step = 'menu';
        MY.go('today');
      },
      'toggle-dish': function (el) {
        var id = el.dataset.id;
        if (!Array.isArray(MY.state.feast)) MY.state.feast = [];
        if (MY.taskMap()[id]) {
          MY.toast('这道菜今天已经吃过啦');
          return;
        }
        var i = MY.state.feast.indexOf(id);
        if (i >= 0) MY.state.feast.splice(i, 1);
        else MY.state.feast.push(id);
        MY.save();
        MY.render();
      },
      'feast-next': function () {
        if (!MY.feastList().length) return;
        var undone = MY.feastList().filter(function (id) { return !MY.taskMap()[id]; });
        if (!MY.state.confirmed) {
          view.checks = { desk: false, water: false, toilet: false };
          view.step = 'confirm';
          MY.render();
          return;
        }
        if (!undone.length) { view.step = 'done'; MY.render(); return; }
        view.step = 'work';
        MY.render();
      },
      ck: function (el) {
        var k = el.dataset.k;
        view.checks[k] = !view.checks[k];
        MY.render();
      },
      'confirm-go': function () {
        if (!(view.checks.desk && view.checks.water && view.checks.toilet)) return;
        MY.state.confirmed = true;
        MY.save();
        if (MY.ding) MY.ding();
        MY.toast('准备就绪，开吃今天的菜');
        var id = nextDish();
        view.step = id ? 'work' : 'done';
        MY.render();
      },
      'pomo-min': function (el) {
        var m = +el.dataset.min;
        if (!m) return;
        view.minutes = m;
        view.remain = m * 60;
        view.stop();
        MY.render();
      },
      'pomo-toggle': function () {
        if (view.running) { view.stop(); MY.render(); return; }
        view.running = true;
        view.timer = setInterval(function () { view.tick(); }, 1000);
        MY.render();
      },
      'pomo-skip': function () {
        view.stop();
        view.step = 'menu';
        MY.render();
      },
      'feast-back-menu': function () {
        view.stop();
        view.step = 'menu';
        MY.render();
      },
      'jump-group': function (el) {
        var node = document.getElementById('group-' + el.dataset.group);
        if (node) node.scrollIntoView({ block: 'start' });
      },
      'go-read': function (el) {
        var id = el.dataset.id || nextDish();
        if (MY.gushi.todayDone()) {
          var res = MY.completeTask(id);
          praise(res);
          view.continueNext();
          MY.render();
          return;
        }
        MY.pendingRecite = id;
        MY.views.morning.auto = true;
        MY.go('morning');
      }
    }
  };

  MY.views = MY.views || {};
  MY.views.feast = view;
})(window.MY = window.MY || {});
