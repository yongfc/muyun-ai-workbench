/* 宠物、种子与原版 SVG。
   内容迁自仓库根目录 index.html，诗句、菜名、数值保持原样。 */
(function (MY) {
  'use strict';
  MY.SEEDS = [
  {
    "id": "sunflower",
    "name": "向日葵",
    "cost": 50
  },
  {
    "id": "wallnut",
    "name": "坚果",
    "cost": 50
  },
  {
    "id": "cherry",
    "name": "樱桃",
    "cost": 150
  }
];
  MY.PET_TYPES = [
  {
    "id": "dog",
    "name": "小汪",
    "cost": 100,
    "rarity": "normal"
  },
  {
    "id": "cat",
    "name": "小橘",
    "cost": 100,
    "rarity": "normal"
  },
  {
    "id": "bunny",
    "name": "团团",
    "cost": 200,
    "rarity": "rare"
  },
  {
    "id": "fox",
    "name": "火狐",
    "cost": 200,
    "rarity": "rare"
  },
  {
    "id": "panda",
    "name": "毛毛",
    "cost": 400,
    "rarity": "epic"
  },
  {
    "id": "dragon",
    "name": "小龙",
    "cost": 800,
    "rarity": "legend"
  }
];
  MY.RARITY = {
  "normal": {
    "l": "普通",
    "c": "r-normal"
  },
  "rare": {
    "l": "稀有",
    "c": "r-rare"
  },
  "epic": {
    "l": "史诗",
    "c": "r-epic"
  },
  "legend": {
    "l": "传说",
    "c": "r-legend"
  }
};
  function plantSVG(t){if(t==='sunflower')return'<svg viewBox="0 0 60 70" style="width:100%;height:100%"><rect x="25" y="45" width="10" height="20" fill="#4CAF50" rx="2"/><ellipse cx="30" cy="30" rx="16" ry="16" fill="#FFD54F"/><circle cx="30" cy="30" r="8" fill="#8D6E63"/></svg>';if(t==='wallnut')return'<svg viewBox="0 0 60 70" style="width:100%;height:100%"><ellipse cx="30" cy="40" rx="18" ry="22" fill="#A1887F"/><ellipse cx="30" cy="38" rx="14" ry="18" fill="#8D6E63"/><circle cx="24" cy="35" r="2.5" fill="#2E3D2F"/><circle cx="36" cy="35" r="2.5" fill="#2E3D2F"/></svg>';if(t==='cherry')return'<svg viewBox="0 0 60 70" style="width:100%;height:100%"><circle cx="22" cy="45" r="12" fill="#EF5350"/><circle cx="38" cy="45" r="12" fill="#E53935"/><path d="M30 33 Q30 20 35 15" stroke="#4CAF50" stroke-width="2.5" fill="none"/></svg>';return'';}
function petSVG(type,level){
  const lv=level||1;
  const crown=lv>=3?'<g class="pe-crown"><path d="M47 18 L53 8 L60 15 L67 8 L73 18 L71 24 L49 24 Z" fill="#FFD54F" stroke="#F9A825" stroke-width="1.6" stroke-linejoin="round"/><circle cx="60" cy="12" r="2.2" fill="#FF8A80"/></g>':'';
  const halo=lv>=5?'<ellipse cx="60" cy="7" rx="17" ry="5.5" fill="none" stroke="#FFD54F" stroke-width="2.4" opacity=".75"/>':'';
  const deco=crown+halo;
  const eyeW=(x,y)=>'<g class="pe-eye"><circle cx="'+x+'" cy="'+y+'" r="5" fill="#fff"/><circle cx="'+x+'" cy="'+(y+0.6)+'" r="2.9" fill="#2b2b2b"/><circle cx="'+(x+1.2)+'" cy="'+(y-1)+'" r="1.1" fill="#fff"/></g>';
  const eyeD=(x,y,c)=>'<g class="pe-eye"><circle cx="'+x+'" cy="'+y+'" r="4.8" fill="'+(c||'#3b2d27')+'"/><circle cx="'+(x+1.4)+'" cy="'+(y-1.4)+'" r="1.6" fill="#fff"/><circle cx="'+(x-1.2)+'" cy="'+(y+1.2)+'" r="0.8" fill="#fff" opacity=".8"/></g>';
  const blush=(x,y)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="6.4" ry="3.6" fill="#ff9fb0" opacity=".55"/>';
  const W=(inner)=>'<svg viewBox="0 0 120 120" style="width:100%;height:100%">'+inner+deco+'</svg>';
  if(type==='panda')return W(
    '<g class="pe-earL"><circle cx="33" cy="31" r="14" fill="#3a3a3a"/><circle cx="33" cy="31" r="6.5" fill="#5c5c5c"/></g>'+
    '<g class="pe-earR"><circle cx="87" cy="31" r="14" fill="#3a3a3a"/><circle cx="87" cy="31" r="6.5" fill="#5c5c5c"/></g>'+
    '<ellipse cx="60" cy="99" rx="25" ry="13" fill="#3a3a3a"/>'+
    '<circle cx="46" cy="108" r="8" fill="#3a3a3a"/><circle cx="74" cy="108" r="8" fill="#3a3a3a"/>'+
    '<circle cx="60" cy="61" r="36" fill="#ffffff"/>'+
    '<ellipse cx="45" cy="57" rx="10" ry="12" fill="#3a3a3a" transform="rotate(-12 45 57)"/>'+
    '<ellipse cx="75" cy="57" rx="10" ry="12" fill="#3a3a3a" transform="rotate(12 75 57)"/>'+
    eyeW(46,55)+eyeW(74,55)+
    '<ellipse cx="60" cy="72" rx="5.6" ry="4" fill="#3a3a3a"/>'+
    '<path d="M53.5 80 Q60 84.5 66.5 80" stroke="#3a3a3a" stroke-width="2.2" fill="none" stroke-linecap="round"/>'+
    blush(35,70)+blush(85,70)+
    '<g class="pe-bamboo"><rect x="94" y="60" width="7" height="36" rx="3.2" fill="#57b25e" transform="rotate(14 97 78)"/><rect x="96" y="70" width="7" height="2.4" fill="#3f9148" transform="rotate(14 97 78)"/><path d="M97 64 q11 -9 15 -2 q-9 7 -15 2 Z" fill="#7ccc7f"/></g>');
  if(type==='cat')return W(
    '<g class="pe-earL"><path d="M30 40 L36 14 L55 31 Z" fill="#f5a04b"/><path d="M35 34 L38.5 21 L49 29.5 Z" fill="#ffd9c4"/></g>'+
    '<g class="pe-earR"><path d="M90 40 L84 14 L65 31 Z" fill="#f5a04b"/><path d="M85 34 L81.5 21 L71 29.5 Z" fill="#ffd9c4"/></g>'+
    '<g class="pe-tail"><path d="M90 96 Q112 92 108 68 Q107 62 101 63 Q105 76 98 84 Q90 90 84 90 Z" fill="#f5a04b"/><path d="M108 68 Q107 62 101 63 Q103 69 104 74 Z" fill="#e0863a"/></g>'+
    '<ellipse cx="60" cy="98" rx="24" ry="13" fill="#f5a04b"/>'+
    '<circle cx="60" cy="60" r="34" fill="#f8b968"/>'+
    '<rect x="53" y="26" width="4" height="12" rx="2" fill="#e0863a"/><rect x="60" y="24" width="4" height="13" rx="2" fill="#e0863a" transform="translate(-2 0)"/><rect x="66" y="26" width="4" height="12" rx="2" fill="#e0863a"/>'+
    eyeD(46,56,'#5a3b1e')+eyeD(74,56,'#5a3b1e')+
    '<ellipse cx="60" cy="74" rx="14" ry="9.5" fill="#fff4e6"/>'+
    '<path d="M56.5 69 L63.5 69 L60 73.5 Z" fill="#ff8fa3"/>'+
    '<path d="M53 78 Q56.5 81 60 78.5 Q63.5 81 67 78" stroke="#c98a4e" stroke-width="1.8" fill="none" stroke-linecap="round"/>'+
    '<path d="M28 62 L42 64 M28 70 L42 69 M92 62 L78 64 M92 70 L78 69" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>'+
    blush(38,68)+blush(82,68));
  if(type==='dog')return W(
    '<g class="pe-earL"><ellipse cx="29" cy="52" rx="11" ry="19" fill="#8d5a34" transform="rotate(16 29 52)"/></g>'+
    '<g class="pe-earR"><ellipse cx="91" cy="52" rx="11" ry="19" fill="#8d5a34" transform="rotate(-16 91 52)"/></g>'+
    '<g class="pe-tail"><path d="M88 92 Q104 86 102 70 Q108 82 96 94 Z" fill="#c98a4e"/></g>'+
    '<ellipse cx="60" cy="98" rx="24" ry="13" fill="#c98a4e"/>'+
    '<circle cx="60" cy="60" r="33" fill="#d99a5b"/>'+
    '<circle cx="75" cy="52" r="12" fill="#8d5a34" opacity=".45"/>'+
    eyeD(46,56)+eyeD(74,56)+
    '<ellipse cx="60" cy="74" rx="15" ry="10.5" fill="#f7e3c8"/>'+
    '<circle cx="60" cy="68" r="4.4" fill="#4a3325"/>'+
    '<path d="M53 76 Q60 80 67 76" stroke="#4a3325" stroke-width="2" fill="none" stroke-linecap="round"/>'+
    '<g class="pe-tongue"><path d="M56 78 Q56 88 60 88 Q64 88 64 78 Z" fill="#ff8fa3"/><path d="M60 79 L60 86" stroke="#e0708a" stroke-width="1.4"/></g>'+
    blush(38,66)+blush(82,66));
  if(type==='bunny')return W(
    '<g class="pe-earL"><rect x="40" y="2" width="15" height="42" rx="7.5" fill="#ffffff" stroke="#e8e0e0" stroke-width="1.5"/><rect x="44" y="9" width="7" height="28" rx="3.5" fill="#ffc7d4"/></g>'+
    '<g class="pe-earR"><rect x="65" y="2" width="15" height="42" rx="7.5" fill="#ffffff" stroke="#e8e0e0" stroke-width="1.5" transform="rotate(20 72 23)"/><rect x="69" y="9" width="7" height="28" rx="3.5" fill="#ffc7d4" transform="rotate(20 72 23)"/></g>'+
    '<ellipse cx="60" cy="99" rx="23" ry="12" fill="#ffffff"/>'+
    '<circle cx="60" cy="63" r="32" fill="#ffffff"/>'+
    eyeD(47,59)+eyeD(73,59)+
    '<path d="M56.5 68 L63.5 68 L60 72.5 Z" fill="#ff9fb0"/>'+
    '<rect x="55.5" y="76" width="4.2" height="7" rx="1.6" fill="#fff" stroke="#e0d5d5" stroke-width="1.2"/>'+
    '<rect x="60.3" y="76" width="4.2" height="7" rx="1.6" fill="#fff" stroke="#e0d5d5" stroke-width="1.2"/>'+
    '<ellipse cx="40" cy="71" rx="7" ry="4" fill="#ffb3c2" opacity=".7"/>'+
    '<ellipse cx="80" cy="71" rx="7" ry="4" fill="#ffb3c2" opacity=".7"/>');
  if(type==='fox')return W(
    '<g class="pe-earL"><path d="M30 38 L37 10 L56 30 Z" fill="#f0823c"/><path d="M34 32 L38 16 L50 27 Z" fill="#ffe3cc"/><path d="M30 38 L33 24 L40 32 Z" fill="#4a3325" opacity=".55"/></g>'+
    '<g class="pe-earR"><path d="M90 38 L83 10 L64 30 Z" fill="#f0823c"/><path d="M86 32 L82 16 L70 27 Z" fill="#ffe3cc"/><path d="M90 38 L87 24 L80 32 Z" fill="#4a3325" opacity=".55"/></g>'+
    '<g class="pe-tail"><path d="M88 98 Q116 92 112 62 Q120 88 100 102 Q92 106 84 102 Z" fill="#f0823c"/><path d="M112 62 Q115 72 112 80 Q108 72 104 68 Z" fill="#fff1e2"/></g>'+
    '<ellipse cx="60" cy="98" rx="24" ry="13" fill="#f0823c"/>'+
    '<circle cx="60" cy="60" r="33" fill="#f08a44"/>'+
    '<path d="M30 62 Q34 84 60 86 Q86 84 90 62 Q82 74 60 74 Q38 74 30 62 Z" fill="#fff1e2"/>'+
    eyeD(46,54,'#4a2c14')+eyeD(74,54,'#4a2c14')+
    '<circle cx="60" cy="72" r="4" fill="#3b2d27"/>'+
    '<path d="M54 78 Q60 82 66 78" stroke="#3b2d27" stroke-width="2" fill="none" stroke-linecap="round"/>'+
    blush(39,64)+blush(81,64));
  if(type==='dragon')return W(
    '<g class="pe-tail"><path d="M88 96 Q112 90 108 66 L100 72 Q104 86 90 92 Z" fill="#4db89b"/><path d="M108 66 L114 60 L112 70 Z" fill="#FFD54F"/></g>'+
    '<g class="pe-wing"><path d="M22 78 Q10 62 20 48 Q26 60 34 66 Q28 72 22 78 Z" fill="#8fd8e8" opacity=".9"/></g>'+
    '<g class="pe-wing"><path d="M98 78 Q110 62 100 48 Q94 60 86 66 Q92 72 98 78 Z" fill="#8fd8e8" opacity=".9"/></g>'+
    '<ellipse cx="60" cy="98" rx="24" ry="13" fill="#4db89b"/>'+
    '<ellipse cx="60" cy="100" rx="14" ry="8" fill="#c8f0dd"/>'+
    '<path d="M42 26 L46 10 L52 22 Z" fill="#FFD54F" stroke="#F9A825" stroke-width="1.4"/>'+
    '<path d="M78 26 L74 10 L68 22 Z" fill="#FFD54F" stroke="#F9A825" stroke-width="1.4"/>'+
    '<path d="M54 22 L57 14 L60 21 Z" fill="#3aa386"/><path d="M60 21 L63 14 L66 22 Z" fill="#3aa386"/>'+
    '<circle cx="60" cy="60" r="33" fill="#6fd0b2"/>'+
    eyeD(46,55,'#7a4a12')+eyeD(74,55,'#7a4a12')+
    '<ellipse cx="60" cy="74" rx="14" ry="9.5" fill="#c8f0dd"/>'+
    '<circle cx="55.5" cy="71" r="1.8" fill="#2e7a5e"/><circle cx="64.5" cy="71" r="1.8" fill="#2e7a5e"/>'+
    '<path d="M52 78 Q60 84 68 78" stroke="#2e7a5e" stroke-width="2.2" fill="none" stroke-linecap="round"/>'+
    blush(38,64)+blush(82,64));
  return W('<circle cx="60" cy="60" r="30" fill="#eee"/>');
}

  MY.plantSVG = plantSVG;
  MY.petSVG = petSVG;
})(window.MY = window.MY || {});
