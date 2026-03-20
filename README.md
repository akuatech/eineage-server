# Eineage Server

Small Node.js server for MQTT telemetry.

## What it does

- listens to `broker.hivemq.com` on `dhruv/meter/#`
- stores telemetry in PostgreSQL through Prisma
- exposes `GET /api/v1/logs`
- exposes `GET /api/v1/trends`

## Run it

1. Install deps

```bash
npm install
```

2. Set up `.env`

```env
DATABASE_URL=postgresql://user:pass@host:5432/eineage
PORT=3000
MQTT_HOST=broker.hivemq.com
MQTT_PORT=1883
MQTT_TOPIC="xyz/meter/#"
```

3. Run Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start the server

```bash
npm run dev
```

## Quick checks

```bash
curl "http://localhost:3000/api/v1/logs?model=esp32&type=energy_demand"
curl "http://localhost:3000/api/v1/trends?model=esp32&range=1d&type=elec_measurements"
```

## Files

- [package.json](package.json)
- [prisma/schema.prisma](prisma/schema.prisma)
- [src/server.js](src/server.js)
- [src/routes/logs.js](src/routes/logs.js)
- [src/routes/trends.js](src/routes/trends.js)
- [src/services/mqtt.js](src/services/mqtt.js)
- [src/services/metrics.js](src/services/metrics.js)