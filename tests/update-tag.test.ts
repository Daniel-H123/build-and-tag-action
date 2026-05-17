import { describe, it, beforeEach, expect, vi } from 'vitest'
import updateTag from '../src/lib/update-tag.js'
import { generateConfig } from './helpers.js'
import type { ActionConfig } from '../src/index.js'
import * as github from '@actions/github'

vi.mock('@actions/github', async () => {
  const actual = await vi.importActual('@actions/github')
  return {
    ...actual,
    context: {
      repo: { owner: 'JasonEtco', repo: 'test' }
    },
    getOctokit: vi.fn((token) => ({
      rest: {
        git: {
          updateRef: vi.fn(async () => ({}))
        }
      }
    }))
  }
})

describe('update-tag', () => {
  let config: ActionConfig
  let params: any

  beforeEach(() => {
    config = generateConfig()
    vi.clearAllMocks()
  })

  it('updates the tag', async () => {
    const mockGetOctokit = vi.mocked(github.getOctokit)
    const mockOctokit = {
      rest: {
        git: {
          updateRef: vi.fn(async (p) => {
            params = p
            return {}
          })
        }
      }
    }
    mockGetOctokit.mockReturnValue(mockOctokit as any)

    await updateTag(config, '123abc', 'v1.0.0')

    expect(mockOctokit.rest.git.updateRef).toHaveBeenCalled()
    expect(params).toEqual(
      expect.objectContaining({
        force: true,
        sha: '123abc',
        ref: 'tags/v1.0.0'
      })
    )
  })
})
