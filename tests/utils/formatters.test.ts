import { describe, it, expect } from 'vitest'
import { formatAuthorName, extractOrcidId } from '../../src/utils/formatters.js'

describe('formatAuthorName', () => {
  it('formats "John Doe" as "Doe, John"', () => {
    expect(formatAuthorName('John Doe')).toBe('Doe, John')
  })

  it('formats "John A. Doe" as "Doe, John A."', () => {
    expect(formatAuthorName('John A. Doe')).toBe('Doe, John A.')
  })

  it('handles a single name', () => {
    expect(formatAuthorName('Cher')).toBe('Cher')
  })

  it('trims whitespace before splitting', () => {
    expect(formatAuthorName('  John   Doe  ')).toBe('Doe, John')
  })

  it('handles empty input', () => {
    expect(formatAuthorName('')).toBe('')
  })
})

describe('extractOrcidId', () => {
  it('extracts from a full ORCID URL', () => {
    expect(extractOrcidId('https://orcid.org/0000-0001-2345-6789'))
      .toBe('0000-0001-2345-6789')
  })

  it('extracts from a bare ORCID', () => {
    expect(extractOrcidId('0000-0001-2345-6789')).toBe('0000-0001-2345-6789')
  })

  it('handles ORCIDs with X as the check digit', () => {
    expect(extractOrcidId('https://orcid.org/0000-0002-1825-009X'))
      .toBe('0000-0002-1825-009X')
  })

  it('returns null for non-ORCID strings', () => {
    expect(extractOrcidId('not an orcid')).toBeNull()
  })

  it('returns null for null/undefined/empty', () => {
    expect(extractOrcidId(null)).toBeNull()
    expect(extractOrcidId(undefined)).toBeNull()
    expect(extractOrcidId('')).toBeNull()
  })
})
