/* 壳子：底栏四项，大餐和家长视图从流程进出。 */
(function (MY) {
  'use strict';

  var toastTimer = null;
  MY.route = 'today';
  MY.pendingRecite = null;

  function renderChrome() {
    var age = MY.age();
    var top = document.getElementById('top');
    if (top) {
      top.innerHTML = '<div class="brand"><div class="brand-name">陈牧橒</div><div class="brand-sub">' +
        age.years + '岁 · 连续 ' + (MY.state.streak || 1) + ' 天</div></div>' +
        '<div class="coin"><b>' + MY.coins() + '</b><span>阳光</span></div>';
    }
    var flow = MY.route === 'feast' || MY.route === 'parent';
    var bar = document.getElementById('tabbar');
    if (bar) bar.hidden = flow;
    document.body.dataset.route = MY.route;
    document.querySelectorAll('#tabbar [data-go]').forEach(function (btn) {
      var on = btn.dataset.go === MY.route;
      btn.classList.toggle('on', on);
      if (on) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });
  }

  MY.toast = function (msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  };

  MY.burst = function () {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var box = document.createElement('div');
    box.className = 'burst';
    var em = ['✨', '🌟', '💛', '🌸', '⭐'];
    for (var i = 0; i < 12; i++) {
      var s = document.createElement('span');
      s.textContent = em[i % em.length];
      s.style.left = (12 + Math.random() * 76) + '%';
      s.style.animationDelay = (Math.random() * 0.12) + 's';
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 1100);
  };

  MY.render = function () {
    renderChrome();
    var view = MY.views[MY.route] || MY.views.today;
    var root = document.getElementById('view');
    try {
      root.innerHTML = view.render();
      if (view.mount) view.mount();
    } catch (err) {
      console.error(err);
      root.innerHTML = '<section class="card"><h2>这一页没展开</h2><p>回到今日再试一次。</p><button type="button" class="btn-main" data-go="today">回到今日</button></section>';
    }
  };

  MY.go = function (route) {
    if (!MY.views[route]) route = 'today';
    if (route !== MY.route && MY.views[MY.route] && MY.views[MY.route].unmount) MY.views[MY.route].unmount();
    MY.route = route;
    if (route === 'morning' && MY.views.morning.takeAuto) MY.views.morning.takeAuto();
    MY.render();
    try { window.scrollTo(0, 0); } catch (e) {}
  };

  document.body.addEventListener('click', function (e) {
    var el = e.target.closest('[data-go],[data-act]');
    if (!el || el.disabled) return;
    if (el.dataset.go && !el.dataset.act) {
      MY.go(el.dataset.go);
      return;
    }
    var act = el.dataset.act;
    if (!act) return;
    var view = MY.views[MY.route];
    var fn = view && view.act && view.act[act];
    if (fn) fn(el, e);
  });

  document.body.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target && e.target.id === 'ruleInput') {
      var fn = MY.views.mainline && MY.views.mainline.act['rule-add'];
      if (fn) fn();
    }
    if (e.key === 'Enter' && e.target && e.target.id === 'wfInput' && MY.state.system.workflow && MY.state.system.workflow.step === 0) {
      var next = MY.views.mainline && MY.views.mainline.act['wf-next'];
      if (next) next();
    }
  });

  MY.render();
})(window.MY = window.MY || {});
