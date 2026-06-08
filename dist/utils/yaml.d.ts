/**
 * YAML frontmatter parsing and generation utilities.
 *
 * Replaced the hand-rolled parser with the `yaml` package to address
 * docs/code-review.md #9 — the previous parser only returned strings,
 * didn't understand inline arrays / block scalars / comments, and was
 * brittle under any user editing.
 */
/**
 * Parse the YAML frontmatter block from a markdown file.
 *
 * Returns an empty object if no frontmatter is present. Throws up to the
 * caller for malformed YAML — better to fail loudly than to silently drop
 * fields.
 */
export declare function parseYamlFrontmatter(content: string): Record<string, unknown>;
/**
 * Escape a string value for use as a YAML scalar.
 *
 * We delegate to `yaml.stringify` of a single value so we always get correct
 * quoting, including for strings containing `:`, leading/trailing whitespace,
 * CJK characters, etc.
 */
export declare function yamlStr(value: string): string;
/**
 * Stringify an arbitrary value as YAML (for tests / structured output).
 */
export declare function stringifyYaml(value: unknown): string;
//# sourceMappingURL=yaml.d.ts.map