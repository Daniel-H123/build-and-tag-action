import { describe, it, beforeEach, expect } from 'vitest'
import getTagName from '../src/lib/get-tag-name.js'
import { generateConfig } from './helpers.js'
import type { ActionConfig } from '../src/index.js'
import { context } from '@actions/github'

describe('get-tag-name', () => {
  let config: ActionConfig

  beforeEach(() => {
    config = generateConfig()
    Object.assign(context, { eventName: 'release' })
  })

  it('gets the tag from the release payload', () => {
    const result = getTagName(config)
    expect(result).toBe('v1.0.0')
  })

  it('gets the tag from the config', () => {
    config.TAG_NAME = 'v2.1.1'
    const result = getTagName(config)
    expect(result).toBe('v2.1.1')
  })

  it('throws when no tag_name is found or provided', () => {
    Object.assign(context, { eventName: 'pizza' })

    expect(() => getTagName(config)).toThrow(
      'No tag_name was found or provided!'
    )
  })
})
