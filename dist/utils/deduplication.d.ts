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
/**
 * Tokenise a title.
 *
 * - Latin / digit tokens are lowercased and stop-word filtered.
 * - CJK / Hangul / Kana characters each become their own token, so non-Latin
 *   titles don't collapse to an empty set.
 */
export declare function tokenize(title: string): Set<string>;
/**
 * Calculate Jaccard similarity between two token sets.
 *
 * Both-empty returns 0 (not 1) — see file header for why.
 */
export declare function jaccardSimilarity(a: Set<string>, b: Set<string>): number;
/**
 * Calculate author overlap ratio between two author lists.
 *
 * Names are normalised to lowercase alphabetic characters, so
 * "Doe, John" and "John Doe" both become "doejohn".
 */
export declare function authorOverlap(a: string[], b: string[]): number;
/**
 * Internal: tokenise with a per-object cache. Accepts any object that has
 * a `title` field so callers can pass `PendingPublication` / `ExistingPublication`
 * interchangeably.
 */
export declare function _cachedTokens(obj: {
    title: string;
}): Set<string>;
/**
 * Test hook: reset internal caches between unit tests.
 */
export declare function _resetTokenizeCache(): void;
/**
 * Check if two publications are likely duplicates.
 *
 * Two paths:
 *   1. Exact title match (case-insensitive, trimmed).
 *   2. Heuristic: years within 1, title Jaccard >= 0.85, author overlap >= 0.5.
 */
export declare function isDuplicate(candidate: {
    title: string;
    year: number;
    authors: string[];
}, existing: {
    title: string;
    year: number;
    authors: string[];
}): boolean;
//# sourceMappingURL=deduplication.d.ts.map