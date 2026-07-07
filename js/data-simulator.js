/* ============================================================
   PulseOS Data Simulator
   Real-time data engine for FIFA World Cup 2026 stadiums
   Dispatches 'pulsedata-update' on window every update cycle
   ============================================================ */

(function () {
  'use strict';

  /* ---------- helpers ---------- */
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function pick(arr) { return arr[randInt(0, arr.length - 1)]; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function pct(v, total) { return Math.round((v / total) * 1000) / 10; }
  function ts() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
  }

  /* ---------- gate definitions ---------- */
  var gateNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  function makeGates() {
    return gateNames.map(function (name, i) {
      var capacity = 10000;
      var count = randInt(6000, 9800);
      var statuses = ['open', 'open', 'open', 'busy', 'busy', 'congested'];
      return {
        id: 'gate-' + name.toLowerCase(),
        name: 'Gate ' + name,
        status: i === 2 ? 'congested' : (i === 3 ? 'closed' : pick(statuses.slice(0, 3))),
        count: count,
        capacity: capacity,
        flowRate: randInt(180, 360)
      };
    });
  }

  /* ---------- zone definitions ---------- */
  function makeZones() {
    var zones = [];
    for (var r = 0; r < 8; r++) {
      for (var c = 0; c < 12; c++) {
        zones.push({
          row: r,
          col: c,
          density: rand(0.3, 1.0),
          label: 'Zone ' + String.fromCharCode(65 + r) + (c + 1)
        });
      }
    }
    return zones;
  }

  /* ---------- baseline timeline ---------- */
  var baselineTimeline = [
    { time: '7:42 PM', type: 'info',      title: 'Crowd density reached 90% at Gate A', desc: 'High fan influx detected.', ai: 'Normal pre-match pattern. Peak expected in 8 minutes.' },
    { time: '7:38 PM', type: 'warning',   title: 'Metro Line A delayed 4 minutes',      desc: 'Signal issue between stations 3 and 4.', ai: 'Redirecting 340 fans to Bus Route B7. ETA impact: minimal.' },
    { time: '7:35 PM', type: 'success',   title: 'Gate D opened successfully',           desc: 'Gate D is now operational.',  ai: 'Crowd redistribution effective. Gate C load reduced by 23%.' },
    { time: '7:31 PM', type: 'alert',     title: 'Medical alert: Section 214',            desc: 'Fan experiencing chest pain.',ai: 'Nearest medical team dispatched. ETA: 90 seconds. Defibrillator available.' },
    { time: '7:28 PM', type: 'ai-action', title: 'Volunteer redeployment executed',       desc: '8 volunteers moved from Lot A to Gate C corridor.', ai: '8 volunteers moved from Lot A to Gate C corridor. Coverage optimized.' },
    { time: '7:25 PM', type: 'info',      title: 'Food court Zone B at 85% capacity',     desc: 'Food court nearing maximum.',ai: 'Activating overflow counters. Wait time reduction: estimated 3 minutes.' },
    { time: '7:21 PM', type: 'success',   title: 'Security sweep completed: Lot B',       desc: 'All areas cleared.',ai: 'All clear. Resuming normal operations.' },
    { time: '7:18 PM', type: 'warning',   title: 'Parking Lot A at 95% capacity',         desc: 'Lot A nearly full.',ai: 'Redirecting incoming vehicles to Lot C and E. Digital signage updated.' },
    { time: '7:15 PM', type: 'ai-action', title: 'Energy optimization executed',           desc: 'HVAC zones 4-6 adjusted.',ai: 'HVAC zones 4-6 adjusted. Estimated savings: $180/hr.' },
    { time: '7:12 PM', type: 'info',      title: 'Volunteer shift change completed',       desc: '38 volunteers rotated.',ai: '38 volunteers rotated. All zones covered. Next shift: 9:00 PM.' },
    { time: '7:08 PM', type: 'success',   title: 'Accessibility audit passed',             desc: 'All routes verified.',ai: 'All wheelchair routes clear. Sign language stations operational.' },
    { time: '7:05 PM', type: 'info',      title: 'Stadium systems nominal',                desc: 'Full systems check complete.',ai: 'All 42 subsystems operational. Uptime: 99.97%.' },
    { time: '7:00 PM', type: 'ai-action', title: 'Pre-match protocols activated',           desc: 'Match day startup sequence complete.',ai: 'All gates open. Security level 2. Medical teams positioned. Volunteer deployment complete.' }
  ];

  /* ---------- event template pool for new events ---------- */
  var eventPool = [
    { type: 'info',      title: 'Gate {gate} flow rate normalized',         desc: 'Flow rate back within optimal range.',       ai: 'Gate {gate} throughput at {rate} fans/min — within target of 280/min.' },
    { type: 'warning',   title: 'Restroom queue long at Section {sec}',     desc: 'Wait time exceeds 6 minutes.',               ai: 'Deploying 2 portable units from reserves. Estimated relief: 4 minutes.' },
    { type: 'success',   title: 'Food delivery completed Zone {zone}',      desc: 'Restocked {items} items.',                   ai: 'Inventory in Zone {zone} restored to 92%. Next delivery: 45 minutes.' },
    { type: 'ai-action', title: 'HVAC auto-adjusted for Section {sec}',     desc: 'Temperature optimized for crowd density.',   ai: 'Cooling increased by 12% in Section {sec}. Comfort index improved to 94.' },
    { type: 'info',      title: 'VIP area {zone} check-in complete',        desc: '{count} VIP guests verified.',               ai: 'All VIP credentials validated. Hospitality suite at {pct}% occupancy.' },
    { type: 'warning',   title: 'Wi-Fi congestion in Zone {zone}',          desc: 'Bandwidth utilization at {pct}%.',           ai: 'Load balancing across access points. Activating backup repeaters.' },
    { type: 'success',   title: 'Suspicious item cleared: Gate {gate}',     desc: 'Security team completed inspection.',        ai: 'Threat level unchanged. Gate {gate} fully operational.' },
    { type: 'ai-action', title: 'Dynamic pricing updated: Food Zone {zone}',desc: 'Prices adjusted based on demand curve.',     ai: 'Revenue optimization active. Predicted +$340 incremental revenue this hour.' },
    { type: 'info',      title: 'Solar panels output peak reached',         desc: 'Generation at {kw} kW.',                    ai: 'Solar output exceeding forecast by {pct}%. Reducing grid draw accordingly.' },
    { type: 'warning',   title: 'Medical supply low: Station {sec}',        desc: 'Ice packs and bandages below threshold.',    ai: 'Resupply dispatched from central stores. ETA: 6 minutes.' },
    { type: 'success',   title: 'Crowd reroute successful at Gate {gate}',  desc: 'Congestion resolved.',                      ai: 'Wait time at Gate {gate} reduced from 12 to 3 minutes.' },
    { type: 'ai-action', title: 'Volunteer alert: Assist needed Section {sec}', desc: 'Elderly fan needs wheelchair assistance.', ai: 'Nearest volunteer dispatched — ETA 90 seconds. Accessibility route clear.' },
    { type: 'info',      title: 'Broadcast camera {cam} repositioned',      desc: 'Better angle for penalty area.',            ai: 'Automated camera adjustment based on play prediction model.' },
    { type: 'warning',   title: 'Escalator {esc} speed reduced',            desc: 'Maintenance sensor triggered.',             ai: 'Alternate routes active. Engineering team alerted — ETA: 15 minutes.' },
    { type: 'success',   title: 'Carbon offset milestone reached',          desc: 'Daily offset target achieved.',             ai: 'Stadium has achieved net-zero carbon for the past 3 hours.' },
    { type: 'ai-action', title: 'Predictive cleaning dispatched',           desc: 'Restrooms in Zone {zone}.',                 ai: 'AI predicted high usage. Cleaning crew dispatched 10 min ahead of peak.' },
    { type: 'info',      title: 'Match broadcast delay nominal',            desc: 'Stream latency at 1.2 seconds.',            ai: 'All 14 broadcast feeds healthy. Viewer count: 1.2 billion globally.' },
    { type: 'warning',   title: 'Rain probability increased to {pct}%',     desc: 'Updated weather forecast.',                 ai: 'Activating retractable roof protocol standby. Poncho distribution ready.' },
    { type: 'success',   title: 'Fan satisfaction survey: {pct}% positive', desc: 'Real-time sentiment analysis.',             ai: 'Satisfaction up 2.1% from last match. Top factor: food quality.' },
    { type: 'ai-action', title: 'Lighting scene changed to Match Mode',     desc: 'Stadium lights synchronized.',              ai: 'Dynamic lighting activated for pre-match atmosphere. Energy impact: +45 kW.' },
    { type: 'info',      title: 'Drone security sweep complete',            desc: 'Perimeter scan all clear.',                 ai: 'Thermal and visual analysis nominal. No anomalies detected.' },
    { type: 'warning',   title: 'Payment system latency spike',             desc: 'Average transaction time: 4.2s.',           ai: 'Switching to backup payment processor. Expected normalization: 2 minutes.' },
    { type: 'success',   title: 'Emergency drill completed successfully',   desc: 'Section {sec} evacuation test.',            ai: 'Evacuation time: 4 min 12 sec. Within target of 5 minutes.' },
    { type: 'ai-action', title: 'Noise level monitoring adjusted',          desc: 'Decibel threshold recalibrated.',           ai: 'Peak crowd noise: 114 dB. Safety threshold: 120 dB. Monitoring active.' },
    { type: 'info',      title: 'Press box at {pct}% capacity',             desc: '{count} journalists accredited.',           ai: 'All press credentials verified. Media Wi-Fi dedicated channel active.' },
    { type: 'warning',   title: 'Elevator {esc} maintenance required',      desc: 'Vibration sensor alert.',                   ai: 'Elevator temporarily offline. Alternate routes displayed on wayfinding screens.' },
    { type: 'success',   title: 'Water recycling target exceeded',          desc: 'Recycled {count}L today.',                  ai: 'Water recycling at 94% efficiency. Gray water system performing above spec.' },
    { type: 'ai-action', title: 'Dynamic wayfinding signs updated',         desc: 'Route optimization for Gate {gate}.',       ai: 'Digital signage updated across 48 screens. Crowd flow model predicts 18% improvement.' },
    { type: 'info',      title: 'Concession stand {zone} staffed up',       desc: 'Additional {count} staff deployed.',        ai: 'Pre-match rush anticipated in 12 minutes. Staff increase proactive.' },
    { type: 'success',   title: 'All accessible seating confirmed',         desc: '{count} wheelchair spaces occupied.',        ai: 'Companion seating at 100%. Accessibility rating maintained at 94/100.' }
  ];

  function fillTemplate(str) {
    return str
      .replace(/\{gate\}/g, pick(gateNames))
      .replace(/\{sec\}/g, String(randInt(100, 340)))
      .replace(/\{zone\}/g, pick(['A', 'B', 'C', 'D']))
      .replace(/\{items\}/g, String(randInt(120, 480)))
      .replace(/\{count\}/g, String(randInt(6, 84)))
      .replace(/\{rate\}/g, String(randInt(200, 340)))
      .replace(/\{pct\}/g, String(randInt(72, 98)))
      .replace(/\{kw\}/g, String(randInt(700, 900)))
      .replace(/\{cam\}/g, String(randInt(1, 14)))
      .replace(/\{esc\}/g, String(randInt(1, 6)));
  }

  function generateEvent() {
    var tmpl = pick(eventPool);
    return {
      time: ts(),
      type: tmpl.type,
      title: fillTemplate(tmpl.title),
      desc: fillTemplate(tmpl.desc),
      ai: fillTemplate(tmpl.ai)
    };
  }

  /* ---------- incidents ---------- */
  var incidentsList = [
    { id: 1, severity: 'yellow', type: 'Medical',  location: 'Section 214', desc: 'Fan experiencing chest pain',        response: '2 min', status: 'Team dispatched' },
    { id: 2, severity: 'yellow', type: 'Security', location: 'Parking Lot B', desc: 'Suspicious package report',       response: '4 min', status: 'Under investigation' },
    { id: 3, severity: 'green',  type: 'Crowd',    location: 'Gate F',       desc: 'Unusual gathering detected',        response: '1 min', status: 'Monitoring' }
  ];

  /* ---------- create baseline PulseData ---------- */
  var data = {
    stadium: {
      name: 'MetLife Stadium',
      city: 'East Rutherford, New Jersey',
      capacity: 80000,
      matchDay: 12,
      match: 'Brazil vs. Germany — Quarter Final',
      kickoff: '8:00 PM ET'
    },
    crowd: {
      total: 73241,
      density: 91.55,
      gates: makeGates(),
      zones: makeZones(),
      walkingSpeed: 1.2,
      avgQueueTime: 4.2
    },
    weather: {
      temp: 24,
      condition: 'Partly Cloudy',
      humidity: 58,
      wind: 12,
      rainChance: 30,
      icon: '🌤️'
    },
    medical: {
      alerts: [
        { id: 1, section: '214', desc: 'Chest pain', status: 'dispatched', time: '7:31 PM' },
        { id: 2, section: '108', desc: 'Dehydration', status: 'resolved', time: '7:10 PM' },
        { id: 3, section: '302', desc: 'Fall injury', status: 'active', time: '7:40 PM' }
      ],
      teamsAvailable: 8,
      teamsDeployed: 4,
      totalTeams: 12,
      avgResponseTime: 2.1
    },
    security: {
      level: 2,
      levelName: 'Elevated',
      alerts: 2,
      patrols: 24,
      totalPatrols: 30,
      cameras: 342,
      camerasOnline: 340
    },
    transport: {
      metro: { status: 'Minor Delay', wait: 6, crowdLevel: 'High', line: 'A', delay: 4 },
      bus: { status: 'On Time', wait: 3, crowdLevel: 'Medium', routes: 8 },
      rideshare: { status: 'Available', wait: 8, surge: 1.4 },
      parking: {
        overall: 87,
        lots: [
          { name: 'Lot A', pct: 95 },
          { name: 'Lot B', pct: 88 },
          { name: 'Lot C', pct: 72 },
          { name: 'Lot D', pct: 91 },
          { name: 'Lot E', pct: 68 },
          { name: 'Lot F', pct: 84 }
        ]
      },
      walking: { distance: 1.2, time: 15 },
      bike: { available: 24, stations: 3 }
    },
    volunteers: {
      total: 400,
      active: 342,
      tasks: [
        { id: 1, desc: 'Gate C crowd guidance', assignees: 8, status: 'active' },
        { id: 2, desc: 'Accessibility escort Section 214', assignees: 2, status: 'active' },
        { id: 3, desc: 'Food court queue management Zone B', assignees: 5, status: 'active' },
        { id: 4, desc: 'Parking lot direction Lot A', assignees: 4, status: 'pending' }
      ]
    },
    food: {
      inventory: 78,
      topSellers: [
        { name: 'Hot Dogs', sold: 8420 },
        { name: 'Nachos', sold: 6340 },
        { name: 'Beer', sold: 12800 },
        { name: 'Water', sold: 15600 },
        { name: 'Pizza', sold: 5200 }
      ],
      zones: [
        { name: 'Zone A', inventory: 82 },
        { name: 'Zone B', inventory: 71 },
        { name: 'Zone C', inventory: 64 },
        { name: 'Zone D', inventory: 88 }
      ]
    },
    energy: {
      usage: 2.4,
      solar: 0.82,
      grid: 1.58,
      target: 2.8,
      solarPct: 34
    },
    water: {
      usage: 12400,
      target: 13500
    },
    carbon: {
      current: 127,
      target: 150,
      reduction: 15
    },
    sustainability: {
      recyclingRate: 78,
      wasteDiverted: 340,
      plasticDiverted: 340,
      wasteCapacity: 67,
      fullBins: 4
    },
    incidents: incidentsList,
    timeline: baselineTimeline.slice(),
    accessibility: {
      score: 94,
      voiceNav: { users: 847, active: true },
      wheelchairRoutes: { count: 12, allClear: true },
      signLanguage: { sessions: 3, active: true },
      tts: { languages: 6, active: true },
      stt: { active: true },
      largeFont: { devices: 1247, enabled: true }
    },
    multilingual: {
      translationsToday: 24000,
      languages: 8,
      accuracy: 99.2,
      avgResponse: 0.3,
      distribution: [
        { lang: 'English', pct: 35 },
        { lang: 'Spanish', pct: 22 },
        { lang: 'Portuguese', pct: 15 },
        { lang: 'French', pct: 8 },
        { lang: 'Arabic', pct: 7 },
        { lang: 'Hindi', pct: 5 },
        { lang: 'Japanese', pct: 4 },
        { lang: 'Korean', pct: 4 }
      ]
    },
    executive: {
      efficiency: 99.2,
      safety: 97.8,
      fanSatisfaction: 94.2,
      sustainability: 96.5
    },
    _sparkHistory: {
      crowd: [],
      energy: [],
      water: [],
      carbon: []
    }
  };

  /* Fill spark history with 20 points */
  for (var i = 0; i < 20; i++) {
    data._sparkHistory.crowd.push(randInt(65000, 74000));
    data._sparkHistory.energy.push(rand(2.0, 2.8));
    data._sparkHistory.water.push(randInt(11000, 13000));
    data._sparkHistory.carbon.push(randInt(110, 140));
  }

  /* ---------- update loop ---------- */
  function update() {
    /* crowd */
    data.crowd.total = clamp(data.crowd.total + randInt(-200, 350), 60000, 79500);
    data.crowd.density = pct(data.crowd.total, data.stadium.capacity);
    data.crowd.walkingSpeed = clamp(data.crowd.walkingSpeed + rand(-0.05, 0.05), 0.8, 1.6);
    data.crowd.avgQueueTime = clamp(data.crowd.avgQueueTime + rand(-0.2, 0.2), 2, 8);
    data._sparkHistory.crowd.push(data.crowd.total);
    if (data._sparkHistory.crowd.length > 30) data._sparkHistory.crowd.shift();

    /* gates */
    data.crowd.gates.forEach(function (g) {
      g.count = clamp(g.count + randInt(-200, 200), 3000, g.capacity);
      g.flowRate = clamp(g.flowRate + randInt(-15, 15), 120, 400);
      if (g.name === 'Gate D') {
        g.status = 'closed';
      } else {
        var load = g.count / g.capacity;
        g.status = load > 0.9 ? 'congested' : (load > 0.75 ? 'busy' : 'open');
      }
    });

    /* zones */
    data.crowd.zones.forEach(function (z) {
      z.density = clamp(z.density + rand(-0.05, 0.05), 0.1, 1.0);
    });

    /* weather */
    data.weather.temp = clamp(data.weather.temp + rand(-0.3, 0.3), 18, 32);
    data.weather.humidity = clamp(data.weather.humidity + randInt(-1, 1), 40, 80);
    data.weather.rainChance = clamp(data.weather.rainChance + randInt(-2, 2), 5, 70);

    /* medical */
    data.medical.teamsDeployed = clamp(data.medical.teamsDeployed + pick([-1, 0, 0, 0, 1]), 0, data.medical.totalTeams);
    data.medical.teamsAvailable = data.medical.totalTeams - data.medical.teamsDeployed;

    /* transport */
    data.transport.metro.wait = clamp(data.transport.metro.wait + randInt(-1, 1), 2, 12);
    data.transport.metro.delay = clamp(data.transport.metro.delay + rand(-0.5, 0.5), 0, 8);
    data.transport.bus.wait = clamp(data.transport.bus.wait + randInt(-1, 1), 1, 8);
    data.transport.rideshare.wait = clamp(data.transport.rideshare.wait + randInt(-1, 1), 3, 15);
    data.transport.rideshare.surge = clamp(data.transport.rideshare.surge + rand(-0.1, 0.1), 1.0, 2.5);
    data.transport.parking.lots.forEach(function (l) {
      l.pct = clamp(l.pct + randInt(-1, 2), 40, 99);
    });
    data.transport.parking.overall = Math.round(
      data.transport.parking.lots.reduce(function (s, l) { return s + l.pct; }, 0) / data.transport.parking.lots.length
    );
    data.transport.bike.available = clamp(data.transport.bike.available + randInt(-2, 2), 5, 40);

    /* volunteers */
    data.volunteers.active = clamp(data.volunteers.active + randInt(-3, 3), 300, data.volunteers.total);

    /* food */
    data.food.inventory = clamp(data.food.inventory + rand(-0.5, 0.2), 50, 95);
    data.food.topSellers.forEach(function (f) { f.sold += randInt(10, 60); });

    /* energy */
    data.energy.usage = clamp(data.energy.usage + rand(-0.05, 0.05), 1.8, 3.2);
    data.energy.solar = clamp(data.energy.solar + rand(-0.02, 0.02), 0.5, 1.2);
    data.energy.grid = Math.round((data.energy.usage - data.energy.solar) * 100) / 100;
    data.energy.solarPct = Math.round((data.energy.solar / data.energy.usage) * 100);
    data._sparkHistory.energy.push(data.energy.usage);
    if (data._sparkHistory.energy.length > 30) data._sparkHistory.energy.shift();

    /* water */
    data.water.usage = clamp(data.water.usage + randInt(-100, 100), 9000, 15000);
    data._sparkHistory.water.push(data.water.usage);
    if (data._sparkHistory.water.length > 30) data._sparkHistory.water.shift();

    /* carbon */
    data.carbon.current = clamp(data.carbon.current + randInt(-3, 3), 90, 160);
    data.carbon.reduction = Math.round((1 - data.carbon.current / data.carbon.target) * 100);
    data._sparkHistory.carbon.push(data.carbon.current);
    if (data._sparkHistory.carbon.length > 30) data._sparkHistory.carbon.shift();

    /* sustainability */
    data.sustainability.recyclingRate = clamp(data.sustainability.recyclingRate + rand(-0.5, 0.5), 65, 90);
    data.sustainability.wasteCapacity = clamp(data.sustainability.wasteCapacity + rand(-0.5, 1), 50, 95);
    data.sustainability.fullBins = clamp(data.sustainability.fullBins + pick([-1, 0, 0, 1]), 0, 12);

    /* executive KPIs */
    data.executive.efficiency = clamp(data.executive.efficiency + rand(-0.1, 0.1), 97, 100);
    data.executive.safety = clamp(data.executive.safety + rand(-0.1, 0.1), 95, 100);
    data.executive.fanSatisfaction = clamp(data.executive.fanSatisfaction + rand(-0.1, 0.1), 90, 98);
    data.executive.sustainability = clamp(data.executive.sustainability + rand(-0.1, 0.1), 93, 100);

    /* accessibility */
    data.accessibility.voiceNav.users = clamp(data.accessibility.voiceNav.users + randInt(-5, 5), 700, 1000);
    data.accessibility.signLanguage.sessions = clamp(data.accessibility.signLanguage.sessions + pick([-1, 0, 0, 1]), 1, 8);
    data.accessibility.largeFont.devices = clamp(data.accessibility.largeFont.devices + randInt(-10, 10), 1000, 1500);

    /* multilingual */
    data.multilingual.translationsToday += randInt(20, 80);
    data.multilingual.accuracy = clamp(data.multilingual.accuracy + rand(-0.05, 0.05), 98.5, 99.8);

    /* dispatch event */
    window.dispatchEvent(new CustomEvent('pulsedata-update', { detail: data }));
  }

  /* ---------- start ---------- */
  window.PulseData = data;
  setInterval(update, 3000);

  /* Expose generate-event for timeline module */
  window.PulseData._generateEvent = generateEvent;

})();
