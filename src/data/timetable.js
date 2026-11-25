/* 今日课表。示例数据，改 MY.TIMETABLE.week 即可换成牧橒的正式课表。
   week 的键是星期：1 周一 … 5 周五。0 周日、6 周六没有校内课。 */
(function (MY) {
  'use strict';

  MY.TIMETABLE = {
    placeholder: true,
    note: '示例课表，待换成牧橒的正式课表',
    periods: [
      { n: 1, start: '08:20', end: '09:00' },
      { n: 2, start: '09:10', end: '09:50' },
      { n: 3, start: '10:10', end: '10:50' },
      { n: 4, start: '11:00', end: '11:40' },
      { n: 5, start: '14:00', end: '14:40' },
      { n: 6, start: '14:50', end: '15:30' },
      { n: 7, start: '16:40', end: '17:20', interest: true }
    ],
    week: {
      1: ['语文', '数学', '英语', '体育', '语文', '阅读', '八极拳'],
      2: ['数学', '语文', '英语', '语文', '数学', '体育', '八极拳'],
      3: ['语文', '英语', '数学', '体育', '阅读', '英语', '思维课'],
      4: ['数学', '语文', '英语', '阅读', '数学', '体育', '八极拳'],
      5: ['语文', '数学', '英语', '体育', '语文', '阅读', '八极拳']
    }
  };

  function minutes(hm) {
    var p = String(hm).split(':');
    return (+p[0]) * 60 + (+p[1] || 0);
  }

  MY.todayClasses = function (now) {
    now = now || new Date();
    var day = now.getDay();
    var subjects = MY.TIMETABLE.week[day] || null;
    var cur = now.getHours() * 60 + now.getMinutes();
    var list = MY.TIMETABLE.periods.map(function (slot, i) {
      var start = minutes(slot.start);
      var end = minutes(slot.end);
      var state = 'later';
      if (cur >= end) state = 'past';
      else if (cur >= start) state = 'now';
      return {
        n: slot.n,
        start: slot.start,
        end: slot.end,
        interest: !!slot.interest,
        subject: subjects ? subjects[i] : '',
        state: state
      };
    });
    return { day: day, inSchool: !!subjects, list: list, note: MY.TIMETABLE.note };
  };
})(window.MY = window.MY || {});
