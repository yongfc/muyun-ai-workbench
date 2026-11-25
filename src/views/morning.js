/* 晨读：25 首原文、今日卡组、艾宾浩斯打分、斩卡。 */
(function (MY) {
  'use strict';

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var view = {
    mode: 'home',
    auto: false,
    rec: null,
    quiz: null,
    result: null,
    resultDish: null,
    detailId: null,

    takeAuto: function () {
      if (!this.auto) return;
      this.auto = false;
      this.startRecall('today');
    },
    startRecall: function (mode) {
      var ids = MY.gushi.deck();
      if (!ids.length) { MY.toast('没有可背的篇目'); return; }
      this.result = null;
      this.mode = 'recall';
      this.rec = {
        ids: ids.slice(),
        queue: ids.map(function (id) { return { id: id }; }),
        idx: 0,
        flipped: false,
        locked: false,
        counts: { ok: 0, mid: 0, no: 0 },
        result: {},
        retries: {},
        mode: mode || 'today'
      };
    },
    finishRec: function () {
      var rec = this.rec;
      if (!rec) return;
      var summary;
      if (rec.mode === 'today') summary = MY.gushi.finishToday(rec.counts, rec.ids, rec.result);
      else {
        var tries = rec.counts.ok + rec.counts.mid + rec.counts.no;
        var acc = tries ? Math.round(rec.counts.ok / tries * 100) : 0;
        summary = {
          acc: acc, ok: rec.counts.ok, mid: rec.counts.mid, no: rec.counts.no,
          total: rec.ids.length, cheer: MY.gushi.cheerOf(acc, rec.counts.ok),
          mode: 'free', best: MY.gushi.poem(rec.ids[0]), badges: []
        };
      }
      if (summary.badges && summary.badges.length) {
        MY.toast('获得徽章：' + summary.badges.map(function (b) { return b.nm; }).join('、'));
      }
      var dish = null;
      if (MY.pendingRecite && rec.mode === 'today') {
        var pid = MY.pendingRecite;
        MY.pendingRecite = null;
        var res = MY.completeTask(pid);
        if (res && res.ok) {
          dish = res.task;
          var yl = res.yl ? MY.YL_NAME[res.yl] + ' +1 · ' : '';
          MY.toast('叮！「' + res.task.name + '」吃完了 · ' + yl + '阳光 +' + res.task.reward);
          if (MY.ding) MY.ding();
        }
      }
      this.rec = null;
      this.result = summary;
      this.resultDish = dish;
      this.mode = 'result';
      if (MY.burst) MY.burst();
      MY.render();
    },
    startQuiz: function (ids) {
      if (!ids || !ids.length) ids = shuffle(MY.POEMS.map(function (p) { return p.id; })).slice(0, 10);
      this.mode = 'quiz';
      this.quiz = {
        ids: ids.slice(),
        queue: ids.map(function (id) { return { id: id }; }),
        idx: 0,
        hit: [],
        right: 0,
        wrong: 0,
        retry: {},
        q: null,
        locked: false,
        picked: null,
        reveal: null
      };
      this.drawQ();
    },
    drawQ: function () {
      var quiz = this.quiz;
      if (!quiz) return false;
      if (quiz.idx >= quiz.queue.length) { this.finishQuiz(); return false; }
      var poem = MY.gushi.poem(quiz.queue[quiz.idx].id);
      quiz.q = poem ? MY.gushi.makeQuestion(poem) : null;
      quiz.locked = false;
      quiz.picked = null;
      quiz.reveal = null;
      if (!quiz.q) { quiz.idx += 1; return this.drawQ(); }
      return true;
    },
    finishQuiz: function () {
      var quiz = this.quiz;
      if (!quiz) return;
      var tries = quiz.right + quiz.wrong;
      var acc = tries ? Math.round(quiz.right / tries * 100) : 0;
      var stars = acc >= 95 ? 3 : acc >= 80 ? 2 : acc >= 60 ? 1 : 0;
      this.result = { mode: 'quiz', ok: quiz.hit.length, total: quiz.ids.length, right: quiz.right, wrong: quiz.wrong, acc: acc, stars: stars, ids: quiz.ids.slice() };
      this.quiz = null;
      this.mode = 'result';
      if (MY.burst) MY.burst();
      MY.render();
    },

    render: function () {
      if (this.mode === 'recall' && this.rec) return this.recallHtml();
      if (this.mode === 'quiz' && this.quiz) return this.quizHtml();
      if (this.mode === 'result' && this.result) return this.resultHtml();
      if (this.mode === 'detail' && this.detailId) return this.detailHtml();
      return this.homeHtml();
    },

    homeHtml: function () {
      var s = MY.gushi.stats();
      var html = '<section class="card">';
      html += '<div class="kicker">' + MY.esc(s.weekName) + ' · 三三七晨读</div>';
      html += '<h1>第 ' + s.day + ' 天</h1>';
      html += '<div class="stat4">';
      html += '<div><b>' + s.mastered + '/25</b><span>已掌握</span></div>';
      html += '<div><b>' + s.streak + '</b><span>连续晨读</span></div>';
      html += '<div><b>' + MY.esc(s.rank) + '</b><span>称号</span></div>';
      html += '<div><b>' + s.xp + '</b><span>经验</span></div>';
      html += '</div>';
      html += '<p class="fine">' + (s.todayDone ? '今日已打卡' : '今日卡组 ' + s.deck.length + ' 首待背') +
        (s.due ? ' · 到复习时间 ' + s.due + ' 首' : '') +
        (s.badge ? ' · 最新徽章 ' + MY.esc(s.badge) : '') + '</p>';
      if (MY.pendingRecite) {
        var task = MY.taskById(MY.pendingRecite);
        if (task) html += '<p class="banner">背完今天这一组，「' + MY.esc(task.dish) + '」这道菜就吃完了。</p>';
      }
      html += '<div class="chips">';
      s.deck.forEach(function (id) {
        var p = MY.gushi.poem(id);
        if (p) html += '<span>' + MY.esc(p.title) + '</span>';
      });
      html += '</div>';
      html += '<button type="button" class="btn-main" data-act="start-today">' + (s.todayDone ? '今日已打卡，再练一组' : '开始背诵') + '</button>';
      html += '<button type="button" class="btn-ghost" data-act="start-quiz">斩卡闯关</button>';
      html += '</section>';
      html += '<h2 class="sec">四年级上 · 25 首</h2>';
      MY.POEMS.forEach(function (p) {
        var rec = MY.gushi.record(p.id);
        html += '<button type="button" class="poem-row" data-act="open-poem" data-id="' + p.id + '">';
        html += '<b>' + MY.esc(p.title) + '</b>';
        html += '<small>' + MY.esc(p.dynasty) + ' · ' + MY.esc(p.author) + (rec.mastered ? ' · 已掌握' : '') + '</small>';
        html += '</button>';
      });
      return html;
    },

    recallHtml: function () {
      var rec = this.rec;
      var item = rec.queue[rec.idx];
      var p = MY.gushi.poem(item.id);
      var st = MY.gushi.record(p.id);
      var done = rec.counts.ok + rec.counts.mid + rec.counts.no;
      var html = '<section class="card recall">';
      html += '<div class="bar"><i style="width:' + Math.round(done / Math.max(1, rec.ids.length) * 100) + '%"></i></div>';
      html += '<p class="fine">已背 ' + done + ' / ' + rec.ids.length + '</p>';
      html += '<div class="kicker">' + (st.stage < 0 ? '新学' : '复习') + ' · ' + MY.esc(MY.GENRES[p.genre].name) + ' · ' + '★'.repeat(p.level) + '</div>';
      html += '<h2 class="rec-title">' + MY.esc(p.title) + '</h2>';
      html += '<p class="fine">' + MY.esc(p.dynasty) + ' · ' + MY.esc(p.author) + ' · 已读 ' + st.reads + ' 遍</p>';
      if (!rec.flipped) {
        html += '<p class="lead">先出声背一遍，再点下面核对。</p>';
        html += '<button type="button" class="btn-main" data-act="flip">翻开核对全文</button>';
      } else {
        html += '<div class="poem-lines">';
        p.lines.forEach(function (line) { html += '<p>' + MY.esc(line) + '</p>'; });
        html += '</div>';
        html += '<p class="note">⚠ ' + MY.esc(p.note) + '</p>';
        html += '<div class="rates">';
        html += '<button type="button" data-act="rate" data-r="ok"><b>✓ 记住</b><small>隔几天再见</small></button>';
        html += '<button type="button" data-act="rate" data-r="mid"><b>? 不确定</b><small>明天再来</small></button>';
        html += '<button type="button" data-act="rate" data-r="no"><b>✗ 没记住</b><small>今天再来</small></button>';
        html += '</div>';
        html += '<div class="row2">';
        html += '<button type="button" class="btn-ghost" data-act="rec-speak" data-id="' + p.id + '">听读一遍</button>';
        html += '<button type="button" class="btn-ghost" data-act="rec-hint" data-id="' + p.id + '">记忆点</button>';
        html += '</div>';
      }
      html += '<button type="button" class="link-quiet" data-act="rec-quit">先收工</button>';
      html += '</section>';
      return html;
    },

    quizHtml: function () {
      var quiz = this.quiz;
      var q = quiz.q;
      var p = MY.gushi.poem(q.poemId);
      var html = '<section class="card">';
      html += '<div class="bar"><i style="width:' + Math.round(quiz.hit.length / Math.max(1, quiz.ids.length) * 100) + '%"></i></div>';
      html += '<p class="fine">斩获 ' + quiz.hit.length + ' / ' + quiz.ids.length + '</p>';
      html += '<div class="kicker">' + MY.esc(q.label) + '</div>';
      html += '<div class="stem' + (q.big ? ' sm' : '') + '">' + q.stemHtml + '</div>';
      html += '<div class="opts">';
      q.opts.forEach(function (o, i) {
        var cls = 'opt';
        if (quiz.locked) {
          if (i === q.ans) cls += ' right';
          else if (i === quiz.picked) cls += ' wrong';
        }
        html += '<button type="button" class="' + cls + '" data-act="quiz-ans" data-i="' + i + '">' + MY.esc(o) + '</button>';
      });
      html += '</div>';
      if (quiz.reveal) {
        html += '<div class="note"><b>这一句是</b><p class="poem-line">' + MY.esc(quiz.reveal.full) + '</p>';
        html += '<p>' + MY.esc(quiz.reveal.note) + '</p>';
        html += '<button type="button" class="btn-main" data-act="quiz-next">' + (quiz.reveal.again ? '记住了，继续' : '继续') + '</button></div>';
      }
      html += '<button type="button" class="link-quiet" data-act="quiz-quit">先离开</button>';
      html += '</section>';
      return html;
    },

    resultHtml: function () {
      var r = this.result;
      var html = '<section class="card cele">';
      if (r.mode === 'quiz') {
        html += '<div class="cele-big">' + '★'.repeat(r.stars) + '☆'.repeat(3 - r.stars) + '</div>';
        html += '<h2>' + r.ok + ' / ' + r.total + '</h2>';
        html += '<p>答对 ' + r.right + ' 次 · 答错 ' + r.wrong + ' 次 · 正确率 ' + r.acc + '%</p>';
        html += '<button type="button" class="btn-main" data-act="start-quiz" data-ids="' + r.ids.join(',') + '">再来一组</button>';
      } else {
        html += '<div class="cele-big">📖</div>';
        html += '<h2>' + (r.mode === 'today' ? '今日打卡完成' : '这一组背完了') + '</h2>';
        html += '<p class="lead">' + MY.esc(r.cheer || '') + '</p>';
        html += '<p>记住 ' + r.ok + ' 首 · 不确定 ' + r.mid + ' · 还要再看 ' + r.no + ' · 正确率 ' + r.acc + '%</p>';
        if (r.best) {
          html += '<p class="poem-line">' + MY.esc(r.best.lines[0] || '') + '<br>' + MY.esc(r.best.lines[1] || '') + '</p>';
          html += '<p class="fine">—— ' + MY.esc(r.best.dynasty) + '·' + MY.esc(r.best.author) + '《' + MY.esc(r.best.title) + '》</p>';
        }
        if (this.resultDish || MY.feastList().length) {
          html += '<button type="button" class="btn-main" data-act="back-feast">回到大餐</button>';
        }
      }
      html += '<button type="button" class="btn-ghost" data-act="back-home">回到晨读</button>';
      html += '</section>';
      return html;
    },

    detailHtml: function () {
      var p = MY.gushi.poem(this.detailId);
      if (!p) { this.mode = 'home'; return this.homeHtml(); }
      var st = MY.gushi.record(p.id);
      var html = '<button type="button" class="back" data-act="back-home">← 二十五首</button>';
      html += '<article class="card poem-view">';
      html += '<div class="kicker">' + MY.esc(MY.GENRES[p.genre].name) + ' · ' + '★'.repeat(p.level) + '</div>';
      html += '<h1>' + MY.esc(p.title) + '</h1>';
      html += '<p class="fine">' + MY.esc(p.dynasty) + ' · ' + MY.esc(p.author) + ' · 已读 ' + st.reads + ' 遍' + (st.mastered ? ' · 已掌握' : '') + '</p>';
      html += '<div class="poem-lines">';
      p.lines.forEach(function (line) { html += '<p>' + MY.esc(line) + '</p>'; });
      html += '</div>';
      html += '<p class="note">⚠ ' + MY.esc(p.note) + '</p>';
      html += '<p class="hint"><b>记忆点</b> ' + MY.esc(p.hint) + '</p>';
      html += '<div class="row2">';
      html += '<button type="button" class="btn-ghost" data-act="rec-speak" data-id="' + p.id + '">听读一遍</button>';
      html += '<button type="button" class="btn-main" data-act="mark-read" data-id="' + p.id + '">跟读完 +1</button>';
      html += '</div></article>';
      return html;
    },

    act: {
      'start-today': function () {
        var mode = MY.gushi.todayDone() ? 'free' : 'today';
        view.startRecall(mode);
        MY.render();
      },
      'start-quiz': function (el) {
        var ids = el && el.dataset && el.dataset.ids ? el.dataset.ids.split(',').map(function (x) { return +x; }).filter(Boolean) : null;
        view.startQuiz(ids);
        MY.render();
      },
      flip: function () {
        if (!view.rec || view.rec.flipped) return;
        view.rec.flipped = true;
        if (MY.tone) MY.tone(520, 0.06, 0.1);
        MY.render();
      },
      rate: function (el) {
        var rec = view.rec;
        if (!rec || !rec.flipped || rec.locked) return;
        rec.locked = true;
        var id = rec.queue[rec.idx].id;
        var kind = el.dataset.r;
        rec.counts[kind] += 1;
        rec.result[id] = kind;
        var scored = MY.gushi.grade(id, kind === 'ok' ? 100 : kind === 'mid' ? 65 : 30);
        if (scored.badges && scored.badges.length) {
          MY.toast('获得徽章：' + scored.badges.map(function (b) { return b.nm; }).join('、'));
        }
        if (kind === 'no') {
          rec.retries[id] = (rec.retries[id] || 0) + 1;
          if (rec.retries[id] < 3) rec.queue.push({ id: id });
        }
        if (kind === 'ok' && MY.ding) MY.ding();
        setTimeout(function () {
          if (view.rec !== rec) return;
          rec.idx += 1;
          rec.locked = false;
          rec.flipped = false;
          if (rec.idx >= rec.queue.length) view.finishRec();
          else MY.render();
        }, 280);
      },
      'rec-speak': function (el) {
        var p = MY.gushi.poem(+el.dataset.id);
        if (p) MY.gushi.speak(p.lines.join(''));
      },
      'rec-hint': function (el) {
        var p = MY.gushi.poem(+el.dataset.id);
        if (p) MY.toast(p.hint);
      },
      'rec-quit': function () {
        var n = view.rec ? view.rec.counts.ok : 0;
        view.rec = null;
        view.mode = 'home';
        MY.toast(n ? '今天先到这儿，已记住 ' + n + ' 首' : '今天先到这儿');
        MY.render();
      },
      'quiz-ans': function (el) {
        var quiz = view.quiz;
        if (!quiz || !quiz.q || quiz.locked) return;
        var i = +el.dataset.i;
        quiz.locked = true;
        quiz.picked = i;
        var q = quiz.q;
        var poem = MY.gushi.poem(q.poemId);
        if (i === q.ans) {
          quiz.right += 1;
          if (quiz.hit.indexOf(q.poemId) < 0) quiz.hit.push(q.poemId);
          var g = MY.gushi.grade(q.poemId, 100);
          if (g.badges && g.badges.length) MY.toast('获得徽章：' + g.badges.map(function (b) { return b.nm; }).join('、'));
          if (MY.ding) MY.ding();
          MY.render();
          setTimeout(function () {
            if (!view.quiz || view.quiz !== quiz) return;
            quiz.idx += 1;
            view.drawQ();
            if (view.mode === 'quiz') MY.render();
          }, 420);
        } else {
          quiz.wrong += 1;
          MY.gushi.grade(q.poemId, 35);
          quiz.retry[q.poemId] = (quiz.retry[q.poemId] || 0) + 1;
          var again = quiz.retry[q.poemId] < 3;
          if (again) quiz.queue.push({ id: q.poemId });
          quiz.reveal = { full: q.full, note: poem ? poem.note : '', again: again };
          MY.toast(again ? '这首待会儿再来一次' : '先记住这一句');
          MY.render();
        }
      },
      'quiz-next': function () {
        if (!view.quiz) return;
        view.quiz.idx += 1;
        view.drawQ();
        if (view.mode === 'quiz') MY.render();
      },
      'quiz-quit': function () {
        view.quiz = null;
        view.mode = 'home';
        MY.render();
      },
      'open-poem': function (el) {
        view.detailId = +el.dataset.id;
        view.mode = 'detail';
        MY.render();
      },
      'mark-read': function (el) {
        var id = +el.dataset.id;
        var res = MY.gushi.markRead(id);
        var p = MY.gushi.poem(id);
        MY.toast('朗读 +1　（' + (p ? p.title : '') + ' 累计 ' + res.record.reads + ' 遍）');
        if (res.badges && res.badges.length) MY.toast('获得徽章：' + res.badges.map(function (b) { return b.nm; }).join('、'));
        if (MY.ding) MY.ding();
        MY.render();
      },
      'back-home': function () {
        view.mode = 'home';
        view.rec = null;
        view.quiz = null;
        view.result = null;
        MY.render();
      },
      'back-feast': function () {
        view.mode = 'home';
        MY.views.feast.continueNext();
        MY.go('feast');
      }
    }
  };

  MY.views = MY.views || {};
  MY.views.morning = view;
})(window.MY = window.MY || {});
