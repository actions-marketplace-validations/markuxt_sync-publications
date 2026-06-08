import { describe, it, expect } from 'vitest'
import { parseYamlFrontmatter, yamlStr } from '../../src/utils/yaml.js'

describe('parseYamlFrontmatter', () => {
  it('returns an empty object when there is no frontmatter', () => {
    expect(parseYamlFrontmatter('Hello world')).toEqual({})
  })

  it('parses simple key:value pairs', () => {
    const md = '---\nname: John\nyear: 2024\n---\nbody'
    expect(parseYamlFrontmatter(md)).toEqual({ name: 'John', year: 2024 })
  })

  it('parses list values (block style)', () => {
    const md = '---\nkeywords:\n  - robotics\n  - control\n---\n'
    expect(parseYamlFrontmatter(md)).toEqual({ keywords: ['robotics', 'control'] })
  })

  it('parses inline arrays', () => {
    // Code-review #9: the old parser only knew `  - foo` lists. Real YAML
    // also supports [foo, bar] syntax.
    const md = '---\nkeywords: [robotics, control]\n---\n'
    expect(parseYamlFrontmatter(md)).toEqual({ keywords: ['robotics', 'control'] })
  })

  it('parses booleans / numbers as their real types', () => {
    // Code-review #9: the old parser only returned strings.
    const md = '---\n_hidden: true\ncount: 7\n---\n'
    expect(parseYamlFrontmatter(md)).toEqual({ _hidden: true, count: 7 })
  })

  it('handles CRLF line endings', () => {
    const md = '---\r\nname: John\r\nyear: 2024\r\n---\r\nbody'
    expect(parseYamlFrontmatter(md)).toEqual({ name: 'John', year: 2024 })
  })

  it('handles values containing colons', () => {
    const md = '---\ndoi: https://doi.org/10.1000/foo\n---\n'
    expect(parseYamlFrontmatter(md)).toEqual({ doi: 'https://doi.org/10.1000/foo' })
  })
})

describe('yamlStr', () => {
  it('returns plain scalars unchanged when no special chars', () => {
    expect(yamlStr('hello')).toBe('hello')
  })

  it('emits valid (parseable) YAML for URLs even when not quoted', () => {
    // Plain URL is valid as a YAML scalar (no quoting needed) as long as
    // parseYamlFrontmatter round-trips it back to the same string.
    const out = yamlStr('https://doi.org/10.1000/foo')
    // Should parse back to the original value via the same yaml library.
    const { parse: yamlParse } = require('yaml')
    expect(yamlParse(`${out}`)).toBe('https://doi.org/10.1000/foo')
  })

  it('quotes values with leading/trailing whitespace', () => {
    expect(yamlStr(' padded ').startsWith('"') || yamlStr(' padded ').startsWith("'")).toBe(true)
  })

  it('handles empty string', () => {
    // We special-case empty to emit '' so `field: ${yamlStr(value)}` produces
    // a clean `field: ` instead of `field: ""`.
    expect(yamlStr('')).toBe('')
  })
})
