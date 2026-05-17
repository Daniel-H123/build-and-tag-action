import { describe, it, beforeEach, expect, vi } from 'vitest'
import createOrUpdateRef from '../src/lib/create-or-update-ref.js'
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
          updateRef: vi.fn(async () => ({})),
          createRef: vi.fn(async () => ({})),
          listMatchingRefs: vi.fn(async () => ({ data: [] }))
        }
      }
    }))
  }
})

describe('create-or-update-ref', () => {
  let config: ActionConfig

  beforeEach(() => {
    config = generateConfig()
    vi.clearAllMocks()
  })

  it('updates the major ref if it already exists', async () => {
    const mockGetOctokit = vi.mocked(github.getOctokit)
    const mockOctokit = {
      rest: {
        git: {
          updateRef: vi.fn(async () => ({})),
          createRef: vi.fn(async () => ({})),
          listMatchingRefs: vi.fn(async () => ({ data: [{ ref: 'tags/v1' }] }))
        }
      }
    }
    mockGetOctokit.mockReturnValue(mockOctokit as any)

    await createOrUpdateRef(config, '123abc', '1')

    expect(mockOctokit.rest.git.listMatchingRefs).toHaveBeenCalledWith(
      expect.objectContaining({ ref: 'tags/v1' })
    )
    expect(mockOctokit.rest.git.updateRef).toHaveBeenCalledWith(
      expect.objectContaining({ sha: '123abc', ref: 'tags/v1', force: true })
    )
  })

  it('creates a new major ref if it does not already exist', async () => {
    const mockGetOctokit = vi.mocked(github.getOctokit)
    const mockOctokit = {
      rest: {
        git: {
          updateRef: vi.fn(async () => ({})),
          createRef: vi.fn(async () => ({})),
          listMatchingRefs: vi.fn(async () => ({ data: [] }))
        }
      }
    }
    mockGetOctokit.mockReturnValue(mockOctokit as any)

    await createOrUpdateRef(config, '123abc', '1')

    expect(mockOctokit.rest.git.listMatchingRefs).toHaveBeenCalledWith(
      expect.objectContaining({ ref: 'tags/v1' })
    )
    expect(mockOctokit.rest.git.createRef).toHaveBeenCalledWith(
      expect.objectContaining({ sha: '123abc', ref: 'refs/tags/v1' })
    )
  })

  it('creates a new minor ref if it does not already exist', async () => {
    const mockGetOctokit = vi.mocked(github.getOctokit)
    const mockOctokit = {
      rest: {
        git: {
          updateRef: vi.fn(async () => ({})),
          createRef: vi.fn(async () => ({})),
          listMatchingRefs: vi.fn(async () => ({ data: [] }))
        }
      }
    }
    mockGetOctokit.mockReturnValue(mockOctokit as any)

    await createOrUpdateRef(config, '123abc', '1.0')

    expect(mockOctokit.rest.git.listMatchingRefs).toHaveBeenCalledWith(
      expect.objectContaining({ ref: 'tags/v1.0' })
    )
    expect(mockOctokit.rest.git.createRef).toHaveBeenCalledWith(
      expect.objectContaining({ sha: '123abc', ref: 'refs/tags/v1.0' })
    )
  })
})
