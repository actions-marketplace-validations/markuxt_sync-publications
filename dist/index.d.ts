#!/usr/bin/env -S npx tsx
/**
 * markuxt-sync-publications
 *
 * GitHub Action to sync publications from OpenAlex based on member ORCIDs.
 * Fetches publications for all members with ORCID, deduplicates against
 * existing content, and writes new markdown files to
 * <content_dir>/publications/<year>/<openalex_id>/index.md
 *
 * Usage:
 *   - GitHub Action (see action.yml) — INPUT_* env vars are set automatically.
 *   - Local: copy .env.example to .env.development, fill values, `pnpm dev`.
 */
export {};
//# sourceMappingURL=index.d.ts.map