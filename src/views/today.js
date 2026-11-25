/* 今日：一屏信息大屏。长诗在晨读看全文，这里只留一句。 */
(function (MY) {
  'use strict';

  function dailyPoem() {
    var doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 864e5);
    return MY.POEMS[doy % MY.POEMS.length];
  }

  MY.views = MY.views || {};
  MY.views.today = {
    render: function () {
      var sys = MY.state.system || {};
      var ml = sys.mainline || {};
      var yl = sys.yuanli || { life: 0, drive: 0, learn: 0 };
      var age = MY.age();
      var poem = dailyPoem();
      var tasks = MY.taskMap();
      var feast = MY.feastList();
      var undone = feast.filter(function (id) { return !tasks[id]; });
      var doneN = MY.ALL_TASKS.filter(function (t) { return !!tasks[t.id]; }).length;
      var total = MY.ALL_TASKS.length;
      var pct = total ? Math.round(doneN / total * 100) : 0;
      var gs = MY.gushi.stats();
      var line = ((ml.declaration || MY.DECLARATION).split('\n')[0]) || '我是陈牧橒，人生设计师。';
      var btn = !feast.length ? '开始大餐' : (undone.length ? '继续大餐 · 还剩 ' + undone.length + ' 道' : '看看今天的菜单');
      var remain = !feast.length
        ? '还没点菜 · 13 道都在菜单里'
        : (!undone.length
          ? '今天点过的菜都吃完了'
          : '还剩 ' + undone.map(function (id) {
            var t = MY.taskById(id);
            return t ? t.dish : '';
          }).filter(Boolean).join('、'));
      var html = '<div class="board">';
      html += '<section class="tile hero">';
      html += '<div><div class="kicker">我的主线</div><h1>' + MY.esc(ml.title || '人生设计师') + '</h1>';
      html += '<p>' + MY.esc(line) + '</p></div>';
      html += '<div class="streak"><b>' + (MY.state.streak || 1) + '</b><span>连续打卡</span><small>' + age.years + '岁 · 新营四年级</small></div>';
      html += '</section>';
      html += '<section class="tile metrics">';
      ['life', 'drive', 'learn'].forEach(function (k) {
        html += '<div class="metric" style="--c:' + MY.YL_COLOR[k] + '"><b>' + (yl[k] || 0) + '</b><span>' + MY.YL_NAME[k] + '</span></div>';
      });
      html += '<div class="metric sun"><b>' + MY.coins() + '</b><span>阳光</span></div>';
      html += '</section>';
      html += '<section class="tile progress">';
      html += '<div class="prog-top"><span>今日任务</span><b>' + doneN + ' / ' + total + '</b></div>';
      html += '<div class="bar"><i style="width:' + pct + '%"></i></div>';
      html += '<div class="dots">';
      MY.ALL_TASKS.forEach(function (t) {
        var cls = tasks[t.id] ? 'done' : (feast.indexOf(t.id) >= 0 ? 'picked' : '');
        html += '<i class="' + cls + '" title="' + MY.esc(t.dish) + '"></i>';
      });
      html += '</div>';
      html += '<p class="remain-line">' + MY.esc(remain) + '</p>';
      html += '<p class="gushi-line">' + (gs.todayDone
        ? '晨读已打卡 · 掌握 ' + gs.mastered + '/25'
        : '晨读待背 ' + gs.deck.length + ' 首 · 掌握 ' + gs.mastered + '/25') +
        ' <button type="button" class="text-btn" data-go="morning">去晨读</button></p>';
      html += '</section>';
      html += '<section class="tile poem">';
      html += '<div class="kicker">今日一句</div>';
      html += '<p class="poem-line">' + MY.esc(poem.lines[0] || '') + (poem.lines[1] ? ' ' + MY.esc(poem.lines[1]) : '') + '</p>';
      html += '<p class="fine">—— ' + MY.esc(poem.dynasty) + '·' + MY.esc(poem.author) + '《' + MY.esc(poem.title) + '》</p>';
      html += '</section>';
      html += '<button type="button" class="btn-main board-go" data-act="open-feast">' + btn + '</button>';
      html += '<button type="button" class="board-parent" data-go="parent">家长看看</button>';
      html += '</div>';
      return html;
    },
    act: {
      'open-feast': function () {
        MY.views.feast.step = 'menu';
        MY.go('feast');
      }
    }
  };
})(window.MY = window.MY || {});
