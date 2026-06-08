import { describe, it, expect } from 'vitest'
import { parseWork } from '../../src/workers/parser.js'
import type { OpenAlexWork } from '../../src/types.js'

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
