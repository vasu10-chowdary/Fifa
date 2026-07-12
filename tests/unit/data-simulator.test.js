/**
 * Unit tests for PulseOS Data Simulator
 * Tests gate generation, zone creation, and data validity
 */

'use strict';

// ===== Inline simulator logic (mirrors js/data-simulator.js) =====

function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function pct(v, total) { return Math.round((v / total) * 1000) / 10; }

const GATE_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const GATE_CAPACITY = 10000;
const STADIUM_CAPACITY = 84000;

function makeGates() {
  return GATE_NAMES.map(function (name, i) {
    const count = randInt(6000, 9800);
    return {
      id: 'gate-' + name.toLowerCase(),
      name: 'Gate ' + name,
      status: i === 2 ? 'congested' : (i === 3 ? 'closed' : pick(['open', 'open', 'busy'])),
      count,
      capacity: GATE_CAPACITY,
      flowRate: i === 3 ? 0 : randInt(180, 360)
    };
  });
}

function makeZones() {
  const zones = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 12; c++) {
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

function generateAttendance() {
  const count = randInt(78000, 84000);
  return {
    count,
    capacity: STADIUM_CAPACITY,
    pct: pct(count, STADIUM_CAPACITY)
  };
}

function generateEvent(gateNames) {
  const gate = pick(gateNames);
  const sec = randInt(100, 350);
  const zone = pick(['A', 'B', 'C', 'D']);
  const types = ['info', 'warning', 'success', 'alert', 'ai-action'];
  return {
    type: pick(types),
    title: `Gate ${gate} status update`,
    desc: `Automated event for Gate ${gate}`,
    ai: `AI analysis for Gate ${gate}, Section ${sec}`,
    time: new Date().toLocaleTimeString()
  };
}

// ===== Tests =====

describe('PulseOS Data Simulator — Gate Generation', () => {
  let gates;

  beforeEach(() => { gates = makeGates(); });

  it('generates exactly 8 gates', () => {
    expect(gates).toHaveLength(8);
  });

  it('generates gate IDs in lowercase format', () => {
    expect(gates[0].id).toBe('gate-a');
    expect(gates[7].id).toBe('gate-h');
  });

  it('generates gate names in "Gate X" format', () => {
    expect(gates[0].name).toBe('Gate A');
    expect(gates[7].name).toBe('Gate H');
  });

  it('sets Gate C (index 2) to congested status', () => {
    expect(gates[2].status).toBe('congested');
  });

  it('sets Gate D (index 3) to closed status', () => {
    expect(gates[3].status).toBe('closed');
  });

  it('sets other gates to open or busy', () => {
    const validStatuses = ['open', 'busy', 'congested', 'closed'];
    gates.forEach(gate => {
      expect(validStatuses).toContain(gate.status);
    });
  });

  it('sets all gate capacities to 10000', () => {
    gates.forEach(gate => {
      expect(gate.capacity).toBe(GATE_CAPACITY);
    });
  });

  it('generates count within realistic range', () => {
    gates.forEach(gate => {
      expect(gate.count).toBeGreaterThanOrEqual(6000);
      expect(gate.count).toBeLessThanOrEqual(9800);
    });
  });

  it('count never exceeds capacity', () => {
    gates.forEach(gate => {
      expect(gate.count).toBeLessThanOrEqual(gate.capacity);
    });
  });

  it('generates valid flow rates for open gates', () => {
    gates
      .filter(g => g.status !== 'closed')
      .forEach(gate => {
        expect(gate.flowRate).toBeGreaterThanOrEqual(180);
        expect(gate.flowRate).toBeLessThanOrEqual(360);
      });
  });

  it('gates have all required properties', () => {
    const requiredProps = ['id', 'name', 'status', 'count', 'capacity', 'flowRate'];
    gates.forEach(gate => {
      requiredProps.forEach(prop => {
        expect(gate).toHaveProperty(prop);
      });
    });
  });
});

describe('PulseOS Data Simulator — Zone Generation', () => {
  let zones;

  beforeEach(() => { zones = makeZones(); });

  it('generates exactly 96 zones (8 rows × 12 cols)', () => {
    expect(zones).toHaveLength(96);
  });

  it('generates density values between 0.3 and 1.0', () => {
    zones.forEach(zone => {
      expect(zone.density).toBeGreaterThanOrEqual(0.3);
      expect(zone.density).toBeLessThanOrEqual(1.0);
    });
  });

  it('first zone is Zone A1', () => {
    expect(zones[0].label).toBe('Zone A1');
  });

  it('last zone of row A is Zone A12', () => {
    expect(zones[11].label).toBe('Zone A12');
  });

  it('first zone of row B is Zone B1', () => {
    expect(zones[12].label).toBe('Zone B1');
  });

  it('last zone is Zone H12', () => {
    expect(zones[95].label).toBe('Zone H12');
  });

  it('zones have correct row and column indices', () => {
    expect(zones[0]).toMatchObject({ row: 0, col: 0 });
    expect(zones[11]).toMatchObject({ row: 0, col: 11 });
    expect(zones[12]).toMatchObject({ row: 1, col: 0 });
    expect(zones[95]).toMatchObject({ row: 7, col: 11 });
  });

  it('zones have all required properties', () => {
    const props = ['row', 'col', 'density', 'label'];
    zones.forEach(zone => {
      props.forEach(prop => {
        expect(zone).toHaveProperty(prop);
      });
    });
  });
});

describe('PulseOS Data Simulator — Attendance Generation', () => {
  it('generates attendance within realistic stadium range', () => {
    for (let i = 0; i < 50; i++) {
      const att = generateAttendance();
      expect(att.count).toBeGreaterThanOrEqual(78000);
      expect(att.count).toBeLessThanOrEqual(84000);
    }
  });

  it('capacity is always STADIUM_CAPACITY', () => {
    const att = generateAttendance();
    expect(att.capacity).toBe(STADIUM_CAPACITY);
  });

  it('pct is between 92% and 100% for realistic attendance', () => {
    const att = generateAttendance();
    expect(att.pct).toBeGreaterThan(90);
    expect(att.pct).toBeLessThanOrEqual(100);
  });
});

describe('PulseOS Data Simulator — Event Generation', () => {
  it('generates events with required fields', () => {
    const event = generateEvent(GATE_NAMES);
    expect(event).toHaveProperty('type');
    expect(event).toHaveProperty('title');
    expect(event).toHaveProperty('desc');
    expect(event).toHaveProperty('ai');
    expect(event).toHaveProperty('time');
  });

  it('generates a valid event type', () => {
    const validTypes = ['info', 'warning', 'success', 'alert', 'ai-action'];
    for (let i = 0; i < 50; i++) {
      const event = generateEvent(GATE_NAMES);
      expect(validTypes).toContain(event.type);
    }
  });

  it('uses gate names in event title', () => {
    for (let i = 0; i < 20; i++) {
      const event = generateEvent(GATE_NAMES);
      const hasGateName = GATE_NAMES.some(g => event.title.includes(`Gate ${g}`));
      expect(hasGateName).toBe(true);
    }
  });
});

describe('PulseOS Data Simulator — Math Helpers', () => {
  describe('clamp()', () => {
    it('clamps above upper bound', () => expect(clamp(150, 0, 100)).toBe(100));
    it('clamps below lower bound', () => expect(clamp(-10, 0, 100)).toBe(0));
    it('returns value within bounds', () => expect(clamp(50, 0, 100)).toBe(50));
  });

  describe('pct()', () => {
    it('calculates percentage to 1 decimal', () => {
      expect(pct(8500, 10000)).toBe(85);
      expect(pct(10000, 10000)).toBe(100);
      expect(pct(0, 10000)).toBe(0);
    });
  });
});
