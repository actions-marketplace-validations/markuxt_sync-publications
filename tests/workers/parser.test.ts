import { describe, it, expect } from 'vitest'
import { parseWork } from '../../src/workers/parser'
import type { OpenAlexWork } from '../../src/types'

const baseWork: OpenAlexWork = {
  id: 'https://openalex.org/W274' as unknown as string,
  title: 'A Test Paper',
  publication_year: 2024
}

describe('parseWork', () => {
  it('returns null when id is missing', () => {
    expect(parseWork({ ...baseWork, id: '' } as OpenAlexWork)).toBeNull()
  })

  it('returns null when title is missing', () => {
    expect(parseWork({ ...baseWork, title: '' } as OpenAlexWork)).toBeNull()
  })

  it('returns null when title is whitespace-only', () => {
    expect(parseWork({ ...baseWork, title: '   ' } as OpenAlexWork)).toBeNull()
  })

  it('returns null when year is missing', () => {
    expect(parseWork({ ...baseWork, publication_year: undefined } as unknown as OpenAlexWork)).toBeNull()
  })

  it('strips the OpenAlex URL prefix from the id', () => {
    const pub = parseWork(baseWork)!
    expect(pub.openalexId).toBe('W274')
  })

  it('formats authors as "LastName, FirstName"', () => {
    const work: OpenAlexWork = {
      ...baseWork,
      authorships: [
        { author: { display_name: 'Jane Doe', orcid: 'https://orcid.org/0000-0001-2345-6789' } },
        { author: { display_name: 'John Smith' } }
      ]
    }
    const pub = parseWork(work)!
    expect(pub.authors).toEqual(['Doe, Jane', 'Smith, John'])
    expect(pub.authorsOrcid).toEqual(['0000-0001-2345-6789', null])
  })

  it('keeps authors and authorsOrcid parallel even when display_name is missing', () => {
    // Previously authors filtered out null display_names but authorsOrcid
    // did not, leaving the two arrays out of sync.
    const work: OpenAlexWork = {
      ...baseWork,
      authorships: [
        { author: { display_name: 'Jane Doe', orcid: 'https://orcid.org/0000-0001-2345-6789' } },
        { author: { orcid: 'https://orcid.org/0000-0002-0000-0000' } }, // no display_name
        { author: { display_name: 'John Smith' } }
      ]
    }
    const pub = parseWork(work)!
    expect(pub.authors).toEqual(['Doe, Jane', 'Smith, John'])
    expect(pub.authorsOrcid).toEqual(['0000-0001-2345-6789', null])
    expect(pub.authors.length).toBe(pub.authorsOrcid.length)
  })

  it('dedupes authors that OpenAlex lists once per affiliation', () => {
    // OpenAlex expands authorships per (author × institution). The same
    // author with two UNNC-affiliated entries should appear once.
    const work: OpenAlexWork = {
      ...baseWork,
      authorships: [
        { author: { display_name: 'Jane Doe', orcid: 'https://orcid.org/0000-0001-2345-6789' } },
        { author: { display_name: 'Jane Doe', orcid: 'https://orcid.org/0000-0001-2345-6789' } },
        { author: { display_name: 'John Smith', orcid: 'https://orcid.org/0000-0002-0000-0001' } }
      ]
    }
    const pub = parseWork(work)!
    expect(pub.authors).toEqual(['Doe, Jane', 'Smith, John'])
    expect(pub.authorsOrcid).toEqual(['0000-0001-2345-6789', '0000-0002-0000-0001'])
  })

  it('dedupes by display name when ORCID is missing', () => {
    // Two "John Smith" entries without ORCID should collapse to one.
    const work: OpenAlexWork = {
      ...baseWork,
      authorships: [
        { author: { display_name: 'John Smith' } },
        { author: { display_name: 'John Smith' } },
        { author: { display_name: 'Jane Doe' } }
      ]
    }
    const pub = parseWork(work)!
    expect(pub.authors).toEqual(['Smith, John', 'Doe, Jane'])
    expect(pub.authorsOrcid).toEqual([null, null])
  })

  it('dedupes when the same person appears with ORCID once and without ORCID once', () => {
    // OpenAlex sometimes lists the same person once with their ORCID (per
    // institution A) and again without it (per institution B). Both
    // keys must be tracked so the second occurrence is recognised as a
    // duplicate.
    const work: OpenAlexWork = {
      ...baseWork,
      authorships: [
        { author: { display_name: 'Jane Doe', orcid: 'https://orcid.org/0000-0001-2345-6789' } },
        { author: { display_name: 'Jane Doe' } }, // no ORCID, same person
        { author: { display_name: 'John Smith' } }
      ]
    }
    const pub = parseWork(work)!
    expect(pub.authors).toEqual(['Doe, Jane', 'Smith, John'])
    expect(pub.authorsOrcid).toEqual(['0000-0001-2345-6789', null])
  })

  it('keeps first occurrence when same ORCID appears with different display name spellings', () => {
    // ORCID is the canonical key. If the same ORCID shows up twice with
    // different display_name (typo, transliteration, etc.) we keep the
    // first spelling and drop later occurrences.
    //
    // "Wang Yi" → formatAuthorName → "Yi, Wang" (last, first)
    // "Yi Wang" → formatAuthorName → "Wang, Yi"
    // First wins, so output is ["Yi, Wang"].
    const work: OpenAlexWork = {
      ...baseWork,
      authorships: [
        { author: { display_name: 'Wang Yi', orcid: 'https://orcid.org/0000-0001-0000-0001' } },
        { author: { display_name: 'Yi Wang', orcid: 'https://orcid.org/0000-0001-0000-0001' } }
      ]
    }
    const pub = parseWork(work)!
    expect(pub.authors).toEqual(['Yi, Wang'])
  })

  it('canonicalises the DOI to https://doi.org/<doi>', () => {
    const work: OpenAlexWork = { ...baseWork, doi: '10.1000/foo' }
    expect(parseWork(work)!.doi).toBe('https://doi.org/10.1000/foo')
  })

  it('lowercases DOI when canonicalising', () => {
    const work: OpenAlexWork = { ...baseWork, doi: '10.1000/FOO' }
    expect(parseWork(work)!.doi).toBe('https://doi.org/10.1000/foo')
  })

  it('returns null DOI when none is present', () => {
    expect(parseWork(baseWork)!.doi).toBeNull()
  })

  it('extracts venue from primary_location.source.display_name', () => {
    const work: OpenAlexWork = {
      ...baseWork,
      primary_location: { source: { display_name: 'ICRA 2024' } }
    }
    expect(parseWork(work)!.venue).toBe('ICRA 2024')
  })

  it('extracts keywords from work.keywords', () => {
    const work: OpenAlexWork = {
      ...baseWork,
      keywords: [{ display_name: 'robotics' }, { display_name: 'control' }, { display_name: '' }]
    }
    expect(parseWork(work)!.keywords).toEqual(['robotics', 'control'])
  })

  it('reconstructs the abstract from the inverted index', () => {
    const work: OpenAlexWork = {
      ...baseWork,
      abstract_inverted_index: { Hello: [0], world: [1] }
    }
    expect(parseWork(work)!.abstract).toBe('Hello world')
  })

  it('populates pdfUrl from best_oa_location', () => {
    const work: OpenAlexWork = {
      ...baseWork,
      best_oa_location: { pdf_url: 'https://example.com/paper.pdf' }
    }
    expect(parseWork(work)!.pdfUrl).toBe('https://example.com/paper.pdf')
  })

  it('initialises screenshot fields to null', () => {
    const pub = parseWork(baseWork)!
    expect(pub.abstractPage).toBeNull()
    expect(pub.abstractScreenshot).toBeNull()
  })

  it('initialises hidden to false', () => {
    expect(parseWork(baseWork)!.hidden).toBe(false)
  })
})
