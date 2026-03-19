const prisma = require('../db');
const { normalizeRange, rangeToMs, typeToColumn } = require('../lib/telemetry');

function cleanLimit(value, fallback) {
  const limit = Number.parseInt(value, 10);
  if (Number.isNaN(limit)) {
    return fallback;
  }

  if (limit < 1) {
    return 1;
  }

  if (limit > 200) {
    return 200;
  }

  return limit;
}

function formatRow(row, column, type) {
  return {
    id: row.id,
    time_date: row.timeDate,
    model: row.model,
    type,
    payload: row[column]
  };
}

async function saveMetric({ model, type, payload, timeDate = new Date() }) {
  const column = typeToColumn(type);
  if (!column) {
    throw new Error(`bad metric type: ${type}`);
  }

  const data = {
    model,
    timeDate
  };

  data[column] = payload;

  return prisma.metric.create({ data });
}

async function listLatestLogs({ model, type, limit }) {
  const column = typeToColumn(type);
  if (!column) {
    throw new Error(`bad metric type: ${type}`);
  }

  const rows = await prisma.metric.findMany({
    where: {
      model,
      [column]: {
        not: null
      }
    },
    orderBy: {
      timeDate: 'desc'
    },
    take: cleanLimit(limit, 50)
  });

  return rows.map((row) => formatRow(row, column, type));
}

async function getTrends({ model, range, type }) {
  const windowName = normalizeRange(range);
  if (!windowName) {
    throw new Error(`bad range: ${range}`);
  }

  const to = new Date();
  const from = new Date(to.getTime() - rangeToMs(windowName));
  const rows = await prisma.metric.findMany({
    where: {
      model,
      timeDate: {
        gte: from,
        lte: to
      }
    },
    orderBy: {
      timeDate: 'asc'
    }
  });

  if (type) {
    const column = typeToColumn(type);
    if (!column) {
      throw new Error(`bad metric type: ${type}`);
    }

    return {
      model,
      range: windowName,
      from: from.toISOString(),
      to: to.toISOString(),
      type,
      count: rows.filter((row) => row[column] !== null).length,
      rows: rows
        .filter((row) => row[column] !== null)
        .map((row) => formatRow(row, column, type))
    };
  }

  const series = {
    energy_demand: [],
    inst_power: [],
    elec_measurements: []
  };

  for (const row of rows) {
    if (row.energyDemand !== null) {
      series.energy_demand.push(formatRow(row, 'energyDemand', 'energy_demand'));
    }

    if (row.instPower !== null) {
      series.inst_power.push(formatRow(row, 'instPower', 'inst_power'));
    }

    if (row.elecMeasurements !== null) {
      series.elec_measurements.push(formatRow(row, 'elecMeasurements', 'elec_measurements'));
    }
  }

  return {
    model,
    range: windowName,
    from: from.toISOString(),
    to: to.toISOString(),
    count: rows.length,
    series
  };
}

module.exports = {
  getTrends,
  listLatestLogs,
  saveMetric
};