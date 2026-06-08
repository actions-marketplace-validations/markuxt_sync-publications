import { describe, it, expect, afterEach } from 'vitest'
import {
  tokenize,
  jaccardSimilarity,
  authorOverlap,
  isDuplicate,
  _resetTokenizeCache
} from '../../src/utils/deduplication.js'

describe('tokenize', () => {
  it('returns an empty set for empty input', () => {
    expect(tokenize('').size).toBe(0)
    expect(tokenize('   ').size).toBe(0)
  })

  it('lowercases and strips punctuation', () => {
    const tokens = tokenize('Hello, World!')
    expect(tokens.has('hello')).toBe(true)
    expect(tokens.has('world')).toBe(true)
  })

  it('drops stop words and 1-char tokens', () => {
    const tokens = tokenize('A Tree in the Park')
    expect(tokens.has('a')).toBe(false)
    expect(tokens.has('the')).toBe(false)
    expect(tokens.has('in')).toBe(false)
    expect(tokens.has('tree')).toBe(true)
    expect(tokens.has('park')).toBe(true)
  })

  it('CJK regression: produces single-char tokens instead of an empty set', () => {
    // Code-review #6: previously this returned an empty Set, which combined
    // with the both-empty Jaccard=1 rule caused same-author non-Latin papers
    // to be incorrectly deduplicated.
    const tokens = tokenize('基于深度学习的机器人控制')
    expect(tokens.size).toBeGreaterThan(0)
    expect(tokens.has('基')).toBe(true)
    expect(tokens.has('机')).toBe(true)
  })

  it('handles mixed Latin + CJK', () => {
    const tokens = tokenize('Robotics 机器人 Control')
    expect(tokens.has('robotics')).toBe(true)
    expect(tokens.has('control')).toBe(true)
    expect(tokens.has('机')).toBe(true)
  })
})

describe('jaccardSimilarity', () => {
  it('returns 0 for two empty sets (NOT 1)', () => {
    // Code-review #6: both-empty returning 1 was the root cause of the
    // CJK dedup false positives.
    expect(jaccardSimilarity(new Set(), new Set())).toBe(0)
  })

  it('returns 0 for disjoint sets', () => {
    const a = new Set(['x', 'y'])
    const b = new Set(['p', 'q'])
    expect(jaccardSimilarity(a, b)).toBe(0)
  })

  it('returns 1 for identical sets', () => {
    const a = new Set(['x', 'y', 'z'])
    expect(jaccardSimilarity(a, a)).toBe(1)
  })

  it('returns ratio = intersection / union', () => {
    const a = new Set(['a', 'b', 'c', 'd'])
    const b = new Set(['a', 'b', 'e', 'f'])
    // intersection = 2, union = 6 → 1/3
    expect(jaccardSimilarity(a, b)).toBeCloseTo(1 / 3)
  })
})

describe('authorOverlap', () => {
  it('returns 0 for either list empty', () => {
    expect(authorOverlap([], ['Doe, John'])).toBe(0)
    expect(authorOverlap(['Doe, John'], [])).toBe(0)
  })

  it('treats "Doe, John" and "Doe John" as the same author', () => {
    // Both normalize to "doejohn" (lowercased, alphabetic only)
    expect(authorOverlap(['Doe, John'], ['Doe John'])).toBe(1)
  })

  it('does NOT treat "Doe, John" and "John Doe" as identical (different name order)', () => {
    // The normalisation is character-order sensitive: "doejohn" vs "johndoe"
    // are different. Author name disambiguation is hard — for now we rely
    // on the OpenAlex-supplied display_name verbatim.
    expect(authorOverlap(['Doe, John'], ['John Doe'])).toBe(0)
  })

  it('returns intersection / union for partial overlap', () => {
    // 2 shared, 3 unique total → 2/3
    const a = ['Smith, Alice', 'Doe, John', 'Brown, Bob']
    const b = ['Smith, Alice', 'Doe, John', 'White, Wendy']
    expect(authorOverlap(a, b)).toBeCloseTo(2 / 4)
  })
})

describe('isDuplicate', () => {
  afterEach(() => _resetTokenizeCache())

  it('returns true for exact title match (case-insensitive)', () => {
    expect(isDuplicate(
      { title: 'A Study of Robots', year: 2024, authors: ['Doe, J'] },
      { title: 'a study of robots', year: 2024, authors: [] }
    )).toBe(true)
  })

  it('returns false when years differ by more than 1', () => {
    expect(isDuplicate(
      { title: 'A Study of Robots', year: 2020, authors: ['Doe, J'] },
      { title: 'A Study of Robots in Factories', year: 2024, authors: ['Doe, J'] }
    )).toBe(false)
  })

  it('returns true when title sim ≥ 0.85 and author overlap ≥ 0.5', () => {
    // Tokenise:
    //   "Deep Reinforcement Learning Robotic Manipulation"
    //      → {deep, reinforcement, learning, robotic, manipulation}
    //   "Deep Reinforcement Learning Robotic Manipulation Tasks"
    //      → {deep, reinforcement, learning, robotic, manipulation, tasks}
    //   intersection=5, union=6 → 0.83...  — close but below 0.85.
    //   Use a pair where the second title adds nothing new:
    expect(isDuplicate(
      {
        title: 'Deep Reinforcement Learning Robotic Manipulation',
        year: 2024,
        authors: ['Doe, J', 'Smith, A']
      },
      {
        title: 'Robotic Manipulation: Deep Reinforcement Learning',
        year: 2024,
        authors: ['Doe, J', 'Smith, A']
      }
    )).toBe(true)
  })

  it('CJK regression: two same-author Chinese papers with different titles are NOT duplicates', () => {
    // Code-review #6: previously these were judged duplicates because both
    // titles tokenised to empty and Jaccard(empty, empty) was 1.
    const a = {
      title: '基于深度学习的机器人控制系统设计',
      year: 2024,
      authors: ['张, 三', '李, 四']
    }
    const b = {
      title: '基于视觉传感器的自动驾驶感知算法',
      year: 2024,
      authors: ['张, 三', '李, 四']
    }
    expect(isDuplicate(a, b)).toBe(false)
  })
})
