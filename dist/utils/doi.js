/**
 * DOI normalization utilities.
 *
 * Centralised so deduplication, parsing and any future call sites
 * stay aligned (see docs/code-review.md #15).
 */
const DOI_PREFIXES = /^https?:\/\/(dx\.)?doi\.org\//i;
const DOI_SCHEME = /^doi:/i;
/**
 * Normalise a DOI string to its bare form (lowercased, no scheme, no resolver URL).
 *
 *   "https://doi.org/10.1000/foo"   → "10.1000/foo"
 *   "https://dx.doi.org/10.1000/FOO" → "10.1000/foo"
 *   "doi:10.1000/foo"                → "10.1000/foo"
 *   "10.1000/foo"                    → "10.1000/foo"
 *
 * Returns null if the input is empty / not a valid-looking DOI.
 */
export function normalizeDoi(input) {
    if (!input)
        return null;
    const trimmed = input.trim().replace(DOI_PREFIXES, '').replace(DOI_SCHEME, '');
    if (!trimmed)
        return null;
    // A DOI must contain at least one "/" — otherwise it's not a DOI.
    if (!trimmed.includes('/'))
        return null;
    return trimmed.toLowerCase();
}
/**
 * Convert a bare or URL-form DOI to its canonical https://doi.org/ URL.
 * Returns null if the input is not a valid DOI.
 */
export function doiToUrl(input) {
    const normalized = normalizeDoi(input);
    if (!normalized)
        return null;
    return `https://doi.org/${normalized}`;
}
//# sourceMappingURL=doi.js.map