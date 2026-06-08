import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchWithRetry } from '../../src/utils/http.js'

describe('fetchWithRetry', () => {
  const realFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = realFetch
    vi.restoreAllMocks()
  })

  function mockFetchSequence(responses: Array<Response | Error>): ReturnType<typeof vi.fn> {
    let i = 0
    const mock = vi.fn(async () => {
      const next = responses[i++]
      if (next instanceof Error) throw next
      return next
    })
    globalThis.fetch = mock as unknown as typeof fetch
    return mock
  }

  function ok(): Response {
    return new Response('{"ok":true}', { status: 200, headers: { 'content-type': 'application/json' } })
  }

  function transient(status: number, retryAfterSeconds?: number): Response {
    const headers = retryAfterSeconds != null ? { 'retry-after': String(retryAfterSeconds) } : undefined
    return new Response('', { status, headers })
  }

  function permanent(status: number): Response {
    return new Response('', { status })
  }

  it('returns the response on first success', async () => {
    const mock = mockFetchSequence([ok()])
    const res = await fetchWithRetry('https://example.com/api')
    expect(res.ok).toBe(true)
    expect(mock).toHaveBeenCalledTimes(1)
  })

  it('retries on 429 and succeeds eventually', async () => {
    const mock = mockFetchSequence([transient(429), ok()])
    const res = await fetchWithRetry('https://example.com/api', { retries: 2, timeoutMs: 5000 })
    expect(res.ok).toBe(true)
    expect(mock).toHaveBeenCalledTimes(2)
  })

  it('retries on 503 up to the retry limit, then returns the final response', async () => {
    const mock = mockFetchSequence([
      transient(503),
      transient(503),
      permanent(503)
    ])
    const res = await fetchWithRetry('https://example.com/api', { retries: 2, timeoutMs: 5000 })
    expect(res.status).toBe(503)
    expect(mock).toHaveBeenCalledTimes(3)
  })

  it('does NOT retry on permanent 4xx errors', async () => {
    const mock = mockFetchSequence([permanent(404)])
    const res = await fetchWithRetry('https://example.com/api', { retries: 3 })
    expect(res.status).toBe(404)
    expect(mock).toHaveBeenCalledTimes(1)
  })

  it('retries on network errors then succeeds', async () => {
    const mock = mockFetchSequence([
      new Error('ECONNRESET'),
      ok()
    ])
    const res = await fetchWithRetry('https://example.com/api', { retries: 3, timeoutMs: 5000 })
    expect(res.ok).toBe(true)
    expect(mock).toHaveBeenCalledTimes(2)
  })

  it('honours Retry-After header (seconds)', async () => {
    const start = Date.now()
    const mock = mockFetchSequence([transient(429, 1), ok()])
    const res = await fetchWithRetry('https://example.com/api', { retries: 2, timeoutMs: 5000 })
    expect(res.ok).toBe(true)
    // We should have waited at least ~1s for the Retry-After.
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(900)
  }, 10_000)
})
