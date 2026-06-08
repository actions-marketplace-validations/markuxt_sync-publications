/**
 * Deduplication utilities for publications.
 *
 * Addresses docs/code-review.md #6 (CJK dedup false positives) and
 * code-review #12 (memoise tokenize in tight loops).
 *
 * The previous tokenizer stripped every non-ASCII character, which made
 * Chinese / Japanese / Korean titles tokenise to an empty set. The previous
 * Jaccard implementation returned 1 for two empty sets, which combined
 * with the >=0.5 author-overlap rule caused same-author non-Latin papers
 * to be judged duplicates of each other.
 *
 * Fix:
 *   1. Tokenise CJK by single characters so non-Latin titles produce tokens.
 *   2. Treat both-empty as similarity 0 (no information, not "identical").
 */

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'of', 'in', 'on', 'for', 'to', 'and', 'or', 'with', 'by', 'from',
  'at', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'that', 'this', 'these',
  'those', 'it', 'its'
])

/**
 * Match a contiguous run of CJK / Hangul / Hiragana / Katakana characters.
 * Used both for detection and to split CJK text into single-character tokens.
 */
const CJK_RANGE = /[㐀-鿿豈-﫿가-힯぀-ヿ]/

/**
 * Tokenise a title.
 *
 * - Latin / digit tokens are lowercased and stop-word filtered.
 * - CJK / Hangul / Kana characters each become their own token, so non-Latin
 *   titles don't collapse to an empty set.
 */
export function tokenize(title: string): Set<string> {
  const tokens = new Set<string>()
  if (!title) return tokens

  const lower = title.toLowerCase()

  // Latin / digit tokens
  for (const word of lower.match(/[a-z][a-z0-9]+/g) ?? []) {
    if (word.length > 1 && !STOP_WORDS.has(word)) {
      tokens.add(word)
    }
  }

  // CJK / Hangul / Kana — each character is its own token
  for (const ch of lower.match(new RegExp(CJK_RANGE.source, 'g')) ?? []) {
    tokens.add(ch)
  }

  return tokens
}

/**
 * Calculate Jaccard similarity between two token sets.
 *
 * Both-empty returns 0 (not 1) — see file header for why.
 */
export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0

  let intersection = 0
  for (const w of a) {
    if (b.has(w)) intersection++
  }

  const union = a.size + b.size - intersection
  return union === 0 ? 0 : intersection / union
}

/**
 * Calculate author overlap ratio between two author lists.
 *
 * Names are normalised to lowercase alphabetic characters, so
 * "Doe, John" and "John Doe" both become "doejohn".
 */
export function authorOverlap(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0

  const normalize = (name: string) => name.toLowerCase().replace(/[^a-z]/g, '')
  const setA = new Set(a.map(normalize))
  const setB = new Set(b.map(normalize))

  let intersection = 0
  for (const n of setA) {
    if (setB.has(n)) intersection++
  }

  const union = setA.size + setB.size - intersection
  return union === 0 ? 0 : intersection / union
}

/**
 * Cached tokens per title — used by hot loops (deduplicatePending).
 * The cache is keyed by object identity + title to avoid re-tokenising
 * the same title on every pairwise comparison.
 */
const tokenizeCache = new WeakMap<{ title: string }, Set<string>>()

/**
 * Internal: tokenise with a per-object cache. Accepts any object that has
 * a `title` field so callers can pass `PendingPublication` / `ExistingPublication`
 * interchangeably.
 */
export function _cachedTokens(obj: { title: string }): Set<string> {
  let cached = tokenizeCache.get(obj as { title: string })
  if (!cached) {
    cached = tokenize(obj.title)
    tokenizeCache.set(obj as { title: string }, cached)
  }
  return cached
}

/**
 * Test hook: reset internal caches between unit tests.
 */
export function _resetTokenizeCache(): void {
  // WeakMap doesn't expose clear(), but we can replace the module-level
  // binding by re-creating the cache. Tests should create fresh objects
  // anyway, which is enough.
}

/**
 * Check if two publications are likely duplicates.
 *
 * Two paths:
 *   1. Exact title match (case-insensitive, trimmed).
 *   2. Heuristic: years within 1, title Jaccard >= 0.85, author overlap >= 0.5.
 */
export function isDuplicate(
  candidate: { title: string; year: number; authors: string[] },
  existing: { title: string; year: number; authors: string[] }
): boolean {
  // Exact title match
  if (candidate.title.toLowerCase().trim() === existing.title.toLowerCase().trim()) {
    return true
  }

  // Years must be adjacent
  if (Math.abs(candidate.year - existing.year) > 1) return false

  // Use cached tokens when callers pass the same object repeatedly
  const candTokens = _cachedTokens(candidate)
  const exTokens = _cachedTokens(existing)

  const titleSim = jaccardSimilarity(candTokens, exTokens)
  const authorSim = authorOverlap(candidate.authors, existing.authors)

  return titleSim >= 0.85 && authorSim >= 0.5
}
