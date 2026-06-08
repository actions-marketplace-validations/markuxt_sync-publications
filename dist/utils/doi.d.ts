/**
 * DOI normalization utilities.
 *
 * Centralised so deduplication, parsing and any future call sites
 * stay aligned (see docs/code-review.md #15).
 */
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
export declare function normalizeDoi(input: string | null | undefined): string | null;
/**
 * Convert a bare or URL-form DOI to its canonical https://doi.org/ URL.
 * Returns null if the input is not a valid DOI.
 */
export declare function doiToUrl(input: string | null | undefined): string | null;
//# sourceMappingURL=doi.d.ts.map