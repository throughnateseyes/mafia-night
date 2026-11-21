/*
 * The relay: a free public MQTT broker over secure WebSockets. No account, no server
 * of our own. Every payload is sealed (see crypto.js) before it leaves the phone.
 * Topics live under mn2/<roomId>/.
 */
import mqtt from 'mqtt';

export const BROKERS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
  'wss://test.mosquitto.org:8081/mqtt',
];

function matches(filter, topic) {
  const f = filter.split('/');
  const t = topic.split('/');
  for (let i = 0; i < f.length; i++) {
    if (f[i] === '#') return true;
    if (f[i] !== '+' && f[i] !== t[i]) return false;
  }
  return f.length === t.length;
}

/**
 * Connect to a room on a broker.
 * @returns {{ on(sub, fn), pub(sub, payload, retain?), status, onStatus(fn), close() }}
 *   `sub` is relative to the room, e.g. 'state', 'p/+', 'hello'.
 */
export function joinRelay(roomId, brokerIndex = 0) {
  const base = `mn2/${roomId}/`;
  const url = BROKERS[brokerIndex] ?? BROKERS[0];
  const client = mqtt.connect(url, {
    clientId: `mn_${Math.random().toString(36).slice(2, 12)}`,
    reconnectPeriod: 1500,
    connectTimeout: 8000,
    keepalive: 30,
    clean: true,
    resubscribe: true,
  });
  const handlers = [];
  const statusFns = new Set();
  const api = {
    status: 'connecting',
    on(sub, fn) {
      handlers.push({ filter: base + sub, fn });
      client.subscribe(base + sub, { qos: 1 });
      return api;
    },
    pub(sub, payload, retain = false) {
      client.publish(base + sub, payload ?? '', { qos: 1, retain });
    },
    onStatus(fn) {
      statusFns.add(fn);
      fn(api.status);
      return () => statusFns.delete(fn);
    },
    close() {
      client.end(true);
    },
    /** resolves once connected (or after `ms` regardless) */
    ready(ms = 8000) {
      if (api.status === 'online') return Promise.resolve(true);
      return new Promise((resolve) => {
        const t = setTimeout(() => resolve(false), ms);
        const off = api.onStatus((s) => {
          if (s === 'online') {
            clearTimeout(t);
            off?.();
            resolve(true);
          }
        });
      });
    },
  };
  const setStatus = (s) => {
    if (s !== api.status) console.debug(`[relay] ${s}`);
    api.status = s;
    statusFns.forEach((fn) => fn(s));
  };
  client.on('connect', () => setStatus('online'));
  client.on('reconnect', () => setStatus('connecting'));
  client.on('offline', () => setStatus('offline'));
  client.on('close', () => api.status !== 'offline' && setStatus('connecting'));
  client.on('error', (e) => console.debug(`[relay] error ${e?.message ?? e}`));
  client.on('message', (topic, buf) => {
    const text = buf.toString();
    for (const h of handlers) if (matches(h.filter, topic)) h.fn(text, topic.slice(base.length));
  });
  return api;
}
