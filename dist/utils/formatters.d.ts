/**
 * Formatter utilities for author names and ORCID IDs.
 *
 * Removed the unused `formatAuthors` (see docs/code-review.md #11).
 */
/**
 * Format OpenAlex display name to "LastName, FirstName" format.
 * Example: "John Doe" → "Doe, John"
 */
export declare function formatAuthorName(displayName: string): string;
/**
 * Extract ORCID ID from an ORCID URL or bare ID.
 *
 *   "https://orcid.org/0000-0001-2345-6789" → "0000-0001-2345-6789"
 *   "0000-0001-2345-6789"                    → "0000-0001-2345-6789"
 *   "0000-0001-2345-678X"                    → "0000-0001-2345-678X"
 */
export declare function extractOrcidId(orcidUrl: string | null | undefined): string | null;
//# sourceMappingURL=formatters.d.ts.map