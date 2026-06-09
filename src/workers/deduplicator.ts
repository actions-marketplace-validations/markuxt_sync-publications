/**
 * Deduplication worker for processing pending publications.
 *
 * Addresses docs/code-review.md #15 — uses a shared `normalizeDoi` so the
 * DOI comparison stays in lock-step with `parser.ts`.
 */

import type { PendingPublication, ExistingPublication } from '../types'
import { isDuplicate } from '../utils/deduplication'
import { normalizeDoi } from '../utils/doi'

/**
 * Filter out publications that already exist in the content directory.
 *
 * Three checks (any match ⇒ skip):
 *   1. Same OpenAlex ID.
 *   2. Same DOI (after normalisation).
 *   3. Heuristic similarity (title Jaccard + author overlap + year window).
 */
export function filterDuplicates(
  pending: Map<string, PendingPublication>,
  existing: ExistingPublication[],
  existingOpenalexIds: Set<string>,
  existingDois: Set<string>
): PendingPublication[] {
  const result: PendingPublication[] = []

  for (const pub of pending.values()) {
    const shortId = pub.openalexId.replace(/^W/, '')

    if (existingOpenalexIds.has(shortId)) continue

    const doiKey = normalizeDoi(pub.doi)
    if (doiKey && existingDois.has(doiKey)) continue

    const dupOfExisting = existing.some(e =>
      e.title != null && e.year != null &&
      isDuplicate(
        { title: pub.title, year: pub.year, authors: pub.authors },
        { title: e.title, year: e.year, authors: e.authors ?? [] }
      )
    )

    if (dupOfExisting) continue

    result.push(pub)
  }

  return result
}

/**
 * Deduplicate within the pending list, marking older versions of the same
 * publication as hidden. Within each group, the newest entry stays visible.
 */
export function deduplicatePending(pending: PendingPublication[]): PendingPublication[] {
  const toWrite: PendingPublication[] = []
  const consumed = new Set<number>()

  for (let i = 0; i < pending.length; i++) {
    if (consumed.has(i)) continue

    const group: number[] = [i]

    for (let j = i + 1; j < pending.length; j++) {
      if (consumed.has(j)) continue

      const a = pending[i]
      const b = pending[j]

      const aDoi = normalizeDoi(a.doi)
      const bDoi = normalizeDoi(b.doi)
      const sameDoi = !!(aDoi && bDoi && aDoi === bDoi)

      const sameTitle = a.title.toLowerCase().trim() === b.title.toLowerCase().trim()

      const similar = isDuplicate(
        { title: a.title, year: a.year, authors: a.authors },
        { title: b.title, year: b.year, authors: b.authors }
      )

      if (sameDoi || sameTitle || similar) {
        group.push(j)
        consumed.add(j)
      }
    }

    consumed.add(i)

    // Sort group: newest first; hide all but the first
    group.sort((x, y) => pending[y].year - pending[x].year)

    for (let k = 0; k < group.length; k++) {
      toWrite.push({ ...pending[group[k]], hidden: k > 0 })
    }
  }

  return toWrite
}
