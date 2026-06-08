/**
 * Deduplication worker for processing pending publications.
 *
 * Addresses docs/code-review.md #15 — uses a shared `normalizeDoi` so the
 * DOI comparison stays in lock-step with `parser.ts`.
 */
import type { PendingPublication, ExistingPublication } from '../types.js';
/**
 * Filter out publications that already exist in the content directory.
 *
 * Three checks (any match ⇒ skip):
 *   1. Same OpenAlex ID.
 *   2. Same DOI (after normalisation).
 *   3. Heuristic similarity (title Jaccard + author overlap + year window).
 */
export declare function filterDuplicates(pending: Map<string, PendingPublication>, existing: ExistingPublication[], existingOpenalexIds: Set<string>, existingDois: Set<string>): PendingPublication[];
/**
 * Deduplicate within the pending list, marking older versions of the same
 * publication as hidden. Within each group, the newest entry stays visible.
 */
export declare function deduplicatePending(pending: PendingPublication[]): PendingPublication[];
//# sourceMappingURL=deduplicator.d.ts.map