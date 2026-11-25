/* 乐园形象：原创贴纸风，六只同一套五官和金星发卡。不是外部 IP。 */
(function (MY) {
  'use strict';

  function eye(cx, cy) {
    return '<g>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="15" ry="17.5" fill="#fff"/>' +
      '<ellipse cx="' + cx + '" cy="' + (cy + 2) + '" rx="8.2" ry="10.2" fill="#322820"/>' +
      '<circle cx="' + (cx + 3.5) + '" cy="' + (cy - 5) + '" r="3.3" fill="#fff"/>' +
      '<circle cx="' + (cx - 2.4) + '" cy="' + (cy + 3.5) + '" r="1.35" fill="#fff" opacity=".9"/>' +
      '</g>';
  }
  function blush(cx, cy) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="13" ry="7.5" fill="#ff8fab" opacity=".5"/>';
  }
  function shine(cx, cy) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="20" ry="11" fill="#fff" opacity=".33" transform="rotate(-32 ' + cx + ' ' + cy + ')"/>';
  }
  function star(x, y, r) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var ang = -Math.PI / 2 + i * Math.PI / 5;
      var rad = (i % 2 === 0) ? r : r * 0.42;
      pts.push((x + Math.cos(ang) * rad).toFixed(1) + ',' + (y + Math.sin(ang) * rad).toFixed(1));
    }
    return '<polygon points="' + pts.join(' ') + '" fill="#ffe27a" stroke="#e7a11a" stroke-width="1.3" stroke-linejoin="round"/>';
  }
  function stage(tint) {
    return '<ellipse cx="120" cy="246" rx="64" ry="11" fill="#000" opacity=".22"/>' +
      '<circle cx="120" cy="136" r="100" fill="' + tint + '" opacity=".2"/>';
  }
  function deco(level) {
    var lv = level || 1;
    var h = '';
    if (lv >= 5) h += '<ellipse cx="120" cy="22" rx="34" ry="9" fill="none" stroke="#ffe08a" stroke-width="3" opacity=".9"/>';
    if (lv >= 3) {
      h += '<path d="M98 46 L106 26 L114 44 L120 20 L126 44 L134 26 L142 46 L138 54 L102 54 Z" fill="#ffe27a" stroke="#e39b16" stroke-width="1.5" stroke-linejoin="round"/>';
      h += '<circle cx="120" cy="22" r="2.6" fill="#ff8fab"/>';
    }
    return h;
  }
  function wrap(level, tint, inner) {
    return '<svg viewBox="0 0 240 260">' + deco(level) + stage(tint) + inner + '</svg>';
  }

  function dog(level) {
    return wrap(level, '#ffd7a8',
      '<ellipse cx="78" cy="132" rx="22" ry="32" fill="#c9844a" transform="rotate(18 78 132)"/>' +
      '<ellipse cx="164" cy="118" rx="20" ry="34" fill="#e0a15c" transform="rotate(-16 164 118)"/>' +
      '<ellipse cx="164" cy="124" rx="11" ry="22" fill="#f3c9a0" transform="rotate(-16 164 124)"/>' +
      '<ellipse cx="120" cy="196" rx="56" ry="38" fill="#e39a52"/>' +
      '<ellipse cx="120" cy="206" rx="34" ry="22" fill="#ffe3c4"/>' +
      '<circle cx="92" cy="214" r="13" fill="#f0b56e"/>' +
      '<circle cx="148" cy="214" r="13" fill="#f0b56e"/>' +
      '<path d="M168 188 Q208 176 196 214 Q176 226 162 206" fill="#e39a52"/>' +
      '<circle cx="120" cy="124" r="60" fill="#f2b56a"/>' +
      shine(104, 100) +
      eye(100, 118) + eye(142, 118) +
      blush(78, 140) + blush(164, 140) +
      '<ellipse cx="120" cy="148" rx="26" ry="18" fill="#fff1df"/>' +
      '<ellipse cx="120" cy="142" rx="9" ry="7" fill="#6a463c"/>' +
      '<path d="M108 156 Q120 166 132 156" fill="none" stroke="#6a463c" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M114 158 Q120 170 126 158 Q120 166 114 158" fill="#ff8fa3"/>' +
      star(168, 96, 11)
    );
  }

  function cat(level) {
    return wrap(level, '#ffd0ea',
      '<path d="M78 78 L92 36 L112 74 Z" fill="#f3a36a"/>' +
      '<path d="M86 74 L94 48 L106 72 Z" fill="#ffd0dc"/>' +
      '<path d="M162 78 L148 36 L128 74 Z" fill="#f3a36a"/>' +
      '<path d="M154 74 L146 48 L134 72 Z" fill="#ffd0dc"/>' +
      '<ellipse cx="120" cy="198" rx="54" ry="36" fill="#f6b27a"/>' +
      '<ellipse cx="120" cy="208" rx="32" ry="20" fill="#fff0e4"/>' +
      '<path d="M162 196 Q214 168 200 124 Q188 156 170 176 Q184 190 162 196" fill="#e8956a"/>' +
      '<circle cx="120" cy="126" r="58" fill="#f7b27a"/>' +
      '<path d="M108 92 Q112 80 116 94 M120 88 Q124 74 128 92 M132 92 Q136 80 140 96" fill="none" stroke="#e08a55" stroke-width="3" stroke-linecap="round"/>' +
      shine(102, 104) +
      eye(100, 122) + eye(142, 122) +
      blush(76, 146) + blush(164, 146) +
      '<ellipse cx="120" cy="150" rx="22" ry="15" fill="#fff3ea"/>' +
      '<path d="M114 144 L126 144 L120 152 Z" fill="#ff8fa8"/>' +
      '<path d="M108 156 Q120 164 132 156" fill="none" stroke="#d9896a" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M70 136 H96 M70 146 H98 M170 136 H144 M170 146 H142" stroke="#fff" stroke-width="1.7" stroke-linecap="round" opacity=".85"/>' +
      star(150, 58, 10)
    );
  }

  function bunny(level) {
    return wrap(level, '#ffe4f1',
      '<rect x="86" y="18" width="26" height="78" rx="13" fill="#fff" stroke="#f3d5e2" stroke-width="2"/>' +
      '<rect x="92" y="30" width="14" height="52" rx="7" fill="#ffb7cb"/>' +
      '<g transform="rotate(16 148 58)">' +
      '<rect x="132" y="18" width="26" height="78" rx="13" fill="#fff" stroke="#f3d5e2" stroke-width="2"/>' +
      '<rect x="138" y="30" width="14" height="52" rx="7" fill="#ffb7cb"/>' +
      '</g>' +
      '<ellipse cx="120" cy="202" rx="52" ry="34" fill="#fff"/>' +
      '<circle cx="168" cy="196" r="14" fill="#fff6fb" stroke="#f6d5e4" stroke-width="2"/>' +
      '<circle cx="120" cy="132" r="58" fill="#fff"/>' +
      shine(104, 112) +
      eye(100, 128) + eye(142, 128) +
      blush(74, 150) + blush(166, 150) +
      '<path d="M112 146 L128 146 L120 154 Z" fill="#ff9eb8"/>' +
      '<rect x="114" y="156" width="5" height="8" rx="2" fill="#fff" stroke="#f0d0dc" stroke-width="1"/>' +
      '<rect x="121" y="156" width="5" height="8" rx="2" fill="#fff" stroke="#f0d0dc" stroke-width="1"/>' +
      '<path d="M106 160 Q120 170 134 160" fill="none" stroke="#e7a8ba" stroke-width="2.2" stroke-linecap="round"/>' +
      star(154, 86, 10)
    );
  }

  function fox(level) {
    return wrap(level, '#ffd0b4',
      '<path d="M74 96 L96 40 L118 92 Z" fill="#ff8a4a"/>' +
      '<path d="M84 90 L98 52 L110 88 Z" fill="#ffd3bf"/>' +
      '<path d="M78 96 L88 62 L96 90 Z" fill="#3a2a28" opacity=".8"/>' +
      '<path d="M166 96 L144 40 L122 92 Z" fill="#ff8a4a"/>' +
      '<path d="M156 90 L142 52 L130 88 Z" fill="#ffd3bf"/>' +
      '<path d="M162 96 L152 62 L144 90 Z" fill="#3a2a28" opacity=".8"/>' +
      '<ellipse cx="120" cy="200" rx="52" ry="34" fill="#ff8a4a"/>' +
      '<path d="M150 196 Q214 210 206 154 Q186 186 164 188 Q178 206 150 196" fill="#ff8a4a"/>' +
      '<path d="M196 160 Q210 150 206 168 Q198 162 196 160" fill="#fff6ee"/>' +
      '<circle cx="120" cy="128" r="58" fill="#ff9356"/>' +
      '<path d="M70 146 Q86 176 120 178 Q154 176 170 146 Q150 166 120 166 Q90 166 70 146 Z" fill="#fff6ee"/>' +
      shine(104, 108) +
      eye(100, 122) + eye(142, 122) +
      blush(78, 148) + blush(162, 148) +
      '<ellipse cx="120" cy="150" rx="8" ry="6" fill="#3a2a28"/>' +
      '<path d="M108 162 Q120 172 132 162" fill="none" stroke="#3a2a28" stroke-width="2.3" stroke-linecap="round"/>' +
      star(112, 52, 10)
    );
  }

  function panda(level) {
    return wrap(level, '#e7eef8',
      '<circle cx="74" cy="86" r="24" fill="#2c2c2c"/>' +
      '<circle cx="74" cy="86" r="12" fill="#4a4a4a"/>' +
      '<circle cx="166" cy="86" r="24" fill="#2c2c2c"/>' +
      '<circle cx="166" cy="86" r="12" fill="#4a4a4a"/>' +
      '<ellipse cx="120" cy="204" rx="54" ry="34" fill="#2f2f2f"/>' +
      '<circle cx="88" cy="214" r="14" fill="#2f2f2f"/>' +
      '<circle cx="152" cy="214" r="14" fill="#2f2f2f"/>' +
      '<ellipse cx="120" cy="210" rx="28" ry="16" fill="#fff"/>' +
      '<circle cx="120" cy="128" r="60" fill="#fff"/>' +
      '<ellipse cx="96" cy="124" rx="18" ry="20" fill="#2c2c2c" transform="rotate(-12 96 124)"/>' +
      '<ellipse cx="144" cy="124" rx="18" ry="20" fill="#2c2c2c" transform="rotate(12 144 124)"/>' +
      shine(108, 104) +
      eye(98, 124) + eye(144, 124) +
      blush(72, 150) + blush(168, 150) +
      '<ellipse cx="120" cy="150" rx="10" ry="7" fill="#2c2c2c"/>' +
      '<path d="M106 162 Q120 174 134 162" fill="none" stroke="#2c2c2c" stroke-width="2.6" stroke-linecap="round"/>' +
      '<g transform="rotate(18 188 168)">' +
      '<rect x="176" y="132" width="10" height="52" rx="5" fill="#57b25e"/>' +
      '<rect x="176" y="148" width="10" height="4" fill="#3e8c46"/>' +
      '<path d="M176 138 Q196 124 190 146 Q180 142 176 138" fill="#8ed98a"/>' +
      '</g>' +
      star(150, 70, 10)
    );
  }

  function dragon(level) {
    return wrap(level, '#d9fff4',
      '<path d="M46 150 Q24 112 52 96 Q40 124 62 140 Q50 150 46 150" fill="#b7efe4" opacity=".95"/>' +
      '<path d="M194 150 Q216 112 188 96 Q200 124 178 140 Q190 150 194 150" fill="#b7efe4" opacity=".95"/>' +
      '<path d="M158 206 Q210 196 202 156 L188 168 Q196 188 164 198 Z" fill="#5ecfb4"/>' +
      '<path d="M200 156 L214 146 L208 168 Z" fill="#ffe27a"/>' +
      '<ellipse cx="120" cy="202" rx="52" ry="34" fill="#6fd8bf"/>' +
      '<ellipse cx="120" cy="210" rx="30" ry="18" fill="#e8fff8"/>' +
      '<path d="M96 70 L108 40 L118 72 Z" fill="#ffe27a" stroke="#e7a11a" stroke-width="1.4"/>' +
      '<path d="M144 70 L132 40 L122 72 Z" fill="#ffe27a" stroke="#e7a11a" stroke-width="1.4"/>' +
      '<circle cx="120" cy="128" r="58" fill="#7ee0c6"/>' +
      shine(104, 108) +
      eye(100, 122) + eye(142, 122) +
      blush(76, 148) + blush(164, 148) +
      '<ellipse cx="120" cy="156" rx="24" ry="16" fill="#e7fff8"/>' +
      '<circle cx="112" cy="152" r="3" fill="#2f8f78"/>' +
      '<circle cx="128" cy="152" r="3" fill="#2f8f78"/>' +
      '<path d="M104 166 Q120 180 136 166" fill="none" stroke="#2f8f78" stroke-width="2.6" stroke-linecap="round"/>' +
      star(168, 92, 10)
    );
  }

  var DRAW = { dog: dog, cat: cat, bunny: bunny, fox: fox, panda: panda, dragon: dragon };

  MY.petSVG = function (type, level) {
    var fn = DRAW[type] || DRAW.panda;
    return fn(level || 1);
  };

  function petals(cx, cy, n, rx, ry, fill) {
    var h = '';
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      var x = cx + Math.cos(a) * 14;
      var y = cy + Math.sin(a) * 14;
      h += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '" transform="rotate(' + Math.round(a * 180 / Math.PI) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
    }
    return h;
  }

  MY.plantSVG = function (type) {
    if (type === 'sunflower') {
      return '<svg viewBox="0 0 80 96">' +
        '<rect x="37" y="50" width="6" height="36" rx="3" fill="#3d8f45"/>' +
        '<ellipse cx="26" cy="68" rx="12" ry="6" fill="#4caf50" transform="rotate(-32 26 68)"/>' +
        '<ellipse cx="56" cy="64" rx="12" ry="6" fill="#66bb6a" transform="rotate(28 56 64)"/>' +
        petals(40, 34, 12, 7, 13, '#ffd54a') +
        '<circle cx="40" cy="34" r="12" fill="#f6a21a"/>' +
        '<circle cx="40" cy="34" r="8" fill="#c47b12"/>' +
        '<circle cx="37" cy="31" r="2.2" fill="#ffe7a3"/>' +
        '</svg>';
    }
    if (type === 'wallnut') {
      return '<svg viewBox="0 0 80 96">' +
        '<ellipse cx="40" cy="78" rx="16" ry="5" fill="#000" opacity=".12"/>' +
        '<ellipse cx="40" cy="52" rx="24" ry="28" fill="#c4a484"/>' +
        '<ellipse cx="40" cy="50" rx="18" ry="22" fill="#a98462"/>' +
        '<ellipse cx="32" cy="40" rx="8" ry="5" fill="#fff" opacity=".28" transform="rotate(-20 32 40)"/>' +
        '<circle cx="32" cy="48" r="3.2" fill="#3e342c"/>' +
        '<circle cx="48" cy="48" r="3.2" fill="#3e342c"/>' +
        '<circle cx="33" cy="47" r="1.1" fill="#fff"/>' +
        '<circle cx="49" cy="47" r="1.1" fill="#fff"/>' +
        '<path d="M34 58 Q40 63 46 58" fill="none" stroke="#5c4636" stroke-width="2" stroke-linecap="round"/>' +
        '<ellipse cx="28" cy="56" rx="5" ry="3" fill="#e7b2a4" opacity=".45"/>' +
        '<ellipse cx="52" cy="56" rx="5" ry="3" fill="#e7b2a4" opacity=".45"/>' +
        '<path d="M40 24 Q48 16 44 28" fill="#67b36a"/>' +
        '</svg>';
    }
    if (type === 'cherry') {
      return '<svg viewBox="0 0 80 96">' +
        '<path d="M40 28 C40 18 52 14 56 22" fill="none" stroke="#3d8f45" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path d="M40 36 C34 18 22 20 28 30" fill="none" stroke="#3d8f45" stroke-width="2.4" stroke-linecap="round"/>' +
        '<ellipse cx="58" cy="18" rx="8" ry="4" fill="#66bb6a" transform="rotate(30 58 18)"/>' +
        '<circle cx="28" cy="62" r="16" fill="#ef5350"/>' +
        '<circle cx="50" cy="66" r="16" fill="#e53935"/>' +
        '<ellipse cx="22" cy="56" rx="5" ry="3" fill="#fff" opacity=".55" transform="rotate(-30 22 56)"/>' +
        '<ellipse cx="44" cy="60" rx="5" ry="3" fill="#fff" opacity=".5" transform="rotate(-24 44 60)"/>' +
        '<path d="M22 66 Q28 70 32 66" fill="none" stroke="#b71c1c" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>' +
        '</svg>';
    }
    return '';
  };
})(window.MY = window.MY || {});
