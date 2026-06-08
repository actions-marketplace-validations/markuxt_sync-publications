/**
 * Title → filesystem-safe slug.
 *
 * Used as the basename for generated publication files
 * (e.g. "A Novel Approach" → "a-novel-approach.md").
 *
 * Rules:
 *   - Lower-case
 *   - Whitespace and Unicode punctuation collapse to a single '-'
 *   - Strip anything that's not a letter / digit / dash
 *   - Collapse consecutive dashes
 *   - Trim leading/trailing dashes
 *   - Cap length (default 80 chars) and clean up after truncation
 *
 * CJK / Hangul / Kana letters fall under the Unicode \p{L} class so they
 * survive the slug pipeline. On modern filesystems and HTTP servers those
 * characters round-trip fine; if your downstream tooling can't handle them,
 * wrap the slug in encodeURIComponent at the consumer side.
 *
 * Empty / whitespace-only titles return an empty string — the caller is
 * expected to fall back to the OpenAlex ID.
 */
export function slugify(title: string, opts?: { maxLength?: number }): string {
  const maxLength = opts?.maxLength ?? 80
  if (!title) return ''

  const dashed = title
    .toLowerCase()
    .replace(/[\s\p{P}]+/gu, '-')

  return dashed
    // Keep Unicode letters, digits, and dashes. Drop everything else
    // (symbols, emoji, control chars).
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLength)
    .replace(/-$/, '') // tidy trailing dash from truncation
}

/**
 * Pick a filename stem for a publication, handling empty titles and
 * collisions within the same year directory.
 *
 *   "A Novel Approach",  used={''}                 → 'a-novel-approach'
 *   "",                   used={''}                 → 'W123456789' (openalex fallback)
 *   "Same Title",         used={'same-title'}       → 'same-title-w456789' (collision)
 *
 * The caller is responsible for adding the used set to the per-year map
 * BEFORE calling for the next publication so within-batch collisions are
 * also handled.
 */
export function pickFilenameStem(
  title: string,
  openalexId: string,
  used: Set<string>
): string {
  const base = slugify(title) || openalexId

  if (!used.has(base)) return base

  // Collision: append the short OpenAlex ID (without leading W) as a
  // disambiguator. If even that collides, append -2, -3, …
  const shortId = openalexId.replace(/^W/, '')
  const withId = `${base}-${shortId}`
  if (!used.has(withId)) return withId

  let n = 2
  while (used.has(`${withId}-${n}`)) n++
  return `${withId}-${n}`
}
