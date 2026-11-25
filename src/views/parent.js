/* 家长视图：只读。不进底栏，不设密码。存档在这里进出。 */
(function (MY) {
  'use strict';

  function stuck() {
    var items = [];
    var feast = MY.feastList();
    var tasks = MY.taskMap();
    var undone = feast.filter(function (id) { return !tasks[id]; });
    if (!feast.length) items.push('今天还没点大餐');
    else if (undone.length) {
      items.push('大餐还剩 ' + undone.map(function (id) {
        var t = MY.taskById(id);
        return t ? t.name : id;
      }).join('、'));
    }
    if (!MY.gushi.todayDone()) items.push('晨读今天还没打卡');
    var owned = Array.isArray(MY.state.ownedPets) ? MY.state.ownedPets : [];
    if (!owned.length) items.push('乐园还没有领养小伙伴');
    owned.forEach(function (id) {
      var pd = MY.getPetData(id);
      var pet = MY.petById(id);
      if (pd.hunger < 30) items.push((pet ? pet.name : '宠物') + ' 有点饿');
    });
    var lawn = Array.isArray(MY.state.lawn) ? MY.state.lawn : [];
    var planted = lawn.some(function (c) { return !!c; });
    if (!planted) items.push('花园还是空的');
    var w = MY.state.system && MY.state.system.workflow;
    if (w && !w.done && MY.WF_STEPS[w.step]) items.push('难题五步停在「' + MY.WF_STEPS[w.step].n + '」');
    if (!items.length) items.push('今天没有卡住的地方，元力满满');
    return items;
  }

  var view = {
    render: function () {
      var tasks = MY.taskMap();
      var done = MY.ALL_TASKS.filter(function (t) { return !!tasks[t.id]; });
      var html = '<div class="flow-top"><button type="button" class="back" data-go="today">← 回到今日</button><div class="flow-title">家长看看</div></div>';
      html += '<p class="fine parent-note">这里只看，不改任务，也没有密码。</p>';
      html += '<section class="card"><div class="kicker">连续打卡</div><p class="streak-num">' + (MY.state.streak || 1) + '<small>天</small></p>';
      html += '<p class="fine">阳光 ' + MY.coins() + ' · 今天完成 ' + done.length + ' / ' + MY.ALL_TASKS.length + '</p></section>';
      html += '<section class="card"><div class="kicker">今日完成</div><ul class="parent-list">';
      MY.ALL_TASKS.forEach(function (t) {
        var on = !!tasks[t.id];
        html += '<li class="' + (on ? 'ok' : '') + '"><span>' + (on ? '✓' : '·') + '</span><b>' + MY.esc(t.name) + '</b><small>' + MY.esc(t.dish) + '</small></li>';
      });
      html += '</ul></section>';
      html += '<section class="card"><div class="kicker">哪里卡住</div><ul class="stuck">';
      stuck().forEach(function (line) { html += '<li>' + MY.esc(line) + '</li>'; });
      html += '</ul></section>';
      var gs = MY.gushi.stats();
      html += '<section class="card"><div class="kicker">晨读</div><p>第 ' + gs.day + ' 天 · 已掌握 ' + gs.mastered + '/25 · ' +
        (gs.todayDone ? '今日已打卡' : '今日还没打卡') + '</p></section>';
      html += '<section class="card archive"><div class="kicker">存档</div>';
      html += '<p>导出的 JSON 会带上全部字段。认不出的旧字段也会原样留下，接回来时不会被清掉。</p>';
      html += '<button type="button" class="btn-main" data-act="export-archive">导出存档</button>';
      html += '<button type="button" class="btn-ghost" data-act="import-pick">导入存档</button>';
      html += '<input id="importFile" class="file" type="file" accept="application/json,.json">';
      html += '</section>';
      return html;
    },
    mount: function () {
      var input = document.getElementById('importFile');
      if (!input || input.dataset.bound) return;
      input.dataset.bound = '1';
      input.addEventListener('change', function () {
        var file = input.files && input.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var text = String(reader.result || '').replace(/^\uFEFF/, '');
            MY.importArchive(JSON.parse(text));
            MY.toast('存档接回来了，原来的字段都还在');
            if (MY.ding) MY.ding();
            MY.render();
          } catch (e) {
            MY.toast((e && e.message && e.message !== 'bad' && e.message !== 'empty') ? e.message : '这份存档打不开，原来的进度还在');
          }
        };
        reader.readAsText(file);
      });
    },
    act: {
      'export-archive': function () {
        var data = MY.exportArchive();
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = '牧橒存档_' + MY.ymd(new Date()) + '.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
        MY.toast('存档已导出，收好这个 JSON');
      },
      'import-pick': function () {
        var input = document.getElementById('importFile');
        if (input) input.click();
      }
    }
  };

  MY.views = MY.views || {};
  MY.views.parent = view;
})(window.MY = window.MY || {});
