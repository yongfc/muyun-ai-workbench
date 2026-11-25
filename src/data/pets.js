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
  
})(window.MY = window.MY || {});
