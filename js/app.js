/* =============================================================
   PulseOS — Main Application Controller
   FIFA World Cup 2026™ AI Operating System
   Orchestrates all views, data simulation, and AI components
   ============================================================= */

(function () {
    'use strict';

    /* ==========================================================
       1. INITIALIZATION
       ========================================================== */

    document.addEventListener('DOMContentLoaded', function () {
        console.log(
            '%c⚡ PulseOS Command Center %c Initializing... ',
            'background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; font-weight: bold; padding: 6px 12px; border-radius: 4px 0 0 4px; font-size: 13px;',
            'background: #1e293b; color: #94a3b8; padding: 6px 12px; border-radius: 0 4px 4px 0; font-size: 13px;'
        );

        // Enforce Security
        if (window.PulseAuth && window.PulseAuth.requireAuth) {
            window.PulseAuth.requireAuth();
        }
        
        if (window.PulseRBAC && window.PulseRBAC.enforceDashboard) {
            window.PulseRBAC.enforceDashboard();
        }

        // Initialize User Profile from Login
        initUserProfile();

        // Initialize Live Clock
        initClock();

        // Setup Navigation
        setupNavigation();

        // Start Data Simulator (if it exists)
        if (window.PulseData && window.PulseData.init) {
            window.PulseData.init();
        }

        // Initialize Charts (will draw when views become active)
        if (window.PulseCharts && window.PulseCharts.init) {
            window.PulseCharts.init();
        }

        // Initialize Digital Twin with the command center canvas (overview)
        var stadiumCanvas = document.getElementById('stadiumCanvas');
        if (window.DigitalTwin && window.DigitalTwin.init && stadiumCanvas) {
            window.DigitalTwin.init(stadiumCanvas);
        }

        // Initialize AI Agents and render their cards
        if (window.AIAgents) {
            renderAgentsGrid();
            if (window.AIAgents.start) window.AIAgents.start();
            window.addEventListener('agents-update', function () {
                updateAgentsGrid();
            });
        }

        // Initialize AI Timeline
        var timelineFeed = document.getElementById('timeline-feed');
        if (window.AITimeline && window.AITimeline.init) {
            window.AITimeline.init(timelineFeed);
            window.AITimeline.start();
        }

        // Initialize Command Center AI Chat
        var chatBody  = document.getElementById('ai-chat');
        var chatInput = document.getElementById('ai-input');
        var sendBtn   = document.getElementById('ai-send');
        if (window.CommandCenter && window.CommandCenter.init) {
            window.CommandCenter.init(chatBody, chatInput, sendBtn);
        }

        // Wire quick-action pills
        document.querySelectorAll('.ai-quick-pill').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var cmd = btn.getAttribute('data-cmd') || btn.textContent.trim().toLowerCase();
                if (window.CommandCenter && window.CommandCenter.sendQuickAction) {
                    window.CommandCenter.sendQuickAction(cmd);
                }
            });
        });

        // Digital Twin full view canvas is lazily initialized on first visit

        // Setup Twin layer controls
        setupTwinLayerControls();

        // Crowd Intel — gate table
        renderCrowdGateTable();

        // Handle PulseData updates
        window.addEventListener('pulsedata-update', updateDashboardMetrics);

        // Sustainability energy chart
        renderSustainabilityChart();

        // Crowd flow chart
        renderCrowdFlowChart();

        // Crowd level distribution chart
        renderCrowdLevelChart();

        // FAB button
        var fab = document.querySelector('.ai-fab');
        if (fab) {
            fab.addEventListener('click', function () {
                var cmdLink = document.querySelector('[data-view="view-command"]');
                if (cmdLink) cmdLink.click();
                setTimeout(function () {
                    var inp = document.getElementById('ai-input');
                    if (inp) inp.focus();
                }, 200);
            });
        }

        setTimeout(function () {
            document.body.classList.add('app-loaded');
        }, 500);
    });

    /* ==========================================================
       2. USER PROFILE & AUTH
       ========================================================== */

    function initUserProfile() {
        var role = localStorage.getItem('pulseos_selectedRole') || 'operations';
        var storedName = localStorage.getItem('pulseos_userName');
        
        var roleNames = {
            'fan': 'Fan',
            'volunteer': 'Volunteer',
            'security': 'Security Officer',
            'operations': 'Operations Manager',
            'medical': 'Medical Team',
            'admin': 'Administrator'
        };
        var roleInitials = {
            'fan': 'F',
            'volunteer': 'V',
            'security': 'SO',
            'operations': 'AR',
            'medical': 'M',
            'admin': 'AD'
        };
        
        var roleEl = document.querySelector('.sidebar-user-role');
        if (roleEl) roleEl.textContent = roleNames[role] || 'Operations Manager';
        
        var nameEl = document.querySelector('.sidebar-user-name');
        var avatarEl = document.getElementById('user-avatar-initials');
        
        if (storedName && storedName.trim() !== '') {
            if (nameEl) nameEl.textContent = storedName;
            
            // Generate initials from storedName (e.g. "Jane Doe" -> "JD")
            var words = storedName.trim().split(' ');
            var initials = '';
            if (words.length > 0) initials += words[0][0].toUpperCase();
            if (words.length > 1) initials += words[words.length - 1][0].toUpperCase();
            
            if (avatarEl) avatarEl.textContent = initials;
        } else {
            // Default hardcoded state if no custom name
            if (avatarEl) avatarEl.textContent = roleInitials[role] || 'AR';
        }
    }

    /* ==========================================================
       3. LIVE CLOCK
       ========================================================== */

    function initClock() {
        var clockEl = document.getElementById('live-clock');
        if (!clockEl) return;

        function updateTime() {
            var now = new Date();
            var h = now.getHours().toString().padStart(2, '0');
            var m = now.getMinutes().toString().padStart(2, '0');
            var s = now.getSeconds().toString().padStart(2, '0');
            clockEl.textContent = h + ':' + m + ':' + s;
        }
        
        updateTime();
        setInterval(updateTime, 1000);
    }

    /* ==========================================================
       4. NAVIGATION & VIEW SWITCHING
       ========================================================== */

    var twinFullInit = false;

    function setupNavigation() {
        var links = document.querySelectorAll('.sidebar-item');
        var sidebar = document.getElementById('mainSidebar');
        var overlay = document.getElementById('sidebarOverlay');
        var menuBtn = document.getElementById('mobileMenuBtn');

        /* ---- Mobile sidebar open/close helpers ---- */
        function openSidebar() {
            if (!sidebar) return;
            sidebar.classList.add('mobile-open');
            if (overlay) overlay.classList.add('active');
            if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
        }

        function closeSidebar() {
            if (!sidebar) return;
            sidebar.classList.remove('mobile-open');
            if (overlay) overlay.classList.remove('active');
            if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
        }

        /* Mobile menu button toggle */
        if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.addEventListener('click', function () {
                var isOpen = sidebar && sidebar.classList.contains('mobile-open');
                if (isOpen) {
                    closeSidebar();
                } else {
                    openSidebar();
                }
            });
        }

        /* Overlay tap closes sidebar */
        if (overlay) {
            overlay.addEventListener('click', closeSidebar);
        }

        /* Nav link click: switch view + close mobile sidebar */
        links.forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                
                links.forEach(function (l) {
                    l.classList.remove('active');
                    l.removeAttribute('aria-current');
                });
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
                
                document.querySelectorAll('.dashboard-view').forEach(function (v) {
                    v.classList.remove('active');
                });
                
                var targetId = link.getAttribute('data-view');
                var targetView = document.getElementById(targetId);
                if (targetView) {
                    targetView.classList.add('active');
                }

                // Close mobile sidebar after nav
                closeSidebar();

                // Lazy-init Digital Twin full canvas on first visit
                if (targetId === 'view-twin' && !twinFullInit) {
                    twinFullInit = true;
                    setupDigitalTwinView();
                }

                // Re-draw analytics charts on visit
                if (targetId === 'view-analytics') {
                    renderAnalyticsCharts();
                }

                // Re-render sustainability chart
                if (targetId === 'view-sustain') {
                    renderSustainabilityChart();
                }
            });
        });

        // Set aria-current on initial active item
        var initActive = document.querySelector('.sidebar-item.active');
        if (initActive) initActive.setAttribute('aria-current', 'page');
    }


    /* ==========================================================
       5. DIGITAL TWIN FULL VIEW
       ========================================================== */

    function setupDigitalTwinView() {
        var twinCanvas = document.getElementById('twin-canvas');
        if (!twinCanvas) return;
        // Reinitialize with the full-size canvas (set explicit dimensions)
        if (window.DigitalTwin && window.DigitalTwin.init) {
            // Set canvas size explicitly since parent may still be transitioning
            twinCanvas.width = twinCanvas.offsetWidth || twinCanvas.parentElement.offsetWidth || 900;
            twinCanvas.height = 540;
            window.DigitalTwin.destroy();
            window.DigitalTwin.init(twinCanvas);
        }
    }

    function setupTwinLayerControls() {
        var btns = document.querySelectorAll('.twin-layer-btn');
        btns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var layer = btn.getAttribute('data-layer');
                if (window.DigitalTwin && window.DigitalTwin.toggleLayer) {
                    var active = window.DigitalTwin.toggleLayer(layer);
                    if (active) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                }
            });
        });
    }

    /* ==========================================================
       6. AI AGENTS GRID RENDERING
       ========================================================== */

    var colorMap = {
        blue:   { bg: 'var(--blue-subtle)', border: 'var(--blue-glow)', text: 'var(--blue-light)' },
        cyan:   { bg: 'var(--cyan-subtle)', border: 'var(--cyan-glow)', text: 'var(--cyan-light)' },
        green:  { bg: 'var(--green-subtle)', border: 'var(--green-glow)', text: 'var(--green-light)' },
        red:    { bg: 'var(--red-subtle)', border: 'var(--red-glow)', text: 'var(--red-light)' },
        purple: { bg: 'var(--purple-subtle)', border: 'var(--purple-glow)', text: 'var(--purple-light)' },
        amber:  { bg: 'var(--amber-subtle)', border: 'var(--amber-glow)', text: 'var(--amber-light)' }
    };

    function renderAgentsGrid() {
        var grid = document.getElementById('agents-grid');
        if (!grid || !window.AIAgents) return;
        grid.innerHTML = '';
        window.AIAgents.getAll().forEach(function (agent, index) {
            var card = buildAgentCard(agent);
            // Add stagger entrance animation
            card.style.animation = 'fadeInUp 0.5s var(--ease-out) both';
            card.style.animationDelay = (index * 0.07) + 's';
            grid.appendChild(card);
        });
    }

    function buildAgentCard(agent) {
        var colors = colorMap[agent.color] || colorMap.blue;
        var card = document.createElement('div');
        card.id = 'agent-card-' + agent.id;
        card.className = 'agent-card glass-panel';
        card.style.cssText = 'border-top: 2px solid ' + colors.text + '; position:relative; overflow:hidden;';
        card.innerHTML =
            '<div style="font-size:32px; margin-bottom:12px;">' + agent.icon + '</div>' +
            '<h3 style="font-size:16px; font-weight:700; margin-bottom:4px; color:var(--text-primary);">' + agent.name + '</h3>' +
            '<p style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">' + agent.tagline + '</p>' +
            '<div style="display:flex; align-items:center; gap:6px; margin-bottom:8px;">' +
                '<span class="status-dot green" style="flex-shrink:0;"></span>' +
                '<span class="agent-status-text" style="font-size:11px; color:' + colors.text + '; font-weight:600;" id="agent-status-' + agent.id + '">' + agent.statusPool[0] + '</span>' +
            '</div>' +
            '<div class="agent-rec" style="background:' + colors.bg + '; border:1px solid ' + colors.border + '; border-radius:8px; padding:10px; font-size:11px; color:var(--text-secondary); margin-bottom:12px;" id="agent-rec-' + agent.id + '">' +
                agent.recPool[0] +
            '</div>' +
            '<div style="display:flex; justify-content:space-between; align-items:flex-end;">' +
                '<div style="flex:1; margin-right:16px;">' +
                    '<div style="display:flex; justify-content:space-between; margin-bottom:4px;">' +
                        '<div style="font-size:10px; color:var(--text-secondary);">Confidence</div>' +
                        '<div style="font-size:12px; font-weight:800; color:' + colors.text + ';" id="agent-conf-' + agent.id + '">' + agent.confidence + '%</div>' +
                    '</div>' +
                    '<div style="height:4px; background:var(--bg-tertiary); border-radius:4px; overflow:hidden;">' +
                        '<div id="agent-conf-bar-' + agent.id + '" style="height:100%; width:' + agent.confidence + '%; background:linear-gradient(90deg, var(--blue), ' + colors.text + '); border-radius:4px; transition:width 0.8s ease;"></div>' +
                    '</div>' +
                '</div>' +
                '<div style="text-align:right;">' +
                    '<div style="font-size:10px; color:var(--text-secondary);">Responses</div>' +
                    '<div style="font-size:16px; font-weight:800; color:var(--text-primary);" id="agent-resp-' + agent.id + '">' + agent.responseCount.toLocaleString() + '</div>' +
                '</div>' +
            '</div>';
        return card;
    }

    function updateAgentsGrid() {
        if (!window.AIAgents) return;

        function flashEl(el) {
            if (!el) return;
            el.classList.remove('value-update-flash');
            void el.offsetWidth; // trigger reflow
            el.classList.add('value-update-flash');
        }

        window.AIAgents.getAll().forEach(function (agent) {
            var statusEl = document.getElementById('agent-status-' + agent.id);
            var recEl    = document.getElementById('agent-rec-' + agent.id);
            var confEl   = document.getElementById('agent-conf-' + agent.id);
            var confBar  = document.getElementById('agent-conf-bar-' + agent.id);
            var respEl   = document.getElementById('agent-resp-' + agent.id);
            if (statusEl && statusEl.textContent !== agent.statusPool[agent.statusIndex]) {
                statusEl.textContent = agent.statusPool[agent.statusIndex];
                flashEl(statusEl);
            }
            if (recEl && recEl.textContent !== agent.recPool[agent.recIndex]) {
                recEl.textContent = agent.recPool[agent.recIndex];
                flashEl(recEl);
            }
            if (confEl && confEl.textContent !== agent.confidence + '%') {
                confEl.textContent = agent.confidence + '%';
                if (confBar) confBar.style.width = agent.confidence + '%';
                flashEl(confEl);
            }
            if (respEl && respEl.textContent !== agent.responseCount.toLocaleString()) {
                respEl.textContent = agent.responseCount.toLocaleString();
                flashEl(respEl);
            }
        });
    }

    /* ==========================================================
       7. CROWD INTEL — GATE TABLE
       ========================================================== */

    function renderCrowdGateTable() {
        var container = document.getElementById('crowd-gate-table');
        if (!container) return;
        var gates = window.PulseData && window.PulseData.crowd && window.PulseData.crowd.gates
            ? window.PulseData.crowd.gates
            : [
                { name: 'Gate A', status: 'open',      flowRate: 220, count: 8800, capacity: 10000 },
                { name: 'Gate B', status: 'open',      flowRate: 195, count: 7500, capacity: 10000 },
                { name: 'Gate C', status: 'congested', flowRate: 340, count: 9600, capacity: 10000 },
                { name: 'Gate D', status: 'closed',    flowRate: 0,   count: 0,    capacity: 10000 },
                { name: 'Gate E', status: 'open',      flowRate: 210, count: 8200, capacity: 10000 },
                { name: 'Gate F', status: 'open',      flowRate: 180, count: 7100, capacity: 10000 },
                { name: 'Gate G', status: 'open',      flowRate: 230, count: 8400, capacity: 10000 },
                { name: 'Gate H', status: 'busy',      flowRate: 290, count: 9100, capacity: 10000 }
            ];

        var colors = { open: '#10b981', busy: '#f59e0b', congested: '#ef4444', closed: '#5a6478' };

        container.innerHTML = '';
        gates.forEach(function (gate) {
            var pct = Math.round((gate.count / gate.capacity) * 100);
            var color = colors[gate.status] || colors.open;
            var row = document.createElement('div');
            row.style.cssText = 'display:flex; align-items:center; gap:12px;';
            row.innerHTML =
                '<div style="width:12px; height:12px; border-radius:50%; background:' + color + '; flex-shrink:0;"></div>' +
                '<span style="width:56px; font-size:12px; font-weight:600; color:var(--text-primary);">' + gate.name + '</span>' +
                '<div style="flex:1; height:8px; background:var(--bg-elevated); border-radius:4px; overflow:hidden;">' +
                    '<div style="width:' + pct + '%; height:100%; background:' + color + '; border-radius:4px;"></div>' +
                '</div>' +
                '<span style="width:60px; font-size:11px; color:var(--text-secondary); text-align:right;">' + gate.flowRate + '/min</span>' +
                '<span style="width:24px; padding:2px 0; background:' + color + '22; border-radius:4px; font-size:10px; color:' + color + '; font-weight:700; text-align:center;">' +
                    (gate.status === 'congested' ? '!!!' : gate.status === 'closed' ? '—' : '✓') +
                '</span>';
            container.appendChild(row);
        });
    }

    /* ==========================================================
       8. MINI CHART HELPERS (inline SVG)
       ========================================================== */

    function renderSVGBars(containerId, data, colors) {
        var el = document.getElementById(containerId);
        if (!el) return;
        var w = el.offsetWidth || 300;
        var h = 180;
        var max = Math.max.apply(null, data);
        var barW = (w / data.length) * 0.7;
        var gap  = (w / data.length) * 0.3;
        var svgNS = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', h);
        data.forEach(function (v, i) {
            var bh = (v / max) * (h - 20);
            var x = i * (w / data.length) + gap / 2;
            var rect = document.createElementNS(svgNS, 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', h - bh);
            rect.setAttribute('width', barW);
            rect.setAttribute('height', bh);
            rect.setAttribute('rx', 4);
            rect.setAttribute('fill', colors[i % colors.length]);
            rect.setAttribute('opacity', '0.8');
            svg.appendChild(rect);
        });
        el.innerHTML = '';
        el.appendChild(svg);
    }

    function renderSVGLine(containerId, data, color) {
        var el = document.getElementById(containerId);
        if (!el) return;
        var w = el.offsetWidth || 400;
        var h = 200;
        var max = Math.max.apply(null, data);
        var min = Math.min.apply(null, data);
        var range = max - min || 1;
        var svgNS = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', h);

        var points = data.map(function (v, i) {
            var x = (i / (data.length - 1)) * (w - 20) + 10;
            var y = h - ((v - min) / range) * (h - 30) - 10;
            return x + ',' + y;
        });

        // Gradient
        var defs = document.createElementNS(svgNS, 'defs');
        var gradId = 'line-grad-' + Math.random().toString(36).substr(2,6);
        var grad = document.createElementNS(svgNS, 'linearGradient');
        grad.setAttribute('id', gradId);
        grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
        grad.setAttribute('x2', '0'); grad.setAttribute('y2', '1');
        var s1 = document.createElementNS(svgNS, 'stop');
        s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', color); s1.setAttribute('stop-opacity', '0.3');
        var s2 = document.createElementNS(svgNS, 'stop');
        s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', color); s2.setAttribute('stop-opacity', '0');
        grad.appendChild(s1); grad.appendChild(s2);
        defs.appendChild(grad);
        svg.appendChild(defs);

        // Area fill
        var areaPoints = '10,' + h + ' ' + points.join(' ') + ' ' + ((data.length - 1) / (data.length - 1) * (w - 20) + 10) + ',' + h;
        var area = document.createElementNS(svgNS, 'polygon');
        area.setAttribute('points', areaPoints);
        area.setAttribute('fill', 'url(#' + gradId + ')');
        svg.appendChild(area);

        // Line
        var polyline = document.createElementNS(svgNS, 'polyline');
        polyline.setAttribute('points', points.join(' '));
        polyline.setAttribute('fill', 'none');
        polyline.setAttribute('stroke', color);
        polyline.setAttribute('stroke-width', '2');
        polyline.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(polyline);

        el.innerHTML = '';
        el.appendChild(svg);
    }

    function renderSustainabilityChart() {
        renderSVGBars('sustain-energy-chart',
            [842, 1248, 336],
            ['#10b981', '#3b82f6', '#8b5cf6']
        );
    }

    function renderAnalyticsCharts() {
        // Crowd flow line chart (chart1)
        var c1 = document.getElementById('chart1');
        if (c1 && window.PulseCharts) {
            var crowdHistory = window.PulseData && window.PulseData._sparkHistory && window.PulseData._sparkHistory.crowd
                ? window.PulseData._sparkHistory.crowd
                : [62000,65000,67000,68500,69200,70100,71000,71800,72400,73000,73241];
            window.PulseCharts.line(c1, crowdHistory, {
                color: '#06b6d4',
                label: 'Crowd',
                height: 200,
                showGrid: true,
                showLabels: true
            });
        }

        // Energy usage area chart (chart2)
        var c2 = document.getElementById('chart2');
        if (c2 && window.PulseCharts) {
            var energyHistory = window.PulseData && window.PulseData._sparkHistory && window.PulseData._sparkHistory.energy
                ? window.PulseData._sparkHistory.energy
                : [2.1,2.2,2.3,2.4,2.35,2.4,2.45,2.3,2.4,2.38,2.4];
            window.PulseCharts.line(c2, energyHistory, {
                color: '#f59e0b',
                label: 'MW',
                height: 200,
                showGrid: true,
                showLabels: true
            });
        }
    }

    function renderCrowdFlowChart() {
        var flowData = [42000, 47000, 51000, 55000, 59000, 61000, 65000, 68000, 70000, 71500, 73241];
        renderSVGLine('crowd-flow-chart', flowData, '#06b6d4');
    }

    function renderCrowdLevelChart() {
        renderSVGBars('crowd-level-chart',
            [94, 88, 76],
            ['#3b82f6', '#06b6d4', '#8b5cf6']
        );
    }

    /* ==========================================================
       9. DATA UPDATES
       ========================================================== */

    function updateDashboardMetrics(e) {
        var d = e && e.detail ? e.detail : (window.PulseData || null);
        if (!d) return;

        function flashEl(el) {
            if (!el) return;
            el.classList.remove('value-update-flash');
            void el.offsetWidth; // trigger reflow
            el.classList.add('value-update-flash');
        }

        // Crowd count
        var crowdEl = document.getElementById('cmd-crowd-val');
        if (crowdEl && d.crowd) {
            crowdEl.innerHTML = d.crowd.total.toLocaleString() + ' <span class="metric-trend positive">↑ 2.3%</span>';
            flashEl(crowdEl);
        }
        // Weather
        var weatherEl = document.getElementById('cmd-weather-val');
        if (weatherEl && d.weather) {
            weatherEl.textContent = Math.round(d.weather.temp) + '°C';
            flashEl(weatherEl);
        }
        var weatherSub = document.getElementById('cmd-weather-sub');
        if (weatherSub && d.weather) {
            weatherSub.textContent = d.weather.condition || 'Partly Cloudy';
        }

        // Gate status
        var gateEl = document.getElementById('cmd-gate-val');
        if (gateEl && d.crowd && d.crowd.gates) {
            var openCount = d.crowd.gates.filter(function (g) { return g.status !== 'closed'; }).length;
            gateEl.textContent = openCount + '/8 Open';
            flashEl(gateEl);
        }

        // Update crowd gate table
        renderCrowdGateTable();
    }

})();
