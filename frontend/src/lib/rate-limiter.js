import { LRUCache } from "lru-cache"

/**
 * Create a request rate limiter using LRU cache with TTL.
 * Returns { check(key): boolean, isLimited(key): boolean }
 *
 * check() increments the counter and returns true if over limit.
 * isLimited() returns true if key is already over limit (no increment).
 */
export function createRequestRateLimiter({ limit, window }) {
  const cache = new LRUCache({
    max: 10000,
    ttl: window,
  })

  return {
    check(key) {
      const current = cache.get(key) || 0
      const next = current + 1
      cache.set(key, next)
      return next > limit
    },
    isLimited(key) {
      const current = cache.get(key) || 0
      return current > limit
    },
  }
}

/**
 * Create a failed-attempt limiter with a block duration.
 * After `limit` failures within `interval`, the key is blocked for `blockDuration`.
 *
 * increment(key) records a failure and returns true if now blocked.
 * isBlocked(key) returns true if key is currently blocked.
 */
export function createFailedAttemptLimiter({ limit, interval, blockDuration }) {
  const attempts = new LRUCache({
    max: 10000,
    ttl: interval,
  })

  const blocked = new LRUCache({
    max: 10000,
    ttl: blockDuration,
  })

  return {
    isBlocked(key) {
      return blocked.has(key)
    },
    increment(key) {
      if (blocked.has(key)) return true
      const current = (attempts.get(key) || 0) + 1
      attempts.set(key, current)
      if (current >= limit) {
        blocked.set(key, true)
        attempts.delete(key)
        return true
      }
      return false
    },
  }
}
