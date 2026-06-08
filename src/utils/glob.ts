/**
 * Glob utilities for file system operations.
 *
 * Removed the unused `readMarkdownFiles` and `filterByFrontmatter`
 * (see docs/code-review.md #11). The active scanner code reads files
 * itself so it can attach per-file context to errors.
 */

import { glob } from 'glob'

/**
 * Default glob options for markdown files.
 */
export const DEFAULT_GLOB_OPTIONS = {
  absolute: true,
  dot: false,    // Skip dotfiles
  nodir: true,   // Skip directories
  unique: true   // Ensure uniqueness
} as const

/**
 * Find all markdown files in a directory.
 */
export async function findMarkdownFiles(
  cwd: string,
  pattern: string = '**/*.md'
): Promise<string[]> {
  if (!cwd) return []
  return glob(pattern, { ...DEFAULT_GLOB_OPTIONS, cwd })
}
