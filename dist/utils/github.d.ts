/**
 * GitHub Actions output utilities.
 *
 * Addresses docs/code-review.md:
 *   #4 — multiline values must use the heredoc delimiter format.
 *   #8 — `::set-output` is deprecated, removed.
 */
/**
 * Initialise the GitHub Actions output path.
 * Pass an empty string when running locally — setOutput becomes a no-op
 * (it still logs to stdout).
 */
export declare function initGitHubOutput(path: string): void;
/**
 * Write a GitHub Actions output.
 *
 * Multiline values are emitted using the heredoc delimiter format so the
 * runner does not truncate after the first newline:
 *
 *   name<<EOF
 *   line1
 *   line2
 *   EOF
 */
export declare function setOutput(name: string, value: string): void;
/**
 * Test hook: reset module state between tests.
 */
export declare function _resetGitHubOutputPath(): void;
//# sourceMappingURL=github.d.ts.map