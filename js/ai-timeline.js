/* ============================================================
   PulseOS AI Timeline
   Live event generation and rendering engine
   ============================================================ */

(function () {
  'use strict';

  var container = null;
  var events = [];
  var genInterval = null;
  var filterType = 'all';

  /* type → dot class mapping */
  var dotClasses = {
    'info':      'info',
    'warning':   'warning',
    'success':   'success',
    'alert':     'danger',
    'ai-action': 'ai'
  };

  /* type → badge text */
  var typeBadges = {
    'info':      '🔵 INFO',
    'warning':   '🟡 WARNING',
    'success':   '🟢 SUCCESS',
    'alert':     '🔴 ALERT',
    'ai-action': '🟣 AI ACTION'
  };

  /* filter mapping */
  var filterMap = {
    'all':        null,
    'crowd':      ['info', 'warning'],
    'security':   ['alert'],
    'medical':    ['alert'],
    'transport':  ['warning', 'info'],
    'ai-actions': ['ai-action'],
    'operations': ['success', 'info']
  };

  /* ---------- render a single event ---------- */
  function renderEvent(ev, prepend) {
    if (!container) return;
    /* filter check */
    var allowed = filterMap[filterType];
    if (allowed && allowed.indexOf(ev.type) === -1) return;

    var el = document.createElement('div');
    el.className = 'timeline-event';
    el.innerHTML =
      '<div class="timeline-dot ' + (dotClasses[ev.type] || 'info') + '"></div>' +
      '<div class="timeline-time">' + ev.time + ' — ' + (typeBadges[ev.type] || '🔵 INFO') + '</div>' +
      '<div class="timeline-content">' +
        '<div class="timeline-title">' + ev.title + '</div>' +
        '<div class="timeline-desc">' + ev.desc + '</div>' +
        '<div class="timeline-ai-badge">🤖 AI: ' + ev.ai + '</div>' +
      '</div>';

    if (prepend) {
      container.insertBefore(el, container.firstChild);
    } else {
      container.appendChild(el);
    }
  }

  /* ---------- render all ---------- */
  function renderAll() {
    if (!container) return;
    container.innerHTML = '';
    events.forEach(function (ev) { renderEvent(ev, false); });
  }

  /* ---------- generate new event ---------- */
  function generateAndAdd() {
    if (!window.PulseData || !window.PulseData._generateEvent) return;
    var ev = window.PulseData._generateEvent();
    events.unshift(ev);
    /* keep max 50 events */
    if (events.length > 50) events.pop();
    /* also push to PulseData timeline */
    if (window.PulseData.timeline) {
      window.PulseData.timeline.unshift(ev);
      if (window.PulseData.timeline.length > 50) window.PulseData.timeline.pop();
    }
    renderEvent(ev, true);
    /* auto-scroll */
    if (container) container.scrollTop = 0;
  }

  /* ---------- public API ---------- */
  window.AITimeline = {
    init: function (containerEl) {
      container = containerEl;
      /* load baseline from PulseData */
      if (window.PulseData && window.PulseData.timeline) {
        events = window.PulseData.timeline.slice();
      }
      renderAll();
    },

    start: function () {
      if (genInterval) return;
      /* generate a new event every 8-10 seconds */
      function schedule() {
        var delay = 8000 + Math.random() * 2000;
        genInterval = setTimeout(function () {
          generateAndAdd();
          schedule();
        }, delay);
      }
      schedule();
    },

    stop: function () {
      if (genInterval) {
        clearTimeout(genInterval);
        genInterval = null;
      }
    },

    setFilter: function (type) {
      filterType = type || 'all';
      renderAll();
    },

    getEvents: function () { return events; },

    addEvent: function (ev) {
      events.unshift(ev);
      if (events.length > 50) events.pop();
      renderEvent(ev, true);
    }
  };

})();
