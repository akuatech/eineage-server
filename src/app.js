require('dotenv').config();

const express = require('express');
const cors = require('cors');
const logsRouter = require('./routes/logs');
const trendsRouter = require('./routes/trends');

function buildApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json({ limit: '256kb' }));

  app.get('/health', (req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/v1', logsRouter);
  app.use('/api/v1', trendsRouter);

  app.use((req, res) => {
    res.status(404).json({ error: 'not found' });
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  });

  return app;
}

// Export the app instance as the default (required by Vercel serverless).
// Attach buildApp so server.js can still do: const { buildApp } = require('./app')
const app = buildApp();
app.buildApp = buildApp;
module.exports = app;