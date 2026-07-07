/* ============================================================
   PulseOS AI Agents
   Six specialized AI agents with contextual recommendations
   ============================================================ */

(function () {
  'use strict';

  /* ---------- agent definitions ---------- */
  var agents = [
    {
      id: 'crowd-ai',
      name: 'Crowd AI',
      icon: '🧠',
      tagline: 'Predicting congestion before it happens',
      color: 'blue',
      statusPool: ['Analyzing Gate C flow patterns', 'Monitoring crowd density zones', 'Predicting peak congestion windows', 'Evaluating gate redistribution', 'Running flow simulation model'],
      recPool: [
        'Recommend opening Gate D in 8 minutes. Current flow rate at Gate C: 340 fans/min exceeds optimal 280/min.',
        'Gate A approaching 95% capacity. Suggest diverting 20% of foot traffic to Gate B via digital signage update.',
        'Crowd density in Section 200-level at 94%. Pre-emptive rerouting to upper-level concourse recommended.',
        'Post-match exit strategy ready. Staggered release from Sections 100-140 first, then 200-level, reduces exit time by 18 minutes.',
        'Walking speed near Gate F dropped below 0.8 m/s. Potential bottleneck forming — deploy 4 volunteers to corridor.',
        'Fan ingress ahead of schedule — 91% capacity reached 12 min early. All systems nominal, no action required.',
        'Half-time crowd surge predicted in 4 minutes. Pre-position volunteers at food courts and restrooms.',
        'Gate C congestion resolved after redistribution. Wait time reduced from 11 to 3 minutes.'
      ],
      confidence: 94,
      responseCount: 847,
      statusIndex: 0,
      recIndex: 0
    },
    {
      id: 'fan-concierge',
      name: 'Fan Concierge AI',
      icon: '🎯',
      tagline: 'Personal assistant for every fan',
      color: 'cyan',
      statusPool: ['Serving 1,247 active requests', 'Processing wayfinding queries', 'Handling seat upgrade requests', 'Assisting multilingual fans', 'Optimizing food recommendations'],
      recPool: [
        'Peak food court demand predicted at 7:45 PM. Recommend activating 3 additional counters in Zone B.',
        'Fan satisfaction trending at 94.2% — highest of the tournament. Key driver: wait time reduction at food courts.',
        'Top fan query this hour: "Where is the nearest restroom?" — 342 requests. All routes clear, avg walk time: 2.1 min.',
        'VIP fan experience score: 97/100. Suite catering on schedule. Champagne service initiated for Level 5.',
        'Family zone requests up 23%. Recommend deploying additional accessibility volunteers to Section 110.',
        'Lost and found: 12 items reported this hour. 8 already returned via fan app geolocation.',
        'Seat upgrade opportunity: 340 premium seats unused. Revenue potential: $17,000 if offered via fan app push notification.',
        'Real-time sentiment analysis: 96% positive tweets about stadium experience. Trending: #MetLifeWC2026.'
      ],
      confidence: 89,
      responseCount: 1247,
      statusIndex: 0,
      recIndex: 0
    },
    {
      id: 'volunteer-copilot',
      name: 'Volunteer Copilot',
      icon: '🤝',
      tagline: 'Coordinating 400 volunteers in real-time',
      color: 'purple',
      statusPool: ['12 tasks pending assignment', 'Monitoring volunteer locations', 'Optimizing shift coverage', 'Processing task completions', 'Evaluating volunteer efficiency'],
      recPool: [
        'Reassign 8 volunteers from parking to Gate C area. Shift overlap detected — optimize by consolidating Zone A/B coverage.',
        'Volunteer fatigue alert: 14 volunteers on shift for 5+ hours. Recommend break rotation starting at 8:15 PM.',
        'Task completion rate: 94%. Top performer: Volunteer Group Delta with 28 tasks completed this shift.',
        'Gap detected: Section 300-level has no volunteer coverage. Nearest available team is 4 minutes away. Dispatching.',
        'Shift handoff in 45 minutes. All 38 incoming volunteers have confirmed via the app. Briefing materials pushed.',
        'Volunteer-to-fan ratio optimal at 1:183. Industry benchmark: 1:200. Coverage exceeds FIFA requirements.',
        'Emergency drill prep: All volunteers briefed on evacuation protocol. Response readiness: 98%.',
        'Accessibility escort requests: 4 pending. Assigning volunteers with wheelchair training certification.'
      ],
      confidence: 91,
      responseCount: 423,
      statusIndex: 0,
      recIndex: 0
    },
    {
      id: 'safety-ai',
      name: 'Safety AI',
      icon: '🛡️',
      tagline: 'Monitoring threats and emergencies',
      color: 'red',
      statusPool: ['3 active alerts — monitoring', 'Scanning perimeter cameras', 'Analyzing crowd anomalies', 'Processing threat assessments', 'Coordinating security patrols'],
      recPool: [
        'Medical team dispatched to Section 214. Suspicious package report in Lot B cleared. Crowd anomaly detected near Gate F — monitoring.',
        'All 340 security cameras online. 2 cameras in Lot C showing reduced visibility due to lighting — maintenance notified.',
        'Security sweep of all vendor areas complete. Compliance rate: 100%. Next sweep scheduled for 8:30 PM.',
        'Facial recognition flagged 0 matches against watch list today. System accuracy: 99.7%. Privacy protocols maintained.',
        'Emergency response drill results: Sector 4 evacuation completed in 4:12. Target: 5:00. Rating: Excellent.',
        'Drone perimeter scan complete. No unauthorized drone activity detected. Airspace secure.',
        'Security level recommendation: Maintain Level 2 (Elevated). No indicators warrant escalation to Level 3.',
        'Crowd behavior analysis: All sectors showing normal patterns. No anomalous groupings detected.'
      ],
      confidence: 97,
      responseCount: 156,
      statusIndex: 0,
      recIndex: 0
    },
    {
      id: 'sustainability-ai',
      name: 'Sustainability AI',
      icon: '🌱',
      tagline: 'Optimizing environmental impact',
      color: 'green',
      statusPool: ['Tracking 14 environmental metrics', 'Analyzing energy optimization paths', 'Monitoring waste bin capacity', 'Evaluating water recycling efficiency', 'Calculating carbon offset progress'],
      recPool: [
        'Solar generation exceeding projections by 12%. Recommend reducing grid draw by 200kW. Food waste in Zone C: activate composting protocol.',
        'Carbon footprint today: 127 kg CO₂/hr, 15% below target. On track for net-zero certification this match day.',
        'Waste bin Zone D at 92% capacity. Dispatching collection team. Recycling separation rate: 78% — exceeding 75% target.',
        'Water recycling system operating at 94% efficiency. Gray water reuse saving 3,200 liters/hour.',
        'HVAC optimization opportunity: Sections 300-340 occupancy below 60%. Reduce cooling by 15% — saves $180/hour.',
        'LED lighting schedule optimized for sunset. Energy savings: 45 kW. Stadium aesthetic quality maintained.',
        'Food waste prediction: Zone B will generate 120 kg waste by end of match. Composting capacity: 200 kg. Sufficient.',
        'Environmental score for Match Day 12: 96.5/100. Second-highest of the tournament.'
      ],
      confidence: 86,
      responseCount: 312,
      statusIndex: 0,
      recIndex: 0
    },
    {
      id: 'executive-ai',
      name: 'Executive AI',
      icon: '📊',
      tagline: 'Your AI chief of staff',
      color: 'amber',
      statusPool: ['Executive report ready', 'Analyzing KPI trends', 'Generating leadership briefing', 'Evaluating strategic risks', 'Compiling performance metrics'],
      recPool: [
        'Today\'s top risk: Gate C congestion (ETA: 12 min). Top opportunity: Energy cost savings of $2,400 by optimizing HVAC. Fan satisfaction trending up at 94.2%.',
        'Match Day 12 is trending as the most efficient operation day this tournament. Key factor: proactive AI-driven gate management.',
        'Revenue update: Concessions $342,000 (+8% vs. Day 11). Merchandise: $89,000 (-2%). Premium seating: $124,000 (on target).',
        'Stakeholder report ready for FIFA operations committee. Highlights: zero security escalations, medical response time under 2.5 min avg.',
        'Benchmark comparison: MetLife Stadium operating 12% more efficiently than tournament average. Top in fan satisfaction.',
        'Budget tracking: Operating costs today $48,200 vs. budget $52,000. Under budget by $3,800. Primary savings: energy optimization.',
        'Post-match action items generated: 5 high priority, 12 medium. Key item: Gate C infrastructure assessment before Day 13.',
        'Media sentiment analysis: 94% positive coverage. Top story: AI-powered crowd management preventing congestion.'
      ],
      confidence: 92,
      responseCount: 89,
      statusIndex: 0,
      recIndex: 0
    }
  ];

  /* ---------- cycling ---------- */
  var cycleInterval = null;

  function cycleAgents() {
    agents.forEach(function (agent) {
      agent.statusIndex = (agent.statusIndex + 1) % agent.statusPool.length;
      /* occasionally cycle recommendation */
      if (Math.random() < 0.3) {
        agent.recIndex = (agent.recIndex + 1) % agent.recPool.length;
        agent.confidence = Math.max(80, Math.min(99, agent.confidence + Math.floor(Math.random() * 5 - 2)));
        agent.responseCount += Math.floor(Math.random() * 20 + 5);
      }
    });
    window.dispatchEvent(new CustomEvent('agents-update', { detail: agents }));
  }

  function startCycling() {
    if (cycleInterval) return;
    cycleInterval = setInterval(cycleAgents, 6000);
  }

  /* ---------- public API ---------- */
  window.AIAgents = {
    getAll: function () { return agents; },
    getById: function (id) {
      return agents.find(function (a) { return a.id === id; }) || null;
    },
    getCurrentStatus: function (id) {
      var a = this.getById(id);
      return a ? a.statusPool[a.statusIndex] : '';
    },
    getCurrentRec: function (id) {
      var a = this.getById(id);
      return a ? a.recPool[a.recIndex] : '';
    },
    start: startCycling,
    agents: agents
  };

})();
