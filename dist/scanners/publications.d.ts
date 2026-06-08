/**
 * Scan existing publications from content directory.
 *
 * Addresses docs/code-review.md #15 — explicit radix for parseInt.
 */
import type { ExistingPublication } from '../types.js';
/**
 * Scan all existing publications and extract metadata for deduplication.
 *
 * Note: we keep raw `openalex_id` (with leading W) here — the comparison
 * set in `index.ts` strips the W so both forms of stored ID match.
 */
export declare function scanExistingPublications(publicationsDir: string): Promise<ExistingPublication[]>;
//# sourceMappingURL=publications.d.ts.map