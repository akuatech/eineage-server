function intEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }

  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value)) {
    return fallback;
  }

  return value;
}

function loadEnv() {
  return {
    port: intEnv('PORT', 3000),
    databaseUrl: process.env.DATABASE_URL || '',
    mqttHost: process.env.MQTT_HOST || 'broker.hivemq.com',
    mqttPort: intEnv('MQTT_PORT', 1883),
    mqttTopic: process.env.MQTT_TOPIC || 'dhruv/meter/#',
    logsLimit: intEnv('LOGS_LIMIT', 50)
  };
}

module.exports = {
  loadEnv
};