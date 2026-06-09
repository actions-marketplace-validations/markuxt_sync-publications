import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { oaFetch, getInstitutionId, getAuthorId, getWorksForAuthor } from '../../src/utils/openalex'

describe('openalex', () => {
  const realFetch = globalThis.fetch

  beforeEach(() => {
    // Default: every test sets up its own fetch mock.
  })

  afterEach(() => {
    globalThis.fetch = realFetch
    vi.restoreAllMocks()
  })

  function mockJsonFetch(responses: Array<{ status?: number; body: unknown }>): ReturnType<typeof vi.fn> {
    let i = 0
    const mock = vi.fn(async () => {
      const next = responses[i++] ?? responses[responses.length - 1]
      return new Response(JSON.stringify(next.body), {
        status: next.status ?? 200,
        headers: { 'content-type': 'application/json' }
      })
    })
    globalThis.fetch = mock as unknown as typeof fetch
    return mock
  }

  describe('oaFetch', () => {
    it('attaches the mailto query param', async () => {
      const mock = mockJsonFetch([{ body: { ok: true } }])
      await oaFetch('/works?foo=bar', 'me@example.com')
      expect(mock).toHaveBeenCalledOnce()
      const url = (mock.mock.calls[0] as unknown[])[0] as string
      expect(url).toContain('mailto=me%40example.com')
    })

    it('appends ? vs & correctly when the path already has a query', async () => {
      mockJsonFetch([{ body: { ok: true } }])
      await oaFetch('/works?x=1', 'me@example.com')
      // The fetch call should have been made with a URL containing both
      // x=1 and mailto=... separated by &.
      const url = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
      expect(url).toMatch(/\?x=1&mailto=/)
    })

    it('throws on non-2xx after retries are exhausted', async () => {
      const mock = vi.fn(async () => new Response('', { status: 404 }))
      globalThis.fetch = mock as unknown as typeof fetch
      await expect(oaFetch('/works', 'me@example.com')).rejects.toThrow(/404/)
    })
  })

  describe('getInstitutionId', () => {
    it('returns the first matching ID', async () => {
      mockJsonFetch([{
        body: { results: [{ id: 'I1' }], meta: {} }
      }])
      const id = await getInstitutionId('https://ror.org/03y4dt428', 'me@example.com')
      expect(id).toBe('I1')
    })

    it('throws when no institution matches', async () => {
      mockJsonFetch([{ body: { results: [], meta: {} } }])
      await expect(getInstitutionId('https://ror.org/invalid', 'me@example.com'))
        .rejects.toThrow(/Institution not found/)
    })
  })

  describe('getAuthorId', () => {
    it('returns the first matching author ID', async () => {
      mockJsonFetch([{
        body: { results: [{ id: 'A1' }], meta: {} }
      }])
      const id = await getAuthorId('0000-0001-2345-6789', 'me@example.com')
      expect(id).toBe('A1')
    })

    it('returns null when no author matches', async () => {
      mockJsonFetch([{ body: { results: [], meta: {} } }])
      const id = await getAuthorId('0000-0001-2345-6789', 'me@example.com')
      expect(id).toBeNull()
    })
  })

  describe('getWorksForAuthor', () => {
    it('paginates via cursor until next_cursor is null', async () => {
      const mock = mockJsonFetch([
        { body: { results: [{ id: 'W1' }, { id: 'W2' }], meta: { next_cursor: 'cursor2' } } },
        { body: { results: [{ id: 'W3' }], meta: { next_cursor: null } } }
      ])
      const works = await getWorksForAuthor('A1', 'I1', 'me@example.com')
      expect(works.map(w => w.id)).toEqual(['W1', 'W2', 'W3'])
      expect(mock).toHaveBeenCalledTimes(2)
    })

    it('returns OpenAlexWork[] (typed), not unknown[]', async () => {
      // Type check via runtime: results should expose .id / .title
      mockJsonFetch([{
        body: { results: [{ id: 'W1', title: 'Hello' }], meta: { next_cursor: null } }
      }])
      const works = await getWorksForAuthor('A1', 'I1', 'me@example.com')
      expect(works[0].title).toBe('Hello')
    })
  })
})
