/* 乐园：6 只宠物 + 15 格花园 + 3 种种子。这一期用原版平面形象。 */
(function (MY) {
  'use strict';

  function needToast(res, idle) {
    if (res && res.need != null) MY.toast('还差 ' + res.need + ' 阳光，再完成一道菜就靠近啦');
    else MY.toast(idle);
  }

  var view = {
    panel: 'pet',
    render: function () {
      var html = '<div class="seg">';
      html += '<button type="button" class="' + (this.panel === 'pet' ? 'on' : '') + '" data-act="panel" data-panel="pet">宠物</button>';
      html += '<button type="button" class="' + (this.panel === 'garden' ? 'on' : '') + '" data-act="panel" data-panel="garden">花园</button>';
      html += '</div>';
      html += this.panel === 'garden' ? this.gardenHtml() : this.petHtml();
      return html;
    },
    petHtml: function () {
      var active = MY.petById(MY.state.activePet);
      var html = '';
      if (!active) {
        html += '<section class="card stage-card">';
        html += '<div class="pet-bob">' + MY.petSVG('panda', 1) + '</div>';
        html += '<h1>欢迎来到萌宠乐园</h1>';
        html += '<p class="lead">完成任务赚阳光，领养小伙伴！</p></section>';
      } else {
        var pd = MY.getPetData(active.id);
        var rare = MY.RARITY[active.rarity] || { l: '', c: '' };
        html += '<section class="card stage-card">';
        html += '<div class="pet-bob" data-pet="' + active.id + '">' + MY.petSVG(active.id, pd.level) + '</div>';
        html += '<h1>' + MY.esc(active.name) + ' · Lv.' + pd.level + '</h1>';
        html += '<p class="fine ' + rare.c + '">' + MY.esc(rare.l) + '</p>';
        html += '<p class="lead">' + (pd.hunger < 25 ? '我好饿呀...' : '牧橒加油！') + '</p>';
        html += meter('饱食', pd.hunger, '#ffb74d');
        html += meter('心情', pd.happiness, '#ff7ac8');
        html += meter('经验', Math.min(100, pd.exp / MY.expNeed(pd.level) * 100), '#5ee0a0', pd.exp + '/' + MY.expNeed(pd.level));
        html += '<div class="row2">';
        html += '<button type="button" class="btn-main" data-act="feed">喂食 · 10阳光</button>';
        html += '<button type="button" class="btn-ghost" data-act="play">玩耍 · 15阳光</button>';
        html += '</div></section>';
      }
      html += '<h2 class="sec">宠物商店 · ' + MY.coins() + ' 阳光</h2>';
      html += '<div class="shop">';
      var owned = Array.isArray(MY.state.ownedPets) ? MY.state.ownedPets : [];
      MY.PET_TYPES.forEach(function (p) {
        var has = owned.indexOf(p.id) >= 0;
        var on = MY.state.activePet === p.id;
        var rare = MY.RARITY[p.rarity] || { l: '' };
        var lv = has ? MY.getPetData(p.id).level : 1;
        html += '<button type="button" class="shop-item' + (has ? ' owned' : '') + (on ? ' on' : '') + '" data-act="shop" data-id="' + p.id + '">';
        html += '<span class="thumb">' + MY.petSVG(p.id, lv) + '</span>';
        html += '<b>' + MY.esc(p.name) + '</b>';
        html += '<small>' + MY.esc(rare.l) + (has ? ' · Lv.' + lv : '') + '</small>';
        html += '<em>' + (has ? (on ? '陪伴中' : '切换') : (p.cost + '阳光')) + '</em>';
        html += '</button>';
      });
      html += '</div>';
      return html;
    },
    gardenHtml: function () {
      var html = '<section class="card">';
      html += '<div class="kicker">十五格花园</div>';
      html += '<p class="lead">点种子，再点草坪空地种下</p>';
      html += '<div class="lawn">';
      var lawn = Array.isArray(MY.state.lawn) ? MY.state.lawn : [];
      var seedOn = MY.state.selectedSeed != null;
      for (var i = 0; i < 15; i++) {
        var cell = lawn[i];
        var cls = 'cell' + (cell ? ' filled' : '') + (!cell && seedOn ? ' ready' : '');
        html += '<button type="button" class="' + cls + '" data-act="plant" data-i="' + i + '" aria-label="第' + (i + 1) + '格">';
        if (cell && cell.type) html += MY.plantSVG(cell.type);
        html += '</button>';
      }
      html += '</div></section>';
      html += '<div class="seeds">';
      MY.SEEDS.forEach(function (s, idx) {
        var on = MY.state.selectedSeed === idx;
        html += '<button type="button" class="seed' + (on ? ' on' : '') + '" data-act="seed" data-i="' + idx + '">';
        html += '<span class="thumb">' + MY.plantSVG(s.id) + '</span>';
        html += '<b>' + MY.esc(s.name) + '</b><small>' + s.cost + '阳光</small></button>';
      });
      html += '</div>';
      return html;
    },
    act: {
      panel: function (el) {
        view.panel = el.dataset.panel === 'garden' ? 'garden' : 'pet';
        MY.render();
      },
      shop: function (el) {
        var res = MY.onShop(el.dataset.id);
        if (!res.ok) { needToast(res, '这只先等等'); return; }
        if (res.bought) {
          MY.toast('欢迎 ' + res.pet.name + ' 回家');
          if (MY.ding) MY.ding();
          if (MY.burst) MY.burst();
        } else MY.toast(res.pet.name + ' 来陪你啦');
        MY.render();
      },
      feed: function () {
        var res = MY.feedPet();
        if (!res.ok) { needToast(res, '先领养一只，它就来陪你'); return; }
        MY.toast('吃饱一点，' + res.pet.name + ' 更有劲');
        if (MY.ding) MY.ding();
        if (res.levels) MY.toast(res.pet.name + ' 升到 Lv.' + MY.getPetData(res.pet.id).level);
        MY.render();
      },
      play: function () {
        var res = MY.playPet();
        if (!res.ok) { needToast(res, '先领养一只，它就来陪你'); return; }
        MY.toast(res.pet.name + ' 玩得很开心');
        if (MY.ding) MY.ding();
        MY.render();
      },
      seed: function (el) {
        var res = MY.selectSeed(+el.dataset.i);
        if (!res.ok) { needToast(res, '这颗种子先等等'); return; }
        MY.render();
      },
      plant: function (el) {
        var res = MY.plantAt(+el.dataset.i);
        if (!res.ok) {
          if (res.reason === 'noseed') MY.toast('先点一颗种子，再点空地');
          else if (res.reason === 'occupied') MY.toast('这里已经长出来了');
          else needToast(res, '先等等');
          return;
        }
        MY.toast(res.seed.name + ' 种下了，花园亮了一格');
        if (MY.ding) MY.ding();
        MY.render();
      }
    }
  };

  function meter(name, pct, color, label) {
    pct = Math.max(0, Math.min(100, pct || 0));
    return '<div class="meter"><span>' + name + '</span><i><b style="width:' + pct + '%;background:' + color + '"></b></i><em>' + (label || Math.round(pct)) + '</em></div>';
  }

  MY.views = MY.views || {};
  MY.views.park = view;
})(window.MY = window.MY || {});
