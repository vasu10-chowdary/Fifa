/* ============================================================
   PulseOS Digital Twin
   Canvas-based stadium visualization with layers
   ============================================================ */

(function () {
  'use strict';

  var canvas, ctx, animId;
  var W, H;
  var layers = { crowd: true, heatmap: false, security: false, medical: false, volunteers: false };
  var particles = [];
  var frame = 0;

  /* ---------- stadium geometry ---------- */
  var CX, CY, RX, RY;          /* center and radii of the oval */
  var PITCH_RX, PITCH_RY;       /* pitch radii */
  var gateAngles = [];           /* angles for the 8 gates */

  function initGeometry() {
    CX = W / 2;
    CY = H / 2;
    RX = W * 0.42;
    RY = H * 0.42;
    PITCH_RX = RX * 0.5;
    PITCH_RY = RY * 0.55;
    gateAngles = [];
    for (var i = 0; i < 8; i++) {
      gateAngles.push((i / 8) * Math.PI * 2 - Math.PI / 2);
    }
  }

  /* ---------- particles (crowd dots) ---------- */
  function spawnParticles(count) {
    particles = [];
    for (var i = 0; i < count; i++) {
      var gateIdx = Math.floor(Math.random() * 8);
      var angle = gateAngles[gateIdx];
      particles.push({
        x: CX + RX * Math.cos(angle),
        y: CY + RY * Math.sin(angle),
        tx: CX + (Math.random() - 0.5) * PITCH_RX * 1.6,
        ty: CY + (Math.random() - 0.5) * PITCH_RY * 1.6,
        speed: 0.003 + Math.random() * 0.006,
        progress: Math.random(),
        gate: gateIdx,
        color: ['#3b82f6', '#06b6d4', '#10b981', '#8b5cf6'][Math.floor(Math.random() * 4)],
        size: 1.5 + Math.random() * 1.5
      });
    }
  }

  /* ---------- drawing ---------- */
  function drawStadium() {
    /* outer structure */
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(CX, CY, RX, RY, 0, 0, Math.PI * 2);
    ctx.stroke();

    /* inner ring (stands boundary) */
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(CX, CY, RX * 0.75, RY * 0.75, 0, 0, Math.PI * 2);
    ctx.stroke();

    /* stands sections */
    for (var s = 0; s < 16; s++) {
      var a = (s / 16) * Math.PI * 2;
      var ix = CX + RX * 0.75 * Math.cos(a);
      var iy = CY + RY * 0.75 * Math.sin(a);
      var ox = CX + RX * Math.cos(a);
      var oy = CY + RY * Math.sin(a);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath();
      ctx.moveTo(ix, iy);
      ctx.lineTo(ox, oy);
      ctx.stroke();
    }

    /* pitch */
    ctx.fillStyle = 'rgba(16,185,129,0.08)';
    ctx.beginPath();
    ctx.ellipse(CX, CY, PITCH_RX, PITCH_RY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(16,185,129,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    /* pitch markings */
    ctx.strokeStyle = 'rgba(16,185,129,0.15)';
    ctx.beginPath();
    ctx.moveTo(CX, CY - PITCH_RY);
    ctx.lineTo(CX, CY + PITCH_RY);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CX, CY, PITCH_RY * 0.2, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawHeatmap() {
    if (!layers.heatmap) return;
    var data = window.PulseData;
    if (!data || !data.crowd || !data.crowd.zones) return;
    data.crowd.zones.forEach(function (z) {
      var angle = ((z.col / 12) * Math.PI * 2) - Math.PI / 2;
      var dist = 0.55 + (z.row / 8) * 0.35;
      var x = CX + RX * dist * Math.cos(angle);
      var y = CY + RY * dist * Math.sin(angle);
      var alpha = z.density * 0.5;
      var r = Math.floor(z.density * 239);
      var g = Math.floor((1 - z.density) * 185);
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',50,' + alpha + ')';
      ctx.beginPath();
      ctx.arc(x, y, 8 + z.density * 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawGates() {
    var data = window.PulseData;
    var gateNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    var statuses = data ? data.crowd.gates : [];
    gateAngles.forEach(function (angle, i) {
      var gx = CX + (RX + 24) * Math.cos(angle);
      var gy = CY + (RY + 24) * Math.sin(angle);
      var status = statuses[i] ? statuses[i].status : 'open';
      var colors = { open: '#10b981', busy: '#f59e0b', congested: '#ef4444', closed: '#5a6478' };
      var color = colors[status] || colors.open;

      /* gate marker */
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(gx, gy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(gx, gy, 10, 0, Math.PI * 2);
      ctx.globalAlpha = 0.3 + 0.2 * Math.sin(frame * 0.05 + i);
      ctx.stroke();
      ctx.globalAlpha = 1;

      /* label */
      ctx.fillStyle = '#f0f4f8';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var lx = CX + (RX + 42) * Math.cos(angle);
      var ly = CY + (RY + 42) * Math.sin(angle);
      ctx.fillText('Gate ' + gateNames[i], lx, ly);

      /* count */
      if (statuses[i]) {
        ctx.fillStyle = '#8892a4';
        ctx.font = '500 9px Inter, sans-serif';
        ctx.fillText(statuses[i].flowRate + '/min', lx, ly + 14);
      }
    });
  }

  function drawMarkers() {
    /* medical stations */
    if (layers.medical) {
      var medPositions = [
        { x: CX - RX * 0.3, y: CY - RY * 0.6 },
        { x: CX + RX * 0.3, y: CY + RY * 0.6 },
        { x: CX - RX * 0.7, y: CY },
        { x: CX + RX * 0.7, y: CY }
      ];
      medPositions.forEach(function (p) {
        ctx.fillStyle = 'rgba(239,68,68,0.2)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏥', p.x, p.y);
      });
    }

    /* security posts */
    if (layers.security) {
      for (var s = 0; s < 6; s++) {
        var sa = (s / 6) * Math.PI * 2;
        var sx = CX + RX * 0.88 * Math.cos(sa);
        var sy = CY + RY * 0.88 * Math.sin(sa);
        ctx.fillStyle = 'rgba(59,130,246,0.2)';
        ctx.beginPath();
        ctx.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3b82f6';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🛡️', sx, sy);
      }
    }

    /* volunteer positions */
    if (layers.volunteers) {
      for (var v = 0; v < 8; v++) {
        var va = (v / 8) * Math.PI * 2 + 0.2;
        var vx = CX + RX * 0.65 * Math.cos(va);
        var vy = CY + RY * 0.65 * Math.sin(va);
        ctx.fillStyle = 'rgba(139,92,246,0.2)';
        ctx.beginPath();
        ctx.arc(vx, vy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#8b5cf6';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🤝', vx, vy);
      }
    }

    /* food court markers (always visible) */
    var foodPositions = [
      { x: CX - RX * 0.55, y: CY - RY * 0.35 },
      { x: CX + RX * 0.55, y: CY - RY * 0.35 },
      { x: CX - RX * 0.55, y: CY + RY * 0.35 },
      { x: CX + RX * 0.55, y: CY + RY * 0.35 }
    ];
    foodPositions.forEach(function (p) {
      ctx.fillStyle = 'rgba(245,158,11,0.15)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🍔', p.x, p.y);
    });
  }

  function drawCrowdParticles() {
    if (!layers.crowd) return;
    particles.forEach(function (p) {
      p.progress += p.speed;
      if (p.progress > 1) {
        p.progress = 0;
        p.gate = Math.floor(Math.random() * 8);
        var angle = gateAngles[p.gate];
        p.x = CX + RX * Math.cos(angle);
        p.y = CY + RY * Math.sin(angle);
        p.tx = CX + (Math.random() - 0.5) * PITCH_RX * 1.6;
        p.ty = CY + (Math.random() - 0.5) * PITCH_RY * 1.6;
      }
      var cx = p.x + (p.tx - p.x) * p.progress;
      var cy = p.y + (p.ty - p.y) * p.progress;
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(cx, cy, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  /* ---------- render loop ---------- */
  function render() {
    frame++;
    ctx.clearRect(0, 0, W, H);

    /* background glow */
    var grad = ctx.createRadialGradient(CX, CY, 0, CX, CY, RX * 1.2);
    grad.addColorStop(0, 'rgba(6,182,212,0.02)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    drawHeatmap();
    drawStadium();
    drawGates();
    drawMarkers();
    drawCrowdParticles();

    animId = requestAnimationFrame(render);
  }

  /* ---------- public API ---------- */
  window.DigitalTwin = {
    init: function (canvasEl) {
      if (!canvasEl) return;
      canvas = canvasEl;
      ctx = canvas.getContext('2d');
      var rect = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = rect.width;
      H = canvas.height = 600;
      initGeometry();
      spawnParticles(180);
      render();
    },

    setLayer: function (name, val) {
      if (layers.hasOwnProperty(name)) layers[name] = val;
    },

    toggleLayer: function (name) {
      if (layers.hasOwnProperty(name)) layers[name] = !layers[name];
      return layers[name];
    },

    resize: function () {
      if (!canvas) return;
      var rect = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = rect.width;
      H = canvas.height = 600;
      initGeometry();
    },

    destroy: function () {
      if (animId) cancelAnimationFrame(animId);
    }
  };

})();
