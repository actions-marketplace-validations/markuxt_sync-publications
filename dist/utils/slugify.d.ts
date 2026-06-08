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
export declare function slugify(title: string, opts?: {
    maxLength?: number;
}): string;
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
export declare function pickFilenameStem(title: string, openalexId: string, used: Set<string>): string;
//# sourceMappingURL=slugify.d.ts.map