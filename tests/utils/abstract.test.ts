import { describe, it, expect } from 'vitest'
import { reconstructAbstract } from '../../src/utils/abstract.js'

describe('reconstructAbstract', () => {
  it('returns null for null/undefined input', () => {
    expect(reconstructAbstract(null)).toBeNull()
    expect(reconstructAbstract(undefined)).toBeNull()
  })

  it('returns null for an empty index', () => {
    expect(reconstructAbstract({})).toBeNull()
  })

  it('returns null when no entries produce any tokens', () => {
    // Object with no values at all is treated as empty
    expect(reconstructAbstract({ foo: [] })).toBeNull()
  })

  it('reconstructs a simple abstract in correct order', () => {
    const idx = {
      Hello: [0],
      world: [1]
    }
    expect(reconstructAbstract(idx)).toBe('Hello world')
  })

  it('handles a single word appearing at multiple positions', () => {
    const idx = {
      the: [0, 3],
      robot: [1],
      moved: [2]
    }
    expect(reconstructAbstract(idx)).toBe('the robot moved the')
  })

  it('preserves word order even when dict iteration order would scramble it', () => {
    const idx = {
      last: [4],
      first: [0],
      middle: [2]
    }
    expect(reconstructAbstract(idx)).toBe('first middle last')
  })

  it('returns a string with single-space separators for normal input', () => {
    const idx = {
      We: [0],
      present: [1],
      'a': [2],
      'novel': [3],
      'approach': [4]
    }
    expect(reconstructAbstract(idx)).toBe('We present a novel approach')
  })
})
