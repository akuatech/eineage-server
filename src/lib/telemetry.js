const typeColumns = {
  energy_demand: 'energyDemand',
  inst_power: 'instPower',
  elec_measurements: 'elecMeasurements'
};

const topicTypes = {
  fast: 'elec_measurements',
  power: 'inst_power',
  energy: 'energy_demand'
};

const rangeAliases = {
  '1min': '1min',
  '1 minute': '1min',
  minute: '1min',
  min: '1min',
  '5min': '5min',
  '5 minutes': '5min',
  '15min': '15min',
  '15 minutes': '15min',
  '1h': '1h',
  '1 hour': '1h',
  hour: '1h',
  '1d': '1d',
  '1 day': '1d',
  day: '1d',
  '1w': '1w',
  '1 week': '1w',
  week: '1w',
  '1m': '1m',
  '1 month': '1m',
  month: '1m'
};

const rangeMs = {
  '1min': 60 * 1000,
  '5min': 5 * 60 * 1000,
  '15min': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
  '1m': 30 * 24 * 60 * 60 * 1000
};

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function normalizeType(value) {
  const key = normalizeText(value);
  return typeColumns[key] ? key : null;
}

function typeToColumn(type) {
  return typeColumns[type] || null;
}

function topicToType(topic) {
  if (!topic) {
    return null;
  }

  const parts = String(topic).split('/').filter(Boolean);
  const leaf = parts[parts.length - 1];
  return topicTypes[leaf] || null;
}

function normalizeRange(value) {
  const key = normalizeText(value);
  return rangeAliases[key] || null;
}

function rangeToMs(value) {
  const range = normalizeRange(value);
  return range ? rangeMs[range] : null;
}

function parseJsonMessage(buffer) {
  const text = buffer.toString('utf8').trim();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function classifyPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }

  if (
    'total_active_energy' in payload ||
    'max_demand_active' in payload ||
    'max_demand_reactive' in payload ||
    'max_demand_apparent' in payload
  ) {
    return 'energy_demand';
  }

  if (
    'active_power' in payload ||
    'reactive_power' in payload ||
    'apparent_power' in payload
  ) {
    return 'inst_power';
  }

  if (
    'voltage' in payload ||
    'current' in payload ||
    'frequency' in payload ||
    'pf' in payload
  ) {
    return 'elec_measurements';
  }

  return null;
}

module.exports = {
  classifyPayload,
  normalizeRange,
  normalizeType,
  parseJsonMessage,
  rangeToMs,
  topicToType,
  typeToColumn
};