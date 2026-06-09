import { describe, it, expect } from 'vitest'
import { normalizeDoi, doiToUrl } from '../../src/utils/doi'

describe('normalizeDoi', () => {
  it('returns null for empty / nullish input', () => {
    expect(normalizeDoi(null)).toBeNull()
    expect(normalizeDoi(undefined)).toBeNull()
    expect(normalizeDoi('')).toBeNull()
    expect(normalizeDoi('   ')).toBeNull()
  })

  it('strips the doi.org resolver prefix', () => {
    expect(normalizeDoi('https://doi.org/10.1000/foo')).toBe('10.1000/foo')
  })

  it('strips the dx.doi.org resolver prefix', () => {
    expect(normalizeDoi('https://dx.doi.org/10.1000/foo')).toBe('10.1000/foo')
  })

  it('strips the doi: scheme', () => {
    expect(normalizeDoi('doi:10.1000/foo')).toBe('10.1000/foo')
  })

  it('lowercases the result', () => {
    expect(normalizeDoi('https://doi.org/10.1000/FOO')).toBe('10.1000/foo')
  })

  it('returns null for strings that do not look like DOIs', () => {
    // A DOI must contain at least one /.
    expect(normalizeDoi('not-a-doi')).toBeNull()
  })

  it('handles already-normalised DOIs idempotently', () => {
    expect(normalizeDoi('10.1000/foo')).toBe('10.1000/foo')
  })

  it('trims surrounding whitespace', () => {
    expect(normalizeDoi('  10.1000/foo  ')).toBe('10.1000/foo')
  })
})

describe('doiToUrl', () => {
  it('returns null for invalid input', () => {
    expect(doiToUrl(null)).toBeNull()
    expect(doiToUrl('')).toBeNull()
    expect(doiToUrl('not-a-doi')).toBeNull()
  })

  it('canonicalises a bare DOI', () => {
    expect(doiToUrl('10.1000/foo')).toBe('https://doi.org/10.1000/foo')
  })

  it('canonicalises a DOI URL', () => {
    expect(doiToUrl('https://doi.org/10.1000/foo')).toBe('https://doi.org/10.1000/foo')
    expect(doiToUrl('https://dx.doi.org/10.1000/foo')).toBe('https://doi.org/10.1000/foo')
  })

  it('lowercases the path component', () => {
    expect(doiToUrl('10.1000/FOO')).toBe('https://doi.org/10.1000/foo')
  })
})
