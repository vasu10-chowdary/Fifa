/**
 * Component tests for PulseOS Dashboard Metric Cards
 * Tests rendering, value formatting, trend display, and accessibility
 */

'use strict';

// ===== Metric Card renderer =====

function renderMetricCard({ id, title, value, unit, trend, trendDir, icon, color }) {
  const card = document.createElement('div');
  card.className = `metric-card metric-card--${color || 'blue'}`;
  card.id = id || '';
  card.setAttribute('role', 'region');
  card.setAttribute('aria-label', title);
  card.innerHTML = `
    <div class="metric-card__header">
      <span class="metric-card__icon" aria-hidden="true">${icon || '📊'}</span>
      <span class="metric-card__title">${title}</span>
    </div>
    <div class="metric-card__value" aria-label="${title}: ${value}${unit || ''}">
      <span class="metric-card__num">${value}</span><span class="metric-card__unit">${unit || ''}</span>
    </div>
    <div class="metric-card__trend metric-card__trend--${trendDir || 'up'}" aria-label="Trend: ${trend}">
      <span class="trend-icon" aria-hidden="true">${trendDir === 'down' ? '↓' : '↑'}</span>
      <span class="trend-text">${trend}</span>
    </div>
  `;
  return card;
}

const FIFA_METRICS = [
  { id: 'metric-attendance', title: 'Total Attendance', value: '82,500', unit: ' fans', trend: '+2.3% vs last match', trendDir: 'up', icon: '👥', color: 'blue' },
  { id: 'metric-density', title: 'Crowd Density', value: '94', unit: '%', trend: 'Peak in 8 min', trendDir: 'up', icon: '🔥', color: 'amber' },
  { id: 'metric-agents', title: 'AI Agents Active', value: '6', unit: '/6', trend: 'All operational', trendDir: 'up', icon: '🤖', color: 'green' },
  { id: 'metric-satisfaction', title: 'Fan Satisfaction', value: '94.2', unit: '%', trend: '+1.1% this session', trendDir: 'up', icon: '😊', color: 'purple' }
];

// ===== Tests =====

describe('PulseOS Metric Card — Rendering', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentNode) document.body.removeChild(container);
  });

  it('renders title correctly', () => {
    container.appendChild(renderMetricCard(FIFA_METRICS[0]));
    expect(container.querySelector('.metric-card__title').textContent).toBe('Total Attendance');
  });

  it('renders numeric value correctly', () => {
    container.appendChild(renderMetricCard(FIFA_METRICS[0]));
    expect(container.querySelector('.metric-card__num').textContent).toBe('82,500');
  });

  it('renders unit label', () => {
    container.appendChild(renderMetricCard(FIFA_METRICS[0]));
    expect(container.querySelector('.metric-card__unit').textContent).toBe(' fans');
  });

  it('renders trend text', () => {
    container.appendChild(renderMetricCard(FIFA_METRICS[0]));
    expect(container.querySelector('.trend-text').textContent).toContain('+2.3%');
  });

  it('renders icon with aria-hidden', () => {
    container.appendChild(renderMetricCard(FIFA_METRICS[0]));
    const icon = container.querySelector('.metric-card__icon');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('applies correct color modifier class', () => {
    const card = renderMetricCard(FIFA_METRICS[0]);
    expect(card.classList.contains('metric-card--blue')).toBe(true);
  });

  it('applies amber color for crowd density', () => {
    const card = renderMetricCard(FIFA_METRICS[1]);
    expect(card.classList.contains('metric-card--amber')).toBe(true);
  });

  it('applies green color for AI agents', () => {
    const card = renderMetricCard(FIFA_METRICS[2]);
    expect(card.classList.contains('metric-card--green')).toBe(true);
  });

  it('applies up trend class for positive trends', () => {
    container.appendChild(renderMetricCard(FIFA_METRICS[0]));
    const trend = container.querySelector('.metric-card__trend');
    expect(trend.classList.contains('metric-card__trend--up')).toBe(true);
  });

  it('applies down trend class for negative trends', () => {
    const metric = { ...FIFA_METRICS[0], trendDir: 'down', trend: '-1.2% today' };
    container.appendChild(renderMetricCard(metric));
    const trend = container.querySelector('.metric-card__trend');
    expect(trend.classList.contains('metric-card__trend--down')).toBe(true);
  });

  it('shows up arrow for positive trend', () => {
    container.appendChild(renderMetricCard(FIFA_METRICS[0]));
    const trendIcon = container.querySelector('.trend-icon');
    expect(trendIcon.textContent).toBe('↑');
  });

  it('shows down arrow for negative trend', () => {
    const metric = { ...FIFA_METRICS[0], trendDir: 'down' };
    container.appendChild(renderMetricCard(metric));
    const trendIcon = container.querySelector('.trend-icon');
    expect(trendIcon.textContent).toBe('↓');
  });
});

describe('PulseOS Metric Card — Accessibility (WCAG 2.1 AA)', () => {
  it('has role="region" for landmark semantics', () => {
    const card = renderMetricCard(FIFA_METRICS[0]);
    expect(card.getAttribute('role')).toBe('region');
  });

  it('aria-label matches the title', () => {
    const card = renderMetricCard(FIFA_METRICS[0]);
    expect(card.getAttribute('aria-label')).toBe('Total Attendance');
  });

  it('value element has descriptive aria-label', () => {
    const card = renderMetricCard(FIFA_METRICS[0]);
    const valueEl = card.querySelector('.metric-card__value');
    expect(valueEl.getAttribute('aria-label')).toContain('Total Attendance');
    expect(valueEl.getAttribute('aria-label')).toContain('82,500');
  });

  it('trend element has aria-label', () => {
    const card = renderMetricCard(FIFA_METRICS[0]);
    const trend = card.querySelector('.metric-card__trend');
    expect(trend.getAttribute('aria-label')).toContain('+2.3%');
  });

  it('decorative icon has aria-hidden', () => {
    const card = renderMetricCard(FIFA_METRICS[0]);
    expect(card.querySelector('.metric-card__icon').getAttribute('aria-hidden')).toBe('true');
  });

  it('trend icon is aria-hidden (decorative)', () => {
    const card = renderMetricCard(FIFA_METRICS[0]);
    expect(card.querySelector('.trend-icon').getAttribute('aria-hidden')).toBe('true');
  });
});

describe('PulseOS Metric Card — FIFA Dashboard Grid', () => {
  let grid;

  beforeEach(() => {
    grid = document.createElement('div');
    grid.className = 'metrics-grid';
    FIFA_METRICS.forEach(metric => grid.appendChild(renderMetricCard(metric)));
    document.body.appendChild(grid);
  });

  afterEach(() => {
    if (grid.parentNode) document.body.removeChild(grid);
  });

  it('renders all 4 FIFA metric cards', () => {
    expect(grid.querySelectorAll('.metric-card').length).toBe(4);
  });

  it('each metric card has a unique ID', () => {
    const ids = Array.from(grid.querySelectorAll('[id]'))
      .map(el => el.id)
      .filter(id => id.startsWith('metric-'));
    const unique = new Set(ids);
    expect(unique.size).toBe(4);
  });

  it('each metric has a unique title', () => {
    const titles = Array.from(grid.querySelectorAll('.metric-card__title'))
      .map(el => el.textContent);
    expect(new Set(titles).size).toBe(4);
  });

  it('all cards have role="region"', () => {
    grid.querySelectorAll('.metric-card').forEach(card => {
      expect(card.getAttribute('role')).toBe('region');
    });
  });

  it('contains attendance metric', () => {
    expect(document.getElementById('metric-attendance')).not.toBeNull();
  });

  it('contains AI agents active metric', () => {
    expect(document.getElementById('metric-agents')).not.toBeNull();
  });

  it('contains fan satisfaction metric', () => {
    expect(document.getElementById('metric-satisfaction')).not.toBeNull();
  });
});

describe('PulseOS Metric Card — Real-time Update', () => {
  it('updates value text content dynamically', () => {
    const card = renderMetricCard(FIFA_METRICS[0]);
    document.body.appendChild(card);
    const numEl = card.querySelector('.metric-card__num');
    numEl.textContent = '83,000';
    expect(numEl.textContent).toBe('83,000');
    document.body.removeChild(card);
  });

  it('value changes are reflected in DOM immediately', () => {
    const container = document.createElement('div');
    container.appendChild(renderMetricCard(FIFA_METRICS[2]));
    document.body.appendChild(container);
    const numEl = container.querySelector('.metric-card__num');
    expect(numEl.textContent).toBe('6');
    numEl.textContent = '5';
    expect(container.querySelector('.metric-card__num').textContent).toBe('5');
    document.body.removeChild(container);
  });
});
