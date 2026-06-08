/**
 * OpenAlex API utilities.
 *
 * Addresses docs/code-review.md:
 *   #7  — uses fetchWithRetry for timeout + backoff retry on 429/5xx.
 *   #10 — keeps encodeURIComponent on filter values (verified to work).
 *   #14 — getWorksForAuthor returns OpenAlexWork[] (typed, not unknown[]).
 */
import type { OpenAlexWork } from '../types.js';
/**
 * Fetch from OpenAlex API with mailto + User-Agent (polite pool).
 * Retries automatically on transient failures.
 */
export declare function oaFetch(path: string, contactEmail: string): Promise<unknown>;
/**
 * Get OpenAlex institution ID from a ROR ID.
 */
export declare function getInstitutionId(rorId: string, contactEmail: string): Promise<string>;
/**
 * Get OpenAlex author ID from an ORCID.
 */
export declare function getAuthorId(orcid: string, contactEmail: string): Promise<string | null>;
/**
 * Get all works for an author affiliated with a specific institution.
 * Pages through OpenAlex's cursor pagination until exhausted.
 */
export declare function getWorksForAuthor(authorId: string, institutionId: string, contactEmail: string): Promise<OpenAlexWork[]>;
//# sourceMappingURL=openalex.d.ts.map