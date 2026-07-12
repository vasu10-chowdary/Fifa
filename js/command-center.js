/* ============================================================
   PulseOS Command Center
   AI chat handler with natural language command mapping
   ============================================================ */

(function () {
  'use strict';

  var chatBody = null;
  var chatInput = null;

  /* ---------- response map ---------- */
  var responseMap = {
    'what should i do next': function () {
      return 'Based on current operations analysis, here are your top 3 priorities:\n\n' +
        '1️⃣ **Gate C Congestion** — Flow rate is at 340 fans/min (optimal: 280). I recommend opening Gate D to redistribute load. Predicted resolution: 8 minutes.\n\n' +
        '2️⃣ **Metro Line A Delay** — 4-minute delay affecting ~340 fans. I\'ve already redirected wayfinding signs to Bus Route B7. Monitor for escalation.\n\n' +
        '3️⃣ **Food Zone C Inventory** — Dropping to 64%. Place restocking order now to avoid half-time shortage.\n\n' +
        'Shall I execute any of these recommendations?';
    },
    'open gate d': function () {
      if (window.PulseData) {
        var gateD = window.PulseData.crowd.gates.find(function (g) { return g.name === 'Gate D'; });
        if (gateD) {
          gateD.status = 'open';
          gateD.flowRate = 240;
        }
      }
      return '✅ **Gate D is now OPEN.**\n\n' +
        'Gate D has been activated and is accepting fan entry. Current actions taken:\n' +
        '• Digital signage updated to direct fans to Gate D\n' +
        '• 4 volunteers redeployed to Gate D corridor\n' +
        '• Wayfinding app routes recalculated for 2,400 affected fans\n\n' +
        'Expected result: Gate C congestion should resolve within 8-10 minutes. I\'ll monitor and report back.';
    },
    'deploy volunteers': function () {
      return '🤝 **Volunteer Redeployment Initiated**\n\n' +
        'I\'ve optimized volunteer positioning based on current demand:\n\n' +
        '• 8 volunteers moved from Parking Lot A → Gate C corridor\n' +
        '• 4 volunteers assigned to Food Court Zone B overflow\n' +
        '• 2 volunteers dispatched to Section 214 for medical assist\n' +
        '• 3 volunteers reassigned to accessibility escort requests\n\n' +
        'Total coverage: 342/400 active volunteers. All high-priority zones covered. Next shift rotation: 9:00 PM.';
    },
    'generate report': function () {
      var d = window.PulseData;
      return '📊 **Match Day 12 — Executive Summary**\n\n' +
        '**Stadium:** ' + (d ? d.stadium.name : 'MetLife Stadium') + ', New Jersey\n' +
        '**Match:** Brazil vs. Germany — Quarter Final\n' +
        '**Crowd:** ' + (d ? d.crowd.total.toLocaleString() : '73,241') + ' / 80,000 (' + (d ? d.crowd.density.toFixed(1) : '91.5') + '% capacity)\n\n' +
        '**Operations Efficiency:** 99.2%\n' +
        '**Fan Satisfaction:** 94.2%\n' +
        '**Safety Score:** 97.8%\n' +
        '**Sustainability Score:** 96.5%\n\n' +
        '**Key Highlights:**\n' +
        '• Gate D preemptive opening prevented 23-min congestion event\n' +
        '• 3 medical incidents handled — avg response: 2.1 min\n' +
        '• Carbon emissions 15% below target\n' +
        '• Solar generation +12% above forecast\n\n' +
        'Full report available for download in the Executive Insights panel.';
    },
    'prepare for rain': function () {
      return '🌧️ **Rain Protocol Activated**\n\n' +
        'Current rain probability: ' + (window.PulseData ? window.PulseData.weather.rainChance : 30) + '%\n\n' +
        'Actions initiated:\n' +
        '• Retractable roof system on standby (activation time: 12 minutes)\n' +
        '• 5,000 complimentary ponchos staged at Gates A, C, E, G\n' +
        '• Ground crew alerted for pitch cover deployment\n' +
        '• Covered walkway signage updated on all digital displays\n' +
        '• Parking lot shuttle frequency increased by 25%\n\n' +
        'I\'ll monitor the weather radar and activate roof closure if probability exceeds 60%.';
    },
    'reduce energy': function () {
      return '⚡ **Energy Optimization Executed**\n\n' +
        'Current usage: ' + (window.PulseData ? window.PulseData.energy.usage.toFixed(1) : '2.4') + ' MW\n' +
        'Solar contribution: ' + (window.PulseData ? window.PulseData.energy.solarPct : 34) + '%\n\n' +
        'Optimizations applied:\n' +
        '• HVAC zones 4-6 reduced by 15% (low-occupancy sections)\n' +
        '• Concourse lighting dimmed to 80% in unoccupied areas\n' +
        '• Escalators in Sections 300-340 switched to on-demand mode\n' +
        '• Kitchen equipment in closed food stalls powered down\n\n' +
        'Estimated savings: **$180/hour** ($2,400 projected for today)\n' +
        'Grid draw reduced by 200 kW. Solar surplus being exported.';
    },
    'check weather': function () {
      var w = window.PulseData ? window.PulseData.weather : { temp: 24, condition: 'Partly Cloudy', humidity: 58, wind: 12, rainChance: 30 };
      return '🌤️ **Current Weather Report — MetLife Stadium**\n\n' +
        '• Temperature: ' + Math.round(w.temp) + '°C (' + Math.round(w.temp * 9/5 + 32) + '°F)\n' +
        '• Condition: ' + w.condition + '\n' +
        '• Humidity: ' + w.humidity + '%\n' +
        '• Wind: ' + w.wind + ' km/h NW\n' +
        '• Rain probability: ' + w.rainChance + '%\n\n' +
        'Forecast: Conditions stable through 10 PM. Slight chance of light rain after 11 PM. No impact on match operations expected.';
    },
    'predict crowd': function () {
      return '👥 **Crowd Prediction Analysis**\n\n' +
        'Current: ' + (window.PulseData ? window.PulseData.crowd.total.toLocaleString() : '73,241') + ' fans (' + (window.PulseData ? window.PulseData.crowd.density.toFixed(1) : '91.5') + '% capacity)\n\n' +
        '**Next 30 minutes:**\n' +
        '• +2,400 fans expected (late arrivals from Metro Line A delay)\n' +
        '• Peak density: 95.2% at approx. 7:55 PM\n' +
        '• Gate C: HIGH RISK — congestion in 12 minutes at current rate\n' +
        '• Gate D: RECOMMENDED for overflow redirection\n\n' +
        '**Half-time prediction (approx. 8:45 PM):**\n' +
        '• Food court surge: +340% normal traffic\n' +
        '• Restroom queues: avg 4.5 min wait\n' +
        '• Concourse density: 78%\n\n' +
        'Recommendation: Open Gate D now and pre-position food court overflow staff.';
    }
  };

  /* ---------- dynamic response generator ---------- */
  function getFallback(input) {
    var lower = input.toLowerCase();
    var fans = window.PulseData ? window.PulseData.crowd.total.toLocaleString() : '73,241';
    
    // Greeting
    if (lower.match(/hello|hi|hey|greetings/)) {
        return '👋 Hello! PulseOS Command Center is online. All 6 AI agents are actively monitoring ' + fans + ' fans. How can I assist you with stadium operations today?';
    }
    
    // Status / Health
    if (lower.match(/status|health|how are you/)) {
        return '🟢 **System Status: Optimal**\n\n' +
               '• **Overall Efficiency:** 99.2%\n' +
               '• **Active Agents:** 6/6 Online\n' +
               '• **Crowd Capacity:** ' + (window.PulseData ? Math.round(window.PulseData.crowd.total / 80000 * 100) : 91) + '%\n' +
               '• **Network:** Zero latency detected across IoT mesh.\n\n' +
               'Would you like a detailed breakdown of a specific sector?';
    }

    // Weather
    if (lower.match(/weather|rain|temperature/)) {
        return '⛅ **Current Weather at MetLife Stadium:**\n\n' +
               '• **Temperature:** ' + (window.PulseData ? Math.round(window.PulseData.weather.temp) : 24) + '°C\n' +
               '• **Condition:** ' + (window.PulseData ? window.PulseData.weather.condition : 'Partly Cloudy') + '\n' +
               '• **Forecast:** No precipitation expected for the next 4 hours. Roof retraction is not recommended.\n\n' +
               'I have automatically adjusted HVAC zones 1-4 for optimal fan comfort based on these metrics.';
    }

    // Default Fallback
    return '🤖 I understand you\'re asking about "' + input + '". Here\'s what I can tell you:\n\n' +
      'Stadium operations are currently running at 99.2% efficiency. All 6 AI agents are active and monitoring ' + fans + ' fans across MetLife Stadium.\n\n' +
      'I can help you with:\n' +
      '• **Gate management** — "Open Gate D", "Gate status"\n' +
      '• **Crowd analysis** — "Predict crowd", "Check congestion"\n' +
      '• **Operations** — "Deploy volunteers", "Reduce energy"\n' +
      '• **Reports** — "Generate report", "Check weather"\n' +
      '• **Recommendations** — "What should I do next?"\n\n' +
      'What would you like to do?';
  }

  /* ---------- typing indicator ---------- */
  function showTyping() {
    if (!chatBody) return null;
    var indicator = document.createElement('div');
    indicator.className = 'ai-bubble assistant';
    indicator.innerHTML = '<div class="typing-indicator"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
    chatBody.appendChild(indicator);
    chatBody.scrollTop = chatBody.scrollHeight;
    return indicator;
  }

  function addMessage(text, role) {
    if (!chatBody) return;
    var bubble = document.createElement('div');
    bubble.className = 'ai-bubble ' + role;
    /* convert markdown-like bold to strong tags */
    var formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    bubble.innerHTML = formatted;
    chatBody.appendChild(bubble);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  /* ---------- process input ---------- */
  function processInput(input) {
    if (!input || !input.trim()) return;
    var text = input.trim();

    /* add user message */
    addMessage(text, 'user');

    /* find matching response */
    var key = text.toLowerCase().replace(/[?!.,]/g, '').trim();
    var handler = null;
    Object.keys(responseMap).forEach(function (k) {
      if (key.indexOf(k) !== -1) handler = responseMap[k];
    });

    /* show typing then respond */
    var typingEl = showTyping();
    var delay = 1000 + Math.random() * 1000;
    setTimeout(function () {
      if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
      var response = handler ? handler() : getFallback(text);
      addMessage(response, 'assistant');
    }, delay);
  }

  /* ---------- public API ---------- */
  window.CommandCenter = {
    init: function (bodyEl, inputEl, sendBtn) {
      chatBody = bodyEl;
      chatInput = inputEl;

      if (sendBtn) {
        sendBtn.addEventListener('click', function () {
          processInput(chatInput.value);
          chatInput.value = '';
        });
      }
      if (chatInput) {
        chatInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            processInput(chatInput.value);
            chatInput.value = '';
          }
        });
      }
    },

    sendQuickAction: function (text) {
      processInput(text);
    },

    addSystemMessage: function (text) {
      addMessage(text, 'assistant');
    }
  };

})();
