import { describe, it, expect } from 'vitest'
import { slugify, pickFilenameStem } from '../../src/utils/slugify'

describe('slugify', () => {
  it('lowercases and dashes whitespace', () => {
    expect(slugify('A Novel Approach')).toBe('a-novel-approach')
  })

  it('strips punctuation but keeps separators', () => {
    expect(slugify('Hello, World!')).toBe('hello-world')
    expect(slugify("Robots: Friend or Foe?")).toBe('robots-friend-or-foe')
  })

  it('preserves digits and inner dashes', () => {
    expect(slugify('Chapter 3: The Setup')).toBe('chapter-3-the-setup')
    expect(slugify('Deep-Learning Robots')).toBe('deep-learning-robots')
  })

  it('collapses consecutive separators', () => {
    expect(slugify('A  B — C')).toBe('a-b-c')
  })

  it('trims leading and trailing dashes', () => {
    expect(slugify('  spaced  ')).toBe('spaced')
    expect(slugify('!!!noise!!!')).toBe('noise')
  })

  it('preserves CJK characters', () => {
    expect(slugify('基于深度学习的机器人控制')).toBe('基于深度学习的机器人控制')
  })

  it('handles mixed Latin + CJK', () => {
    expect(slugify('Deep Learning 深度学习 for Robotics')).toBe('deep-learning-深度学习-for-robotics')
  })

  it('handles Hangul and Kana', () => {
    expect(slugify('로봇 공학')).toBe('로봇-공학')
    expect(slugify('ロボット工学')).toBe('ロボット工学')
  })

  it('caps length and tidies trailing dash from truncation', () => {
    const long = 'A Very Long Title That Goes On And On Past The Maximum Allowed Length For A Filename'
    expect(slugify(long).length).toBeLessThanOrEqual(80)
    expect(slugify(long)).not.toMatch(/-$/)
  })

  it('honours a custom maxLength', () => {
    expect(slugify('abcdefghij', { maxLength: 5 })).toBe('abcde')
  })

  it('returns empty string for empty / whitespace-only input', () => {
    expect(slugify('')).toBe('')
    expect(slugify('   ')).toBe('')
    expect(slugify('!!!')).toBe('')
  })

  it('drops symbols and emoji', () => {
    expect(slugify('Robots © 2024')).toBe('robots-2024')
    expect(slugify('AI 🤖 Future')).toBe('ai-future')
  })
})

describe('pickFilenameStem', () => {
  it('returns the slug for a fresh title', () => {
    const used = new Set<string>()
    expect(pickFilenameStem('A Novel Approach', 'W123', used)).toBe('a-novel-approach')
  })

  it('falls back to OpenAlex ID when slug is empty', () => {
    const used = new Set<string>()
    expect(pickFilenameStem('!!!', 'W123', used)).toBe('W123')
    expect(pickFilenameStem('', 'W456', used)).toBe('W456')
  })

  it('disambiguates by appending the short OpenAlex ID on collision', () => {
    const used = new Set<string>(['same-title'])
    expect(pickFilenameStem('Same Title', 'W123', used)).toBe('same-title-123')
  })

  it('appends -N if even the short-ID suffix collides', () => {
    const used = new Set<string>(['same-title', 'same-title-123'])
    expect(pickFilenameStem('Same Title', 'W123', used)).toBe('same-title-123-2')
  })

  it('does NOT modify the used set itself (caller does that)', () => {
    const used = new Set<string>()
    pickFilenameStem('Title', 'W1', used)
    expect(used.size).toBe(0)
  })
})
