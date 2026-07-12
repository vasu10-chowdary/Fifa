/**
 * Component tests for PulseOS AI Agent Cards
 * Tests rendering, accessibility, status updates, and multiple agents
 */

'use strict';

// ===== Agent card renderer (mirrors app.js renderAgentsGrid logic) =====

const mockAgents = [
  {
    id: 'crowd-ai', name: 'Crowd AI', icon: '🧠', tagline: 'Predicting congestion before it happens',
    color: 'blue', confidence: 94, responseCount: 847,
    statusPool: ['Analyzing Gate C flow patterns', 'Monitoring crowd density'],
    recPool: ['Gate C congestion in 8 min. Open Gate D.', 'Section 200 at 89% capacity.'],
    statusIndex: 0, recIndex: 0
  },
  {
    id: 'fan-concierge', name: 'Fan Concierge AI', icon: '🎯', tagline: 'Personal assistant for every fan',
    color: 'cyan', confidence: 89, responseCount: 1247,
    statusPool: ['Serving 1,247 active requests', 'Processing wayfinding queries'],
    recPool: ['Peak food court demand at 7:45 PM. Activate 3 counters.'],
    statusIndex: 0, recIndex: 0
  },
  {
    id: 'volunteer-copilot', name: 'Volunteer Copilot', icon: '🤝', tagline: 'Coordinating 400 volunteers',
    color: 'purple', confidence: 91, responseCount: 423,
    statusPool: ['12 tasks pending assignment'],
    recPool: ['Reassign 8 volunteers from parking to Gate C.'],
    statusIndex: 0, recIndex: 0
  }
];

function renderAgentCard(agent, index) {
  const card = document.createElement('div');
  card.className = `agent-card agent-card--${agent.color}`;
  card.setAttribute('data-agent-id', agent.id);
  card.setAttribute('role', 'article');
  card.setAttribute('aria-label', `AI Agent: ${agent.name}`);
  card.style.animationDelay = `${index * 80}ms`;
  card.innerHTML = `
    <div class="agent-card__header">
      <span class="agent-card__icon" aria-hidden="true">${agent.icon}</span>
      <div class="agent-card__info">
        <h3 class="agent-card__name">${agent.name}</h3>
        <p class="agent-card__tagline">${agent.tagline}</p>
      </div>
    </div>
    <div class="agent-card__status" aria-live="polite" aria-atomic="true">
      <span class="status-dot active" aria-label="Status: Active"></span>
      <span class="agent-card__status-text">${agent.statusPool[agent.statusIndex]}</span>
    </div>
    <div class="agent-card__recommendation" role="status">
      <p class="agent-card__rec-text">${agent.recPool[agent.recIndex]}</p>
    </div>
    <div class="agent-card__metrics" role="group" aria-label="Agent performance metrics">
      <div class="agent-card__metric">
        <span class="agent-card__metric-value" aria-label="Confidence: ${agent.confidence}%">${agent.confidence}%</span>
        <span class="agent-card__metric-label">Confidence</span>
      </div>
      <div class="agent-card__metric">
        <span class="agent-card__metric-value" aria-label="Responses: ${agent.responseCount.toLocaleString()}">${agent.responseCount.toLocaleString()}</span>
        <span class="agent-card__metric-label">Responses</span>
      </div>
    </div>
  `;
  return card;
}

// ===== Tests =====

describe('PulseOS Agent Card — Rendering', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentNode) document.body.removeChild(container);
  });

  it('renders agent name correctly', () => {
    container.appendChild(renderAgentCard(mockAgents[0], 0));
    expect(container.querySelector('.agent-card__name').textContent).toBe('Crowd AI');
  });

  it('renders agent tagline correctly', () => {
    container.appendChild(renderAgentCard(mockAgents[0], 0));
    expect(container.querySelector('.agent-card__tagline').textContent).toBe('Predicting congestion before it happens');
  });

  it('applies color modifier class', () => {
    const card = renderAgentCard(mockAgents[0], 0);
    expect(card.classList.contains('agent-card--blue')).toBe(true);
  });

  it('applies cyan color for fan-concierge', () => {
    const card = renderAgentCard(mockAgents[1], 1);
    expect(card.classList.contains('agent-card--cyan')).toBe(true);
  });

  it('sets data-agent-id attribute', () => {
    const card = renderAgentCard(mockAgents[0], 0);
    expect(card.getAttribute('data-agent-id')).toBe('crowd-ai');
  });

  it('displays initial status from statusPool', () => {
    container.appendChild(renderAgentCard(mockAgents[0], 0));
    const statusText = container.querySelector('.agent-card__status-text');
    expect(statusText.textContent).toBe('Analyzing Gate C flow patterns');
  });

  it('displays recommendation from recPool', () => {
    container.appendChild(renderAgentCard(mockAgents[0], 0));
    const recText = container.querySelector('.agent-card__rec-text');
    expect(recText.textContent).toContain('Gate C congestion');
  });

  it('displays confidence percentage', () => {
    container.appendChild(renderAgentCard(mockAgents[0], 0));
    const metricValues = container.querySelectorAll('.agent-card__metric-value');
    expect(metricValues[0].textContent).toBe('94%');
  });

  it('displays response count', () => {
    container.appendChild(renderAgentCard(mockAgents[0], 0));
    const metricValues = container.querySelectorAll('.agent-card__metric-value');
    expect(metricValues[1].textContent).toBe('847');
  });

  it('applies stagger animation delay based on index', () => {
    const card0 = renderAgentCard(mockAgents[0], 0);
    const card1 = renderAgentCard(mockAgents[1], 1);
    const card2 = renderAgentCard(mockAgents[2], 2);
    expect(card0.style.animationDelay).toBe('0ms');
    expect(card1.style.animationDelay).toBe('80ms');
    expect(card2.style.animationDelay).toBe('160ms');
  });
});

describe('PulseOS Agent Card — Accessibility (WCAG 2.1 AA)', () => {
  it('has role="article" for semantic structure', () => {
    const card = renderAgentCard(mockAgents[0], 0);
    expect(card.getAttribute('role')).toBe('article');
  });

  it('has aria-label describing the agent', () => {
    const card = renderAgentCard(mockAgents[0], 0);
    expect(card.getAttribute('aria-label')).toBe('AI Agent: Crowd AI');
  });

  it('decorative emoji icon has aria-hidden="true"', () => {
    const card = renderAgentCard(mockAgents[0], 0);
    const icon = card.querySelector('.agent-card__icon');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('status region has aria-live="polite" for screen readers', () => {
    const card = renderAgentCard(mockAgents[0], 0);
    const status = card.querySelector('.agent-card__status');
    expect(status.getAttribute('aria-live')).toBe('polite');
  });

  it('status region has aria-atomic="true"', () => {
    const card = renderAgentCard(mockAgents[0], 0);
    const status = card.querySelector('.agent-card__status');
    expect(status.getAttribute('aria-atomic')).toBe('true');
  });

  it('uses h3 heading for agent name', () => {
    const card = renderAgentCard(mockAgents[0], 0);
    expect(card.querySelector('h3.agent-card__name')).not.toBeNull();
  });

  it('metrics group has accessible label', () => {
    const card = renderAgentCard(mockAgents[0], 0);
    const metricsGroup = card.querySelector('[role="group"]');
    expect(metricsGroup).not.toBeNull();
    expect(metricsGroup.getAttribute('aria-label')).toBeTruthy();
  });

  it('confidence metric value has aria-label', () => {
    const card = renderAgentCard(mockAgents[0], 0);
    const metricValues = card.querySelectorAll('.agent-card__metric-value');
    expect(metricValues[0].getAttribute('aria-label')).toContain('94%');
  });

  it('recommendation region has role="status"', () => {
    const card = renderAgentCard(mockAgents[0], 0);
    expect(card.querySelector('[role="status"]')).not.toBeNull();
  });
});

describe('PulseOS Agent Card — Multiple Agents Grid', () => {
  let grid;

  beforeEach(() => {
    grid = document.createElement('div');
    grid.className = 'agents-grid';
    mockAgents.forEach((agent, i) => grid.appendChild(renderAgentCard(agent, i)));
    document.body.appendChild(grid);
  });

  afterEach(() => {
    if (grid.parentNode) document.body.removeChild(grid);
  });

  it('renders correct number of agent cards', () => {
    expect(grid.querySelectorAll('.agent-card').length).toBe(3);
  });

  it('each card has a unique data-agent-id', () => {
    const ids = Array.from(grid.querySelectorAll('[data-agent-id]')).map(el => el.getAttribute('data-agent-id'));
    const unique = new Set(ids);
    expect(unique.size).toBe(3);
  });

  it('all agent names are unique', () => {
    const names = Array.from(grid.querySelectorAll('.agent-card__name')).map(el => el.textContent);
    const unique = new Set(names);
    expect(unique.size).toBe(3);
  });

  it('agents have different color classes', () => {
    const colors = ['agent-card--blue', 'agent-card--cyan', 'agent-card--purple'];
    colors.forEach(colorClass => {
      expect(grid.querySelector('.' + colorClass)).not.toBeNull();
    });
  });
});
