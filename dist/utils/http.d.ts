/**
 * HTTP fetch with timeout + exponential backoff retry.
 *
 * Addresses docs/code-review.md #7: OpenAlex requests had no timeout
 * (could hang the whole action until runner timeout) and no retry
 * (a single 429/5xx hiccup would fail the entire sync).
 */
import type { FetchOptions } from '../types.js';
/**
 * Fetch wrapper with timeout and retry.
 *
 * - Retries on network errors and on HTTP 408/425/429/5xx responses.
 * - Honours Retry-After headers when present.
 * - Aborts early if the caller's signal fires.
 */
export declare function fetchWithRetry(url: string, init?: RequestInit & FetchOptions): Promise<Response>;
//# sourceMappingURL=http.d.ts.map