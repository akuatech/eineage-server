const express = require('express');
const { normalizeType } = require('../lib/telemetry');
const { listLatestLogs } = require('../services/metrics');

const router = express.Router();

router.get('/logs', async (req, res) => {
  const model = String(req.query.model || '').trim();
  const type = normalizeType(req.query.type);
  const limit = req.query.limit;

  if (!model) {
    res.status(400).json({ error: 'model is required' });
    return;
  }

  if (!type) {
    res.status(400).json({ error: 'type must be energy_demand, inst_power, or elec_measurements' });
    return;
  }

  try {
    const rows = await listLatestLogs({
      model,
      type,
      limit
    });

    res.json({
      model,
      type,
      count: rows.length,
      rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'failed to load logs' });
  }
});

module.exports = router;