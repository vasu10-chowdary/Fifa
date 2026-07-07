/* ============================================================
   PulseOS Charts Library
   Custom SVG chart rendering for the command center
   ============================================================ */

(function () {
  'use strict';

  var COLORS = {
    blue:   '#3b82f6',
    cyan:   '#06b6d4',
    green:  '#10b981',
    purple: '#8b5cf6',
    amber:  '#f59e0b',
    red:    '#ef4444',
    text:   '#8892a4',
    muted:  '#3d4556',
    bg:     '#12121e'
  };

  /* ---------- utility ---------- */
  function el(tag, attrs, ns) {
    var svgNS = 'http://www.w3.org/2000/svg';
    var node = document.createElementNS(ns || svgNS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        node.setAttribute(k, attrs[k]);
      });
    }
    return node;
  }

  function clearContainer(container) {
    while (container.firstChild) container.removeChild(container.firstChild);
  }

  function getMax(arr) { return Math.max.apply(null, arr); }
  function getMin(arr) { return Math.min.apply(null, arr); }

  /* =====================
     1. SPARKLINE
     ===================== */
  function sparkline(container, data, color) {
    if (!container || !data || data.length < 2) return;
    clearContainer(container);
    var w = 120, h = 32;
    var svg = el('svg', { viewBox: '0 0 ' + w + ' ' + h, preserveAspectRatio: 'none', width: '100%', height: '100%' });
    var max = getMax(data), min = getMin(data);
    var range = max - min || 1;
    var points = data.map(function (v, i) {
      var x = (i / (data.length - 1)) * w;
      var y = h - ((v - min) / range) * (h - 4) - 2;
      return x + ',' + y;
    });
    /* gradient fill */
    var defs = el('defs');
    var grad = el('linearGradient', { id: 'spark-' + Math.random().toString(36).substr(2, 6), x1: '0', y1: '0', x2: '0', y2: '1' });
    var stop1 = el('stop', { offset: '0%', 'stop-color': color || COLORS.cyan, 'stop-opacity': '0.3' });
    var stop2 = el('stop', { offset: '100%', 'stop-color': color || COLORS.cyan, 'stop-opacity': '0' });
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    /* area */
    var areaPath = 'M0,' + h + ' L' + points.join(' L') + ' L' + w + ',' + h + ' Z';
    var area = el('path', { d: areaPath, fill: 'url(#' + grad.id + ')' });
    svg.appendChild(area);

    /* line */
    var linePath = 'M' + points.join(' L');
    var line = el('path', {
      d: linePath, fill: 'none', stroke: color || COLORS.cyan,
      'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    });
    var totalLen = data.length * 10;
    line.style.strokeDasharray = totalLen;
    line.style.strokeDashoffset = totalLen;
    line.style.animation = 'drawLine 1s ease forwards';
    svg.appendChild(line);

    /* end dot */
    var lastX = (data.length - 1) / (data.length - 1) * w;
    var lastY = h - ((data[data.length - 1] - min) / range) * (h - 4) - 2;
    var dot = el('circle', { cx: lastX, cy: lastY, r: '2', fill: color || COLORS.cyan });
    svg.appendChild(dot);

    container.appendChild(svg);
    return svg;
  }

  /* =====================
     2. LINE CHART
     ===================== */
  function lineChart(container, data, options) {
    if (!container || !data || data.length < 2) return;
    clearContainer(container);
    var opts = options || {};
    var w = opts.width || 400, h = opts.height || 200;
    var pad = { top: 20, right: 20, bottom: 30, left: 40 };
    var cw = w - pad.left - pad.right;
    var ch = h - pad.top - pad.bottom;
    var svg = el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: '100%', height: '100%' });

    var max = getMax(data) * 1.1;
    var min = getMin(data) * 0.9;
    var range = max - min || 1;

    /* grid lines */
    for (var gi = 0; gi <= 4; gi++) {
      var gy = pad.top + ch - (gi / 4) * ch;
      var gridLine = el('line', {
        x1: pad.left, y1: gy, x2: pad.left + cw, y2: gy,
        stroke: 'rgba(255,255,255,0.05)', 'stroke-width': '1'
      });
      svg.appendChild(gridLine);
      var label = el('text', {
        x: pad.left - 8, y: gy + 4,
        fill: COLORS.muted, 'font-size': '9', 'text-anchor': 'end', 'font-family': 'Inter, sans-serif'
      });
      label.textContent = Math.round(min + (gi / 4) * range);
      svg.appendChild(label);
    }

    var color = opts.color || COLORS.cyan;
    var points = data.map(function (v, i) {
      var x = pad.left + (i / (data.length - 1)) * cw;
      var y = pad.top + ch - ((v - min) / range) * ch;
      return { x: x, y: y };
    });

    /* gradient fill if requested */
    if (opts.fill !== false) {
      var defs = el('defs');
      var gradId = 'line-fill-' + Math.random().toString(36).substr(2, 6);
      var grad = el('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '0', y2: '1' });
      grad.appendChild(el('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': '0.2' }));
      grad.appendChild(el('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': '0' }));
      defs.appendChild(grad);
      svg.appendChild(defs);
      var areaD = 'M' + points[0].x + ',' + (pad.top + ch);
      points.forEach(function (p) { areaD += ' L' + p.x + ',' + p.y; });
      areaD += ' L' + points[points.length - 1].x + ',' + (pad.top + ch) + ' Z';
      svg.appendChild(el('path', { d: areaD, fill: 'url(#' + gradId + ')' }));
    }

    /* line */
    var d = 'M' + points.map(function (p) { return p.x + ',' + p.y; }).join(' L');
    var path = el('path', {
      d: d, fill: 'none', stroke: color,
      'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    });
    svg.appendChild(path);

    /* dots */
    if (opts.dots !== false) {
      points.forEach(function (p, i) {
        var dot = el('circle', {
          cx: p.x, cy: p.y, r: '3',
          fill: COLORS.bg, stroke: color, 'stroke-width': '1.5'
        });
        dot.style.opacity = '0';
        dot.style.animation = 'fadeIn 0.3s ease ' + (i * 40) + 'ms forwards';
        svg.appendChild(dot);
      });
    }

    /* threshold line */
    if (opts.threshold !== undefined) {
      var ty = pad.top + ch - ((opts.threshold - min) / range) * ch;
      svg.appendChild(el('line', {
        x1: pad.left, y1: ty, x2: pad.left + cw, y2: ty,
        stroke: COLORS.red, 'stroke-width': '1', 'stroke-dasharray': '4 3', opacity: '0.6'
      }));
    }

    container.appendChild(svg);
    return svg;
  }

  /* =====================
     3. BAR CHART
     ===================== */
  function barChart(container, data, options) {
    if (!container || !data || data.length === 0) return;
    clearContainer(container);
    var opts = options || {};
    var w = opts.width || 400, h = opts.height || 200;
    var pad = { top: 20, right: 10, bottom: 30, left: 40 };
    var cw = w - pad.left - pad.right;
    var ch = h - pad.top - pad.bottom;
    var svg = el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: '100%', height: '100%' });

    var values = data.map(function (d) { return typeof d === 'object' ? d.value : d; });
    var labels = data.map(function (d, i) { return typeof d === 'object' ? d.label : String(i); });
    var max = getMax(values) * 1.15 || 1;
    var barW = (cw / values.length) * 0.6;
    var gap = (cw / values.length) * 0.4;
    var colors = opts.colors || [COLORS.blue, COLORS.cyan, COLORS.green, COLORS.purple, COLORS.amber, COLORS.red];

    /* grid */
    for (var gi = 0; gi <= 4; gi++) {
      var gy = pad.top + ch - (gi / 4) * ch;
      svg.appendChild(el('line', {
        x1: pad.left, y1: gy, x2: pad.left + cw, y2: gy,
        stroke: 'rgba(255,255,255,0.05)', 'stroke-width': '1'
      }));
    }

    values.forEach(function (v, i) {
      var bh = (v / max) * ch;
      var x = pad.left + i * (barW + gap) + gap / 2;
      var y = pad.top + ch - bh;
      var color = colors[i % colors.length];

      var rect = el('rect', {
        x: x, y: pad.top + ch, width: barW, height: 0,
        rx: 3, fill: color, opacity: '0.85'
      });
      rect.style.transition = 'none';
      svg.appendChild(rect);
      /* animate */
      setTimeout(function () {
        rect.setAttribute('y', y);
        rect.setAttribute('height', bh);
        rect.style.transition = 'y 0.6s cubic-bezier(0.16,1,0.3,1), height 0.6s cubic-bezier(0.16,1,0.3,1)';
      }, 50 + i * 60);

      /* label */
      var lbl = el('text', {
        x: x + barW / 2, y: pad.top + ch + 16,
        fill: COLORS.muted, 'font-size': '8', 'text-anchor': 'middle', 'font-family': 'Inter, sans-serif'
      });
      lbl.textContent = labels[i];
      svg.appendChild(lbl);
    });

    container.appendChild(svg);
    return svg;
  }

  /* =====================
     4. HORIZONTAL BAR CHART
     ===================== */
  function horizontalBarChart(container, data, options) {
    if (!container || !data || data.length === 0) return;
    clearContainer(container);
    var opts = options || {};
    var w = opts.width || 400, h = opts.height || 200;
    var pad = { top: 10, right: 20, bottom: 10, left: 100 };
    var cw = w - pad.left - pad.right;
    var ch = h - pad.top - pad.bottom;
    var svg = el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: '100%', height: '100%' });

    var values = data.map(function (d) { return d.value; });
    var max = getMax(values) * 1.1 || 1;
    var barH = Math.min(20, (ch / data.length) * 0.6);
    var gap = (ch / data.length) - barH;
    var colors = opts.colors || [COLORS.blue, COLORS.cyan, COLORS.green, COLORS.purple, COLORS.amber, COLORS.red];

    data.forEach(function (d, i) {
      var bw = (d.value / max) * cw;
      var y = pad.top + i * (barH + gap);
      var color = d.color || colors[i % colors.length];

      /* label */
      var lbl = el('text', {
        x: pad.left - 8, y: y + barH / 2 + 4,
        fill: COLORS.text, 'font-size': '10', 'text-anchor': 'end', 'font-family': 'Inter, sans-serif'
      });
      lbl.textContent = d.label;
      svg.appendChild(lbl);

      /* track */
      svg.appendChild(el('rect', {
        x: pad.left, y: y, width: cw, height: barH,
        rx: barH / 2, fill: 'rgba(255,255,255,0.03)'
      }));

      /* bar */
      var rect = el('rect', {
        x: pad.left, y: y, width: 0, height: barH,
        rx: barH / 2, fill: color, opacity: '0.85'
      });
      svg.appendChild(rect);
      setTimeout(function () {
        rect.setAttribute('width', bw);
        rect.style.transition = 'width 0.8s cubic-bezier(0.16,1,0.3,1)';
      }, 80 + i * 80);

      /* value text */
      var valText = el('text', {
        x: pad.left + bw + 8, y: y + barH / 2 + 4,
        fill: color, 'font-size': '10', 'font-weight': '600', 'font-family': 'Inter, sans-serif'
      });
      valText.textContent = d.value;
      svg.appendChild(valText);
    });

    container.appendChild(svg);
    return svg;
  }

  /* =====================
     5. DONUT CHART
     ===================== */
  function donutChart(container, data, options) {
    if (!container || !data || data.length === 0) return;
    clearContainer(container);
    var opts = options || {};
    var size = opts.size || 180;
    var svg = el('svg', { viewBox: '0 0 ' + size + ' ' + size, width: '100%', height: '100%' });

    var total = data.reduce(function (s, d) { return s + d.value; }, 0) || 1;
    var cx = size / 2, cy = size / 2;
    var radius = (size - 20) / 2;
    var innerRadius = radius * 0.6;
    var colors = opts.colors || [COLORS.blue, COLORS.cyan, COLORS.green, COLORS.purple, COLORS.amber, COLORS.red];
    var startAngle = -Math.PI / 2;

    data.forEach(function (d, i) {
      var angle = (d.value / total) * 2 * Math.PI;
      var endAngle = startAngle + angle;
      var largeArc = angle > Math.PI ? 1 : 0;

      var x1 = cx + radius * Math.cos(startAngle);
      var y1 = cy + radius * Math.sin(startAngle);
      var x2 = cx + radius * Math.cos(endAngle);
      var y2 = cy + radius * Math.sin(endAngle);
      var ix1 = cx + innerRadius * Math.cos(startAngle);
      var iy1 = cy + innerRadius * Math.sin(startAngle);
      var ix2 = cx + innerRadius * Math.cos(endAngle);
      var iy2 = cy + innerRadius * Math.sin(endAngle);

      var pathD = [
        'M', x1, y1,
        'A', radius, radius, 0, largeArc, 1, x2, y2,
        'L', ix2, iy2,
        'A', innerRadius, innerRadius, 0, largeArc, 0, ix1, iy1,
        'Z'
      ].join(' ');

      var path = el('path', {
        d: pathD,
        fill: d.color || colors[i % colors.length],
        opacity: '0.85'
      });
      path.style.transformOrigin = cx + 'px ' + cy + 'px';
      path.style.transform = 'scale(0)';
      path.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
      svg.appendChild(path);
      setTimeout(function () { path.style.transform = 'scale(1)'; }, 100 + i * 80);

      startAngle = endAngle;
    });

    /* center text */
    if (opts.centerText) {
      var ct = el('text', {
        x: cx, y: cy + 4,
        fill: '#f0f4f8', 'font-size': '14', 'font-weight': '700',
        'text-anchor': 'middle', 'font-family': 'Inter, sans-serif'
      });
      ct.textContent = opts.centerText;
      svg.appendChild(ct);
    }

    container.appendChild(svg);
    return svg;
  }

  /* =====================
     6. AREA CHART
     ===================== */
  function areaChart(container, data, options) {
    /* re-use line chart with fill forced on */
    var opts = Object.assign({}, options || {}, { fill: true, dots: false });
    return lineChart(container, data, opts);
  }

  /* =====================
     7. RADIAL GAUGE
     ===================== */
  function radialGauge(container, value, max, options) {
    if (!container) return;
    clearContainer(container);
    var opts = options || {};
    var size = opts.size || 120;
    var svg = el('svg', { viewBox: '0 0 ' + size + ' ' + size, width: '100%', height: '100%' });

    var cx = size / 2, cy = size / 2;
    var radius = (size - 16) / 2;
    var circumference = 2 * Math.PI * radius;
    var pct = Math.min(value / (max || 1), 1);
    var dashOffset = circumference * (1 - pct);
    var color = opts.color || COLORS.green;

    /* track */
    svg.appendChild(el('circle', {
      cx: cx, cy: cy, r: radius,
      fill: 'none', stroke: 'rgba(255,255,255,0.05)', 'stroke-width': opts.strokeWidth || 8
    }));

    /* fill */
    var circle = el('circle', {
      cx: cx, cy: cy, r: radius,
      fill: 'none', stroke: color,
      'stroke-width': opts.strokeWidth || 8,
      'stroke-linecap': 'round',
      'stroke-dasharray': circumference,
      'stroke-dashoffset': circumference
    });
    circle.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)';
    svg.appendChild(circle);
    /* need to rotate the SVG so gauge starts from top */
    svg.style.transform = 'rotate(-90deg)';

    setTimeout(function () { circle.setAttribute('stroke-dashoffset', dashOffset); }, 100);

    container.appendChild(svg);
    return svg;
  }

  /* =====================
     8. HEATMAP
     ===================== */
  function heatmap(container, data, options) {
    if (!container || !data) return;
    clearContainer(container);
    var opts = options || {};
    var cols = opts.cols || 12;
    var rows = opts.rows || 8;

    var grid = document.createElement('div');
    grid.className = 'crowd-heatmap-grid';
    grid.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var idx = r * cols + c;
        var density = data[idx] !== undefined ? data[idx] : Math.random();
        var cell = document.createElement('div');
        cell.className = 'crowd-heatmap-cell';
        cell.style.backgroundColor = densityColor(density);
        cell.title = 'Zone ' + String.fromCharCode(65 + r) + (c + 1) + ': ' + Math.round(density * 100) + '%';
        cell.dataset.row = r;
        cell.dataset.col = c;
        grid.appendChild(cell);
      }
    }
    container.appendChild(grid);
    return grid;
  }

  function densityColor(d) {
    if (d < 0.3) return 'rgba(16,185,129,0.3)';
    if (d < 0.5) return 'rgba(16,185,129,0.55)';
    if (d < 0.7) return 'rgba(245,158,11,0.5)';
    if (d < 0.85) return 'rgba(245,158,11,0.75)';
    return 'rgba(239,68,68,0.7)';
  }

  /* ---------- public API ---------- */
  window.PulseCharts = {
    sparkline: sparkline,
    line: lineChart,
    bar: barChart,
    horizontalBar: horizontalBarChart,
    donut: donutChart,
    area: areaChart,
    radialGauge: radialGauge,
    heatmap: heatmap,
    COLORS: COLORS
  };

})();
