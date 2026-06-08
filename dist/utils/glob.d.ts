/**
 * Glob utilities for file system operations.
 *
 * Removed the unused `readMarkdownFiles` and `filterByFrontmatter`
 * (see docs/code-review.md #11). The active scanner code reads files
 * itself so it can attach per-file context to errors.
 */
/**
 * Default glob options for markdown files.
 */
export declare const DEFAULT_GLOB_OPTIONS: {
    readonly absolute: true;
    readonly dot: false;
    readonly nodir: true;
    readonly unique: true;
};
/**
 * Find all markdown files in a directory.
 */
export declare function findMarkdownFiles(cwd: string, pattern?: string): Promise<string[]>;
//# sourceMappingURL=glob.d.ts.map