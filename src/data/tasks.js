/* 任务、能力维度、生日。
   内容迁自仓库根目录 index.html，诗句、菜名、数值保持原样。 */
(function (MY) {
  'use strict';
  MY.TASK_GROUPS = [
  {
    "key": "must",
    "icon": "🥢",
    "bg": "rgba(255,82,82,.15)",
    "tasks": [
      {
        "id": "homework",
        "name": "语数英校内作业",
        "dish": "经典毛肚",
        "reward": 30,
        "meta": "脆嫩爽口，必点招牌"
      },
      {
        "id": "baji",
        "name": "八极拳",
        "dish": "脆虾滑",
        "reward": 85,
        "meta": "劲道Q弹，招牌必点"
      }
    ]
  },
  {
    "key": "veg",
    "icon": "🥬",
    "bg": "rgba(76,175,80,.15)",
    "tasks": [
      {
        "id": "zaodu",
        "name": "早读",
        "dish": "田园菠菜",
        "reward": 16,
        "meta": "清脆健康，点了背诗"
      },
      {
        "id": "wandu",
        "name": "晚读",
        "dish": "翠绿水芹",
        "reward": 14,
        "meta": "清爽可口，复习一下"
      },
      {
        "id": "reading",
        "name": "阅读理解",
        "dish": "茼蒿",
        "reward": 18,
        "meta": "清香入味，读懂文章"
      }
    ]
  },
  {
    "key": "snack",
    "icon": "🍢",
    "bg": "rgba(255,152,0,.15)",
    "tasks": [
      {
        "id": "thinking",
        "name": "思维课",
        "dish": "现炸小酥肉",
        "reward": 22,
        "meta": "外酥里嫩，烧脑必备"
      },
      {
        "id": "dino",
        "name": "迪诺",
        "dish": "红糖糍粑",
        "reward": 17,
        "meta": "香甜软糯，坚持打卡"
      },
      {
        "id": "oral",
        "name": "口算",
        "dish": "手工拉面",
        "reward": 15,
        "meta": "劲道爽滑，每天一练"
      },
      {
        "id": "baicixuan",
        "name": "百词斩",
        "dish": "龙抄手",
        "reward": 19,
        "meta": "皮薄馅嫩，背单词"
      },
      {
        "id": "dictation",
        "name": "听写",
        "dish": "手搓冰粉",
        "reward": 13,
        "meta": "冰爽解辣，生字听写"
      },
      {
        "id": "handwriting",
        "name": "练字",
        "dish": "香酥油条",
        "reward": 12,
        "meta": "金黄酥脆，写好字"
      },
      {
        "id": "reading2",
        "name": "阅读",
        "dish": "南瓜饼",
        "reward": 20,
        "meta": "香甜可口，课外阅读"
      },
      {
        "id": "teacher",
        "name": "小老师",
        "dish": "千张豆皮",
        "reward": 21,
        "meta": "嚼劲十足，讲给爸妈"
      }
    ]
  }
];
  MY.GROUP_TITLES = { must: '🥢 招牌必点', veg: '🥬 时蔬拼盘', snack: '🍢 特色小食' };
  MY.ALL_TASKS = MY.TASK_GROUPS.flatMap(function (g) { return g.tasks; });
  MY.CORE_ATTRS = [
  {
    "key": "道德修养",
    "icon": "🛡️",
    "desc": "品德修养",
    "tasks": [
      "baji"
    ]
  },
  {
    "key": "学业水平",
    "icon": "📚",
    "desc": "语数英成绩",
    "tasks": [
      "homework",
      "oral",
      "reading",
      "baicixuan",
      "dictation"
    ]
  },
  {
    "key": "身心健康",
    "icon": "💪",
    "desc": "体育锻炼",
    "tasks": [
      "baji",
      "wandu"
    ]
  },
  {
    "key": "艺术素养",
    "icon": "🎨",
    "desc": "文学鉴赏",
    "tasks": [
      "zaodu",
      "handwriting"
    ]
  },
  {
    "key": "劳动意识",
    "icon": "🌱",
    "desc": "日常劳动",
    "tasks": [
      "dino"
    ]
  },
  {
    "key": "实践创新",
    "icon": "💡",
    "desc": "创新思维",
    "tasks": [
      "thinking",
      "teacher"
    ]
  },
  {
    "key": "交流合作",
    "icon": "🤝",
    "desc": "沟通合作",
    "tasks": [
      "zaodu",
      "reading",
      "teacher"
    ]
  },
  {
    "key": "自主学习",
    "icon": "📖",
    "desc": "自我管理",
    "tasks": [
      "zaodu",
      "wandu",
      "reading",
      "oral",
      "homework",
      "reading2",
      "handwriting"
    ]
  }
];
  MY.BIRTHDAY = new Date(2016, 10, 3);
  MY.taskById = function (id) {
    return MY.ALL_TASKS.filter(function (t) { return t.id === id; })[0] || null;
  };
})(window.MY = window.MY || {});
