const express = require('express');
const { normalizeRange, normalizeType } = require('../lib/telemetry');
const { getTrends } = require('../services/metrics');

const router = express.Router();

router.get('/trends', async (req, res) => {
  const model = String(req.query.model || '').trim();
  const range = normalizeRange(req.query.range);
  const type = req.query.type ? normalizeType(req.query.type) : null;

  if (!model) {
    res.status(400).json({ error: 'model is required' });
    return;
  }

  if (!range) {
    res.status(400).json({ error: 'range must be 1h, 1d, 1w, or 1m' });
    return;
  }

  if (req.query.type && !type) {
    res.status(400).json({ error: 'type must be energy_demand, inst_power, or elec_measurements' });
    return;
  }

  try {
    const data = await getTrends({
      model,
      range,
      type
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'failed to load trends' });
  }
});

module.exports = router;