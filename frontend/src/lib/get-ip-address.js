import { createHmac, randomBytes } from "crypto"

// Random salt generated at process start — correlates within a single
// process lifetime but can't be brute-forced after restart.
const bootSalt = randomBytes(32)

/**
 * Return a short, non-reversible keyed hash for logging.
 * Same input produces the same 8-char hex string within a process,
 * but changes on restart so it can't be brute-forced offline.
 */
export function redactForLog(value) {
  if (!value) return "unknown"
  return createHmac("sha256", bootSalt).update(value).digest("hex").slice(0, 8)
}

/**
 * Extract client IP from request headers.
 * Checks Cloudflare header first, then X-Forwarded-For, then null.
 */
export function getIpAddress(req) {
  const cfIp = req.headers["cf-connecting-ip"]
  if (cfIp) return Array.isArray(cfIp) ? cfIp[0] : cfIp

  const xff = req.headers["x-forwarded-for"]
  if (xff) {
    const first = (Array.isArray(xff) ? xff[0] : xff).split(",")[0].trim()
    return first || null
  }

  return null
}
