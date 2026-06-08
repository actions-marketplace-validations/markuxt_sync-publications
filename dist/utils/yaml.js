/**
 * YAML frontmatter parsing and generation utilities.
 *
 * Replaced the hand-rolled parser with the `yaml` package to address
 * docs/code-review.md #9 — the previous parser only returned strings,
 * didn't understand inline arrays / block scalars / comments, and was
 * brittle under any user editing.
 */
import { parse as yamlParse, stringify as yamlStringify } from 'yaml';
/**
 * Parse the YAML frontmatter block from a markdown file.
 *
 * Returns an empty object if no frontmatter is present. Throws up to the
 * caller for malformed YAML — better to fail loudly than to silently drop
 * fields.
 */
export function parseYamlFrontmatter(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match)
        return {};
    return yamlParse(match[1]) ?? {};
}
/**
 * Escape a string value for use as a YAML scalar.
 *
 * We delegate to `yaml.stringify` of a single value so we always get correct
 * quoting, including for strings containing `:`, leading/trailing whitespace,
 * CJK characters, etc.
 *
 * Empty string is special-cased to return '' so callers writing
 * `field: ${yamlStr(value)}` produce a clean `field: ` instead of `field: ""`.
 */
export function yamlStr(value) {
    if (value === '')
        return '';
    const doc = yamlStringify(value, { defaultStringType: 'PLAIN' });
    return doc.replace(/\n$/, '');
}
/**
 * Stringify an arbitrary value as YAML (for tests / structured output).
 */
export function stringifyYaml(value) {
    return yamlStringify(value);
}
//# sourceMappingURL=yaml.js.map