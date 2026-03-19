const mqtt = require('mqtt');
const { classifyPayload, parseJsonMessage, topicToType } = require('../lib/telemetry');
const { saveMetric } = require('./metrics');

function makeClientId() {
  return `eineage-${Math.random().toString(16).slice(2, 10)}`;
}

function startMqttWorker(config) {
  const url = `mqtt://${config.mqttHost}:${config.mqttPort}`;
  const client = mqtt.connect(url, {
    clientId: makeClientId(),
    reconnectPeriod: 5000,
    clean: true
  });

  client.on('connect', () => {
    client.subscribe(config.mqttTopic, { qos: 0 }, (err) => {
      if (err) {
        console.error('mqtt subscribe failed', err.message || err);
        return;
      }

      console.log(`mqtt subscribed ${config.mqttTopic}`);
    });
  });

  client.on('message', (topic, message) => {
    const payload = parseJsonMessage(message);
    if (!payload) {
      return;
    }

    const topicType = topicToType(topic);
    const type = topicType || classifyPayload(payload);
    if (!type) {
      return;
    }

    const model = 'esp32';

    saveMetric({
      model,
      type,
      payload
    }).catch((err) => {
      console.error('metric save failed', err.message || err);
    });
  });

  client.on('error', (err) => {
    console.error('mqtt error', err.message || err);
  });

  return client;
}

module.exports = {
  startMqttWorker
};