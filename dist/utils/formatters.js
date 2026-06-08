/**
 * Formatter utilities for author names and ORCID IDs.
 *
 * Removed the unused `formatAuthors` (see docs/code-review.md #11).
 */
/**
 * Format OpenAlex display name to "LastName, FirstName" format.
 * Example: "John Doe" → "Doe, John"
 */
export function formatAuthorName(displayName) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length === 1)
        return parts[0];
    const last = parts[parts.length - 1];
    const first = parts.slice(0, -1).join(' ');
    return `${last}, ${first}`;
}
/**
 * Extract ORCID ID from an ORCID URL or bare ID.
 *
 *   "https://orcid.org/0000-0001-2345-6789" → "0000-0001-2345-6789"
 *   "0000-0001-2345-6789"                    → "0000-0001-2345-6789"
 *   "0000-0001-2345-678X"                    → "0000-0001-2345-678X"
 */
export function extractOrcidId(orcidUrl) {
    if (!orcidUrl)
        return null;
    const match = orcidUrl.match(/(\d{4}-\d{4}-\d{4}-\d{3}[\dX])/);
    return match ? match[1] : null;
}
//# sourceMappingURL=formatters.js.map