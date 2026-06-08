/**
 * Scan members with ORCID from content directory.
 *
 * Member markdown files live under `<content_dir>/members` (any depth) and
 * must have an `orcid` field in their YAML frontmatter to be picked up.
 * Members with `_hidden: true` are skipped.
 *
 * ORCIDs are validated using the standard 16-digit (with checksum) pattern.
 * Invalid ORCIDs are skipped with a warning so a typo in one file can't
 * poison the whole sync.
 */
import type { MemberInfo } from '../types.js';
/**
 * Validate an ORCID using the ISO 7064 11-2 checksum.
 * (https://support.orcid.org/hc/en-us/articles/360006897674)
 */
declare function isValidOrcid(orcid: string): boolean;
/**
 * Scan all members and filter those with a valid ORCID.
 */
export declare function scanMembersWithOrcid(membersDir: string): Promise<MemberInfo[]>;
export declare const _internal: {
    isValidOrcid: typeof isValidOrcid;
};
export {};
//# sourceMappingURL=members.d.ts.map