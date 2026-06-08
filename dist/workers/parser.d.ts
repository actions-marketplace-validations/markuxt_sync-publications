/**
 * Parse OpenAlex work data into PendingPublication format.
 *
 * Addresses docs/code-review.md #14 — accepts the typed `OpenAlexWork`
 * directly (the cast from `unknown` happens once, at the API boundary,
 * in `openalex.ts`).
 */
import type { PendingPublication, OpenAlexWork } from '../types.js';
/**
 * Parse an OpenAlex work object into our internal publication format.
 * Returns null if the work is missing required fields (id / title / year).
 */
export declare function parseWork(work: OpenAlexWork): PendingPublication | null;
//# sourceMappingURL=parser.d.ts.map