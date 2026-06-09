/**
 * HTTP fetch with timeout + exponential backoff retry.
 *
 * Addresses docs/code-review.md #7: OpenAlex requests had no timeout
 * (could hang the whole action until runner timeout) and no retry
 * (a single 429/5xx hiccup would fail the entire sync).
 */

import type { FetchOptions } from '../types'

const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_RETRIES = 3
const RETRY_STATUS = new Set([408, 425, 429, 500, 502, 503, 504])
const BACKOFF_BASE_MS = 500

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(new Error('Aborted'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function getRetryDelay(attempt: number, response?: Response): number {
  const retryAfter = response?.headers.get('retry-after')
  if (retryAfter) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds) && seconds > 0 && seconds < 60) {
      return seconds * 1000
    }
  }
  // Exponential backoff with jitter: 500ms, 1s, 2s, 4s… (+ up to 25% jitter)
  const base = BACKOFF_BASE_MS * Math.pow(2, attempt)
  const jitter = Math.random() * base * 0.25
  return base + jitter
}

/**
 * Fetch wrapper with timeout and retry.
 *
 * - Retries on network errors and on HTTP 408/425/429/5xx responses.
 * - Honours Retry-After headers when present.
 * - Aborts early if the caller's signal fires.
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit & FetchOptions = {}
): Promise<Response> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    signal,
    ...rest
  } = init

  let lastError: unknown
  let lastResponse: Response | undefined

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal?.aborted) throw new Error('Aborted')

    const ac = new AbortController()
    const onAbort = () => ac.abort()
    signal?.addEventListener('abort', onAbort, { once: true })
    const timer = setTimeout(() => ac.abort(new Error('Request timeout')), timeoutMs)

    try {
      const res = await fetch(url, { ...rest, signal: ac.signal })
      lastResponse = res

      if (res.ok || !RETRY_STATUS.has(res.status)) {
        return res
      }

      // Retryable HTTP status
      lastError = new Error(`HTTP ${res.status}: ${url}`)
      if (attempt === retries) {
        // Surface the original response so callers can read the body
        return res
      }
    } catch (err) {
      lastError = err
      if (signal?.aborted) throw err
      if (attempt === retries) throw err
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }

    const delay = getRetryDelay(attempt, lastResponse)
    await sleep(delay, signal)
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('fetchWithRetry: exhausted retries')
}
