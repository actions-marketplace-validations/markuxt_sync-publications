/**
 * GitHub Actions output utilities.
 *
 * Addresses docs/code-review.md:
 *   #4 — multiline values must use the heredoc delimiter format.
 *   #8 — `::set-output` is deprecated, removed.
 */
import { appendFileSync } from 'fs';
let githubOutputPath = '';
/**
 * Heredoc delimiter. GitHub's runner interprets the first line of the value
 * as the EOF marker, so we prefix with a unique token that is unlikely to
 * appear in real values.
 */
const HEREDOC_EOF = 'EOF_MARKUXT_SYNC_PUBLICATIONS';
/**
 * Initialise the GitHub Actions output path.
 * Pass an empty string when running locally — setOutput becomes a no-op
 * (it still logs to stdout).
 */
export function initGitHubOutput(path) {
    githubOutputPath = path;
}
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
export function setOutput(name, value) {
    if (!githubOutputPath) {
        // Local mode: nothing to write, but log so debugging is easier.
        return;
    }
    const block = value.includes('\n')
        ? `${name}<<${HEREDOC_EOF}\n${value}\n${HEREDOC_EOF}\n`
        : `${name}=${value}\n`;
    appendFileSync(githubOutputPath, block);
}
/**
 * Test hook: reset module state between tests.
 */
export function _resetGitHubOutputPath() {
    githubOutputPath = '';
}
//# sourceMappingURL=github.js.map