/* 今日：主线、连续打卡、还剩什么、一句诗、进入大餐。 */
(function (MY) {
  'use strict';

  function dailyPoem() {
    var doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 864e5);
    return MY.POEMS[doy % MY.POEMS.length];
  }

  function remainHtml() {
    var feast = MY.feastList();
    var tasks = MY.taskMap();
    var undone = feast.filter(function (id) { return !tasks[id]; });
    var doneN = MY.ALL_TASKS.filter(function (t) { return !!tasks[t.id]; }).length;
    var html = '<div class="card">';
    html += '<div class="kicker">今日还剩</div>';
    if (!feast.length) {
      html += '<p class="lead">还没点今日大餐。十三道菜都在菜单里，想吃哪道点哪道。</p>';
    } else if (!undone.length) {
      html += '<p class="lead">今天点过的菜都吃完了。阳光已经记在账上。</p>';
    } else {
      html += '<ul class="remain">';
      undone.forEach(function (id) {
        var t = MY.taskById(id);
        if (!t) return;
        html += '<li><b>' + MY.esc(t.dish) + '</b><span>' + MY.esc(t.name) + ' · +' + t.reward + '阳光</span></li>';
      });
      html += '</ul>';
    }
    html += '<p class="fine">十三道里完成了 ' + doneN + ' 道</p>';
    var gs = MY.gushi.stats();
    html += '<p class="fine">' + (gs.todayDone
      ? '晨读今天已经打过卡'
      : '晨读还差今天这一组，共 ' + gs.deck.length + ' 首') +
      ' · <button type="button" class="text-btn" data-go="morning">去晨读</button></p>';
    html += '</div>';
    return html;
  }

  MY.views = MY.views || {};
  MY.views.today = {
    render: function () {
      var sys = MY.state.system;
      var ml = sys.mainline || {};
      var yl = sys.yuanli || { life: 0, drive: 0, learn: 0 };
      var age = MY.age();
      var poem = dailyPoem();
      var feast = MY.feastList();
      var undone = feast.filter(function (id) { return !MY.taskMap()[id]; });
      var btn = !feast.length ? '开始大餐' : (undone.length ? '继续大餐' : '看看今天的菜单');
      var html = '';
      html += '<section class="card mainline-card">';
      html += '<div class="kicker">我的主线</div>';
      html += '<h1>' + MY.esc(ml.title || '人生设计师') + '</h1>';
      html += '<p class="decl">' + MY.nl((ml.declaration || MY.DECLARATION).split('\n')[0]) + '</p>';
      html += '<div class="yl-row">';
      ['life', 'drive', 'learn'].forEach(function (k) {
        html += '<div class="yl-pill" style="--c:' + MY.YL_COLOR[k] + '"><b>' + (yl[k] || 0) + '</b><span>' + MY.YL_NAME[k] + '</span></div>';
      });
      html += '</div>';
      html += '<p class="fine">连续打卡 <strong>' + (MY.state.streak || 1) + '</strong> 天 · ' + age.years + '岁 · 日照新营小学四年级</p>';
      html += '</section>';
      html += '<section class="card streak-card">';
      html += '<div class="streak-num">' + (MY.state.streak || 1) + '<small>天</small></div>';
      html += '<div><div class="kicker">连续打卡</div><p class="lead">一天接一天，元力就在这里。</p></div>';
      html += '</section>';
      html += remainHtml();
      html += '<details class="card quote"><summary>今日一句</summary>';
      html += '<p class="poem-line">' + MY.esc(poem.lines[0] || '') + '<br>' + MY.esc(poem.lines[1] || '') + '</p>';
      html += '<p class="fine">—— ' + MY.esc(poem.dynasty) + '·' + MY.esc(poem.author) + '《' + MY.esc(poem.title) + '》</p>';
      html += '</details>';
      html += '<button type="button" class="btn-main" data-act="open-feast">' + btn + '</button>';
      html += '<button type="button" class="link-quiet" data-go="parent">家长看看</button>';
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
