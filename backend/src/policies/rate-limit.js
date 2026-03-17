'use strict';

/**
 * Reusable rate-limit policy factory for Strapi 4.
 *
 * Usage in route config:
 *   config: {
 *     policies: [
 *       { name: 'global::rate-limit', config: { limit: 3, window: 900000, keyFn: (ctx) => ctx.request.body?.identifier } }
 *     ]
 *   }
 *
 * Options:
 *   limit   - max requests per window (required)
 *   window  - window in ms (required)
 *   keyFn   - function(ctx) returning the rate-limit key (required — IP-based
 *             limiting is unreliable behind a reverse proxy or when all requests
 *             originate from a single frontend server)
 */

const crypto = require('crypto');
const { errors } = require('@strapi/utils');

const bootSalt = crypto.randomBytes(32);
const stores = new Map();

function redactForLog(value) {
  if (!value) return 'unknown';
  return crypto.createHmac('sha256', bootSalt).update(value).digest('hex').slice(0, 8);
}

function getStore(storeKey) {
  if (!stores.has(storeKey)) {
    stores.set(storeKey, new Map());
  }
  return stores.get(storeKey);
}

function cleanup(store, window) {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.start >= window) {
      store.delete(key);
    }
  }
}

module.exports = (policyContext, config, { strapi }) => {
  const { limit, window, keyFn } = config;

  if (!limit || !window) {
    strapi.log.warn('rate-limit policy: missing limit or window config');
    return true;
  }

  if (!keyFn) {
    const route = policyContext.request?.path || policyContext.request?.url || 'unknown';
    strapi.log.warn(`rate-limit policy: no keyFn configured for ${route} — allowing through`);
    return true;
  }

  const key = keyFn(policyContext);

  if (!key) {
    return true;
  }

  const storeKey = `${limit}:${window}`;
  const store = getStore(storeKey);

  // Periodic cleanup
  if (Math.random() < 0.01) {
    cleanup(store, window);
  }

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.start >= window) {
    store.set(key, { count: 1, start: now });
    return true;
  }

  entry.count += 1;

  if (entry.count > limit) {
    const route = policyContext.request?.path || policyContext.request?.url || 'unknown';
    const method = policyContext.request?.method || 'UNKNOWN';
    strapi.log.warn(`Rate limit exceeded: ${method} ${route} key=${redactForLog(key)}`);
    throw new errors.RateLimitError('Too many requests');
  }

  return true;
};
