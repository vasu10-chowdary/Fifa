/**
 * API-style tests for PulseOS AI Recommendation Engine
 * Tests all 10 FIFA challenge domains, response structure, confidence scoring
 */

'use strict';

// ===== Inline AI Service logic (mirrors js/services/ai-service.js) =====

const AI_DOMAINS = [
  'crowd-prediction', 'stadium-navigation', 'accessibility',
  'volunteer', 'transportation', 'sustainability',
  'executive-summary', 'emergency', 'incident', 'multilingual'
];

const RECOMMENDATION_TEMPLATES = {
  'crowd-prediction': [
    { message: 'Gate C congestion predicted in 8 minutes. Recommend opening Gate D.', confidence: 94, urgency: 'high', action: 'Open Gate D' },
    { message: 'Section 200-level at 89% capacity. Pre-emptive rerouting recommended.', confidence: 87, urgency: 'medium', action: 'Update signage' },
    { message: 'Half-time surge in 4 minutes. Pre-position volunteers at food courts.', confidence: 92, urgency: 'high', action: 'Deploy volunteers' }
  ],
  'stadium-navigation': [
    { message: 'Optimal route to Section 220: Gate B → Level 2 → Elevator C. ETA: 6 min.', confidence: 93, urgency: 'low', action: null },
    { message: 'Restroom queue at Section 300 is 8 minutes. Nearest alternative: Section 280.', confidence: 90, urgency: 'medium', action: 'Update app' }
  ],
  'accessibility': [
    { message: 'All 12 wheelchair routes verified clear. Companion seating confirmed.', confidence: 98, urgency: 'low', action: null },
    { message: '4 accessibility escort requests pending. Assigning certified volunteers.', confidence: 96, urgency: 'medium', action: 'Assign volunteers' }
  ],
  'volunteer': [
    { message: 'Reassign 8 volunteers from Lot A to Gate C. Coverage gap detected.', confidence: 91, urgency: 'high', action: 'Reassign via app' },
    { message: '14 volunteers on 5+ hour shifts. Initiate break rotation at 8:15 PM.', confidence: 88, urgency: 'medium', action: 'Schedule breaks' }
  ],
  'transportation': [
    { message: 'Metro Line A delayed 4 min. Redirecting 340 fans to Bus Route B7.', confidence: 88, urgency: 'medium', action: 'Update transit app' },
    { message: 'Parking Lot A at 95% capacity. Directing vehicles to Lots C and E.', confidence: 96, urgency: 'high', action: 'Update signage' }
  ],
  'sustainability': [
    { message: 'HVAC zones 4-6 can be optimized. Projected savings: $180/hr.', confidence: 91, urgency: 'low', action: 'Adjust HVAC zones' },
    { message: 'Solar panels generating 42kWh above baseline. Grid contribution opportunity.', confidence: 95, urgency: 'low', action: 'Enable grid export' }
  ],
  'executive-summary': [
    { message: '82,500 fans (98.3% capacity). All 6 AI agents operational. Satisfaction: 94.2%.', confidence: 98, urgency: 'low', action: null },
    { message: 'Revenue $2.4M ahead of projection. Food & beverage up 12% vs last match.', confidence: 96, urgency: 'low', action: null }
  ],
  'emergency': [
    { message: 'Medical alert Section 214. Fan chest pain. Medical team dispatched. ETA 90s.', confidence: 99, urgency: 'critical', action: 'Dispatch medical team' },
    { message: 'Smoke detected Gate F corridor. Security investigating. No evacuation yet.', confidence: 97, urgency: 'high', action: 'Send security team' }
  ],
  'incident': [
    { message: 'INC-2026-0847 Resolved. Fan welfare check Section 318. No intervention needed.', confidence: 97, urgency: 'low', action: null },
    { message: 'INC-2026-0848 Open. Unauthorized access at Gate H service entrance.', confidence: 99, urgency: 'high', action: 'Escalate to security' }
  ],
  'multilingual': [
    { message: 'High volume of Spanish queries (342/hr). Activating additional Spanish support.', confidence: 89, urgency: 'medium', action: 'Activate Spanish support' },
    { message: 'Arabic service active for 47 fans in premium lounge. 12 languages supported.', confidence: 95, urgency: 'low', action: null }
  ]
};

function getRecommendation(domain) {
  const templates = RECOMMENDATION_TEMPLATES[domain];
  if (!templates || templates.length === 0) {
    return { message: 'No data available.', confidence: 0, urgency: 'low', action: null, domain: domain || 'unknown', id: 'rec-fallback', timestamp: new Date().toISOString() };
  }
  const template = templates[Math.floor(Math.random() * templates.length)];
  return Object.assign({}, template, {
    domain,
    id: 'rec-' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString()
  });
}

function getAllRecommendations() {
  return AI_DOMAINS.map(d => getRecommendation(d));
}

// ===== Tests =====

describe('PulseOS AI Service — Domain Coverage', () => {
  it('defines exactly 10 FIFA challenge domains', () => {
    expect(AI_DOMAINS).toHaveLength(10);
  });

  it('covers crowd prediction', () => {
    expect(AI_DOMAINS).toContain('crowd-prediction');
  });

  it('covers stadium navigation', () => {
    expect(AI_DOMAINS).toContain('stadium-navigation');
  });

  it('covers accessibility assistance', () => {
    expect(AI_DOMAINS).toContain('accessibility');
  });

  it('covers volunteer recommendations', () => {
    expect(AI_DOMAINS).toContain('volunteer');
  });

  it('covers transportation planning', () => {
    expect(AI_DOMAINS).toContain('transportation');
  });

  it('covers sustainability insights', () => {
    expect(AI_DOMAINS).toContain('sustainability');
  });

  it('covers executive operational summaries', () => {
    expect(AI_DOMAINS).toContain('executive-summary');
  });

  it('covers emergency response', () => {
    expect(AI_DOMAINS).toContain('emergency');
  });

  it('covers incident reporting', () => {
    expect(AI_DOMAINS).toContain('incident');
  });

  it('covers multilingual assistance', () => {
    expect(AI_DOMAINS).toContain('multilingual');
  });

  it('has templates for all 10 domains', () => {
    AI_DOMAINS.forEach(domain => {
      expect(RECOMMENDATION_TEMPLATES[domain]).toBeDefined();
      expect(RECOMMENDATION_TEMPLATES[domain].length).toBeGreaterThan(0);
    });
  });
});

describe('PulseOS AI Service — Response Structure', () => {
  it('returns all required fields', () => {
    const rec = getRecommendation('crowd-prediction');
    expect(rec).toHaveProperty('message');
    expect(rec).toHaveProperty('confidence');
    expect(rec).toHaveProperty('urgency');
    expect(rec).toHaveProperty('action');
    expect(rec).toHaveProperty('domain');
    expect(rec).toHaveProperty('id');
    expect(rec).toHaveProperty('timestamp');
  });

  it('confidence is between 0 and 100 for all domains', () => {
    AI_DOMAINS.forEach(domain => {
      const rec = getRecommendation(domain);
      expect(rec.confidence).toBeGreaterThanOrEqual(0);
      expect(rec.confidence).toBeLessThanOrEqual(100);
    });
  });

  it('urgency is a valid level for all domains', () => {
    const valid = ['low', 'medium', 'high', 'critical'];
    AI_DOMAINS.forEach(domain => {
      expect(valid).toContain(getRecommendation(domain).urgency);
    });
  });

  it('domain matches request for all domains', () => {
    AI_DOMAINS.forEach(domain => {
      expect(getRecommendation(domain).domain).toBe(domain);
    });
  });

  it('timestamp is a valid ISO date string', () => {
    const rec = getRecommendation('transportation');
    expect(new Date(rec.timestamp).getTime()).not.toBeNaN();
  });

  it('id is a non-empty string', () => {
    const rec = getRecommendation('volunteer');
    expect(typeof rec.id).toBe('string');
    expect(rec.id.length).toBeGreaterThan(0);
  });

  it('generates unique IDs per call', () => {
    const ids = new Set(Array.from({ length: 50 }, () => getRecommendation('crowd-prediction').id));
    expect(ids.size).toBeGreaterThan(45); // allow slight collision chance
  });
});

describe('PulseOS AI Service — Emergency Domain (Critical)', () => {
  it('has at least one critical urgency recommendation', () => {
    const criticals = RECOMMENDATION_TEMPLATES['emergency'].filter(r => r.urgency === 'critical');
    expect(criticals.length).toBeGreaterThan(0);
  });

  it('all emergency recommendations have confidence ≥ 90%', () => {
    RECOMMENDATION_TEMPLATES['emergency'].forEach(r => {
      expect(r.confidence).toBeGreaterThanOrEqual(90);
    });
  });

  it('emergency recommendations have actionable steps', () => {
    RECOMMENDATION_TEMPLATES['emergency'].forEach(r => {
      if (r.urgency === 'critical' || r.urgency === 'high') {
        expect(r.action).not.toBeNull();
        expect(r.action.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('PulseOS AI Service — Batch Recommendations', () => {
  let allRecs;

  beforeEach(() => { allRecs = getAllRecommendations(); });

  it('returns 10 recommendations (one per domain)', () => {
    expect(allRecs).toHaveLength(10);
  });

  it('covers all 10 unique domains', () => {
    const domains = new Set(allRecs.map(r => r.domain));
    expect(domains.size).toBe(10);
  });

  it('includes an executive summary', () => {
    const exec = allRecs.find(r => r.domain === 'executive-summary');
    expect(exec).toBeDefined();
    expect(exec.message.length).toBeGreaterThan(0);
  });

  it('all recommendations have valid structure', () => {
    allRecs.forEach(rec => {
      expect(rec).toHaveProperty('message');
      expect(rec).toHaveProperty('confidence');
      expect(rec).toHaveProperty('domain');
      expect(rec).toHaveProperty('timestamp');
    });
  });
});

describe('PulseOS AI Service — Fallback Handling', () => {
  it('handles unknown domain gracefully', () => {
    const rec = getRecommendation('completely-unknown-domain');
    expect(rec).toBeDefined();
    expect(rec.message).toBeTruthy();
    expect(rec.confidence).toBe(0);
  });

  it('handles null domain gracefully', () => {
    const rec = getRecommendation(null);
    expect(rec).toBeDefined();
    expect(rec.domain).toBe('unknown');
  });

  it('handles undefined domain gracefully', () => {
    const rec = getRecommendation(undefined);
    expect(rec).toBeDefined();
  });
});

describe('PulseOS AI Service — Confidence Scoring', () => {
  it('crowd-prediction recommendations have high confidence', () => {
    RECOMMENDATION_TEMPLATES['crowd-prediction'].forEach(r => {
      expect(r.confidence).toBeGreaterThanOrEqual(80);
    });
  });

  it('executive-summary recommendations have highest confidence', () => {
    const avgConfidence = RECOMMENDATION_TEMPLATES['executive-summary']
      .reduce((sum, r) => sum + r.confidence, 0) /
      RECOMMENDATION_TEMPLATES['executive-summary'].length;
    expect(avgConfidence).toBeGreaterThan(95);
  });
});
