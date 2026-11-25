/* 今日：人生设计师的工作室控制台。作品墙是主体。 */
(function (MY) {
  'use strict';

  var WEEK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  function dailyPoem() {
    var doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 864e5);
    return MY.POEMS[doy % MY.POEMS.length];
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clockText(now) {
    return pad(now.getHours()) + ':' + pad(now.getMinutes());
  }
  function dateText(now) {
    return WEEK[now.getDay()] + ' ' + (now.getMonth() + 1) + '月' + now.getDate() + '日';
  }
  function reviewDue(now) {
    return now.getDay() === 6 && now.getHours() >= 18;
  }
  function focusLine(now) {
    var tasks = MY.taskMap();
    var feast = MY.feastList();
    var classes = MY.todayClasses(now);
    var current = null;
    classes.list.forEach(function (row) { if (row.state === 'now') current = row; });
    if (current && current.subject) return '现在是第 ' + current.n + ' 节 · ' + current.subject;
    var undone = feast.filter(function (id) { return !tasks[id]; });
    if (undone.length) {
      var t = MY.taskById(undone[0]);
      return t ? '先完成「' + t.name + '」' : '先把进行中的作品做完';
    }
    var doneN = MY.ALL_TASKS.filter(function (t) { return !!tasks[t.id]; }).length;
    if (!feast.length && !doneN) return '先决定今天要完成哪几件作品';
    if (doneN >= MY.ALL_TASKS.length) return '今天的作品都完成了';
    return '接着把剩下的作品做完';
  }
  function nextLabel() {
    var tasks = MY.taskMap();
    var feast = MY.feastList();
    var doneN = MY.ALL_TASKS.filter(function (t) { return !!tasks[t.id]; }).length;
    if (!feast.length && !doneN) return '开始大餐';
    if (doneN >= MY.ALL_TASKS.length) return '今天完成了';
    return '继续';
  }
  function paintLive(now) {
    now = now || new Date();
    var clock = document.getElementById('studio-clock');
    var date = document.getElementById('studio-date');
    if (clock) clock.textContent = clockText(now);
    if (date) date.textContent = dateText(now);
    var curMin = now.getHours() * 60 + now.getMinutes();
    var rows = document.querySelectorAll('.period');
    Array.prototype.forEach.call(rows, function (row) {
      var start = +row.getAttribute('data-start');
      var end = +row.getAttribute('data-end');
      var state = curMin >= end ? 'past' : (curMin >= start ? 'now' : 'later');
      row.classList.toggle('past', state === 'past');
      row.classList.toggle('now', state === 'now');
      var mark = row.querySelector('.period-mark');
      if (mark) mark.textContent = state === 'now' ? '正在上' : (state === 'past' ? '已过' : '');
    });
  }

  MY.views = MY.views || {};
  MY.views.today = {
    _clock: null,
    mount: function () {
      var self = this;
      paintLive(new Date());
      if (this._clock) return;
      this._clock = setInterval(function () {
        if (!document.getElementById('studio-clock')) { self.unmount(); return; }
        paintLive(new Date());
      }, 1000);
    },
    unmount: function () {
      if (this._clock) clearInterval(this._clock);
      this._clock = null;
    },
    render: function () {
      var now = new Date();
      var tasks = MY.taskMap();
      var feast = MY.feastList();
      var poem = dailyPoem();
      var gs = MY.gushi.stats();
      var deckPoem = gs.deck && gs.deck.length ? MY.gushi.poem(gs.deck[0]) : poem;
      var classes = MY.todayClasses(now);
      var pet = MY.petById(MY.state.activePet);
      var petLevel = pet ? MY.getPetData(pet.id).level : 1;
      var yl = (MY.state.system && MY.state.system.yuanli) || { life: 0, drive: 0, learn: 0 };
      var ylSum = (yl.life || 0) + (yl.drive || 0) + (yl.learn || 0);
      var html = '<div class="studio">';

      html += '<section class="studio-id">';
      html += '<div class="studio-when"><b id="studio-clock">' + clockText(now) + '</b><span id="studio-date">' + dateText(now) + '</span></div>';
      html += '<p class="studio-who">我是陈牧橒，人生设计师。</p>';
      html += '<p class="studio-focus">' + MY.esc(focusLine(now)) + '</p>';
      html += '<div class="studio-stats"><span><b>' + MY.coins() + '</b>阳光</span><span><b>' + (MY.state.streak || 1) + '</b>天连续</span></div>';
      if (ylSum > 0) html += '<p class="studio-yl">元力 ' + ylSum + '</p>';
      html += '</section>';

      html += '<section class="wall" aria-label="今日作品墙">';
      MY.ALL_TASKS.forEach(function (t) {
        var done = !!tasks[t.id];
        var doing = !done && feast.indexOf(t.id) >= 0;
        var cls = done ? 'done' : (doing ? 'doing' : 'todo');
        var label = done ? '已完成' : (doing ? '进行中' : '未点');
        html += '<div class="work ' + cls + '"><b>' + MY.esc(t.name) + '</b><small>' + label + '</small></div>';
      });
      html += '</section>';

      html += '<aside class="studio-side">';
      html += '<section class="side-card schedule">';
      html += '<div class="kicker">' + WEEK[classes.day] + '课表</div>';
      if (!classes.inSchool) {
        html += '<p class="side-empty">今天没有校内课。</p>';
      } else {
        classes.list.forEach(function (row) {
          var start = row.start.split(':');
          var end = row.end.split(':');
          var smin = (+start[0]) * 60 + (+start[1]);
          var emin = (+end[0]) * 60 + (+end[1]);
          html += '<div class="period ' + row.state + '" data-start="' + smin + '" data-end="' + emin + '">';
          html += '<b>第' + row.n + '节</b><span>' + MY.esc(row.subject) + '</span>';
          html += '<em>' + row.start + '–' + row.end + '</em>';
          html += '<i class="period-mark">' + (row.state === 'now' ? '正在上' : (row.state === 'past' ? '已过' : '')) + '</i>';
          html += '</div>';
        });
      }
      html += '<p class="schedule-note">' + MY.esc(classes.note) + '</p>';
      html += '</section>';
      html += '<section class="side-card mini">';
      html += '<p><b>晨读</b> ' + (gs.todayDone ? '今天已复习' : '今天先背《' + MY.esc(deckPoem ? deckPoem.title : '') + '》') + '</p>';
      html += '<p class="poem-bit">' + MY.esc(poem.lines[0] || '') + ' <span>—— ' + MY.esc(poem.title) + '</span></p>';
      html += '<p class="pet-bit">' + (pet ? MY.petSVG(pet.id, petLevel) : MY.petSVG('panda', 1));
      html += '<span>' + (pet ? MY.esc(pet.name) + ' 在工作室' : '还没选工作室伙伴') + '</span></p>';
      html += '</section>';
      if (reviewDue(now)) {
        html += '<section class="side-card review"><p>周六复盘到点了</p><button type="button" class="text-btn" data-act="open-review">去签字</button></section>';
      }
      html += '<button type="button" class="btn-main studio-go" data-act="open-feast">' + nextLabel() + '</button>';
      html += '<button type="button" class="board-parent" data-go="parent">家长看看</button>';
      html += '</aside></div>';
      return html;
    },
    act: {
      'open-feast': function () {
        MY.views.feast.step = 'menu';
        MY.go('feast');
      },
      'open-review': function () {
        if (MY.views.mainline) MY.views.mainline.tab = 'review';
        MY.go('mainline');
      }
    }
  };
})(window.MY = window.MY || {});
