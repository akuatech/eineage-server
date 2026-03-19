require('dotenv').config();

const prisma = require('./db');
const { loadEnv } = require('./config/env');
const { buildApp } = require('./app');
const { startMqttWorker } = require('./services/mqtt');

async function shutdown(server, client, signal) {
  console.log(`shutdown requested: ${signal}`);

  if (client) {
    client.end(true);
  }

  await new Promise((resolve) => {
    server.close(() => resolve());
  });

  await prisma.$disconnect();
}

async function main() {
  const config = loadEnv();

  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  await prisma.$connect();

  const app = buildApp();
  const server = app.listen(config.port, () => {
    console.log(`api listening on ${config.port}`);
  });

  const mqttClient = startMqttWorker(config);

  process.on('SIGINT', () => {
    shutdown(server, mqttClient, 'SIGINT').finally(() => process.exit(0));
  });

  process.on('SIGTERM', () => {
    shutdown(server, mqttClient, 'SIGTERM').finally(() => process.exit(0));
  });
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});