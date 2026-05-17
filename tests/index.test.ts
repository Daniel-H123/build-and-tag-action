import { describe, it, beforeEach, expect, vi } from 'vitest'
import main from '../src/main.js'
import { generateConfig } from './helpers.js'
import type { ActionConfig } from '../src/index.js'
import * as github from '@actions/github'

vi.mock('@actions/github', async () => {
  const actual = await vi.importActual('@actions/github')
  return {
    ...actual,
    context: {
      eventName: 'release',
      repo: { owner: 'JasonEtco', repo: 'test' },
      sha: '123abc',
      payload: {
        release: {
          tag_name: 'v1.0.0',
          draft: false,
          prerelease: false
        }
      }
    },
    getOctokit: vi.fn((token) => ({
      rest: {
        git: {
          createTree: vi.fn(async () => ({ data: { sha: 'tree123' } })),
          createCommit: vi.fn(async () => ({ data: { sha: 'commit123' } })),
          updateRef: vi.fn(async () => ({})),
          createRef: vi.fn(async () => ({})),
          listMatchingRefs: vi.fn(async () => ({ data: [] }))
        }
      }
    }))
  }
})

describe('build-and-tag-action', () => {
  let config: ActionConfig

  beforeEach(() => {
    vi.clearAllMocks()
    config = generateConfig()
    process.env.GITHUB_WORKSPACE = 'tests/fixtures/workspace'
  })

  it('updates the ref and updates an existing major ref', async () => {
    const mockGetOctokit = vi.mocked(github.getOctokit)
    const mockGithubContext = vi.mocked(github.context)
    const mockOctokit = {
      rest: {
        git: {
          createTree: vi.fn(async () => ({ data: { sha: 'tree123' } })),
          createCommit: vi.fn(async () => ({ data: { sha: 'commit123' } })),
          updateRef: vi.fn(async () => ({})),
          createRef: vi.fn(async () => ({})),
          listMatchingRefs: vi.fn(async () => ({
            data: [{ ref: 'tags/v1' }, { ref: 'tags/v1.0' }]
          }))
        }
      }
    }
    mockGetOctokit.mockReturnValue(mockOctokit as any)
    Object.assign(mockGithubContext, {
      eventName: 'release',
      repo: { owner: 'JasonEtco', repo: 'test' },
      sha: '123abc',
      payload: {
        release: {
          tag_name: 'v1.0.0',
          draft: false,
          prerelease: false
        }
      }
    })

    await main(config)

    expect(mockOctokit.rest.git.createTree).toHaveBeenCalled()
    expect(mockOctokit.rest.git.createCommit).toHaveBeenCalled()
    expect(mockOctokit.rest.git.updateRef).toHaveBeenCalled()
  })

  it('updates the ref and creates a new major & minor ref', async () => {
    const mockGetOctokit = vi.mocked(github.getOctokit)
    const mockGithubContext = vi.mocked(github.context)
    const mockOctokit = {
      rest: {
        git: {
          createTree: vi.fn(async () => ({ data: { sha: 'tree123' } })),
          createCommit: vi.fn(async () => ({ data: { sha: 'commit123' } })),
          updateRef: vi.fn(async () => ({})),
          createRef: vi.fn(async () => ({})),
          listMatchingRefs: vi.fn(async () => ({ data: [] }))
        }
      }
    }
    mockGetOctokit.mockReturnValue(mockOctokit as any)
    Object.assign(mockGithubContext, {
      eventName: 'release',
      repo: { owner: 'JasonEtco', repo: 'test' },
      sha: '123abc',
      payload: {
        release: {
          tag_name: 'v1.0.0',
          draft: false,
          prerelease: false
        }
      }
    })

    await main(config)

    expect(mockOctokit.rest.git.createTree).toHaveBeenCalled()
    expect(mockOctokit.rest.git.createCommit).toHaveBeenCalled()
    expect(mockOctokit.rest.git.createRef).toHaveBeenCalledTimes(2)
  })

  it('does not update the major ref if the release is a draft', async () => {
    const mockGetOctokit = vi.mocked(github.getOctokit)
    const mockGithubContext = vi.mocked(github.context)
    const mockOctokit = {
      rest: {
        git: {
          createTree: vi.fn(async () => ({ data: { sha: 'tree123' } })),
          createCommit: vi.fn(async () => ({ data: { sha: 'commit123' } })),
          updateRef: vi.fn(async () => ({})),
          createRef: vi.fn(async () => ({})),
          listMatchingRefs: vi.fn(async () => ({ data: [] }))
        }
      }
    }
    mockGetOctokit.mockReturnValue(mockOctokit as any)
    Object.assign(mockGithubContext, {
      eventName: 'release',
      repo: { owner: 'JasonEtco', repo: 'test' },
      sha: '123abc',
      payload: {
        release: {
          tag_name: 'v1.0.0',
          draft: true,
          prerelease: false
        }
      }
    })

    await main(config)

    expect(mockOctokit.rest.git.createTree).toHaveBeenCalled()
    expect(mockOctokit.rest.git.createCommit).toHaveBeenCalled()
    expect(mockOctokit.rest.git.createRef).not.toHaveBeenCalled()
  })

  it('does not update the major ref if the release is a prerelease', async () => {
    const mockGetOctokit = vi.mocked(github.getOctokit)
    const mockGithubContext = vi.mocked(github.context)
    const mockOctokit = {
      rest: {
        git: {
          createTree: vi.fn(async () => ({ data: { sha: 'tree123' } })),
          createCommit: vi.fn(async () => ({ data: { sha: 'commit123' } })),
          updateRef: vi.fn(async () => ({})),
          createRef: vi.fn(async () => ({})),
          listMatchingRefs: vi.fn(async () => ({ data: [] }))
        }
      }
    }
    mockGetOctokit.mockReturnValue(mockOctokit as any)
    Object.assign(mockGithubContext, {
      eventName: 'release',
      repo: { owner: 'JasonEtco', repo: 'test' },
      sha: '123abc',
      payload: {
        release: {
          tag_name: 'v1.0.0',
          draft: false,
          prerelease: true
        }
      }
    })

    await main(config)

    expect(mockOctokit.rest.git.createTree).toHaveBeenCalled()
    expect(mockOctokit.rest.git.createCommit).toHaveBeenCalled()
    expect(mockOctokit.rest.git.createRef).not.toHaveBeenCalled()
  })

  it('updates the ref and creates a new major ref for an event other than `release`', async () => {
    const mockGetOctokit = vi.mocked(github.getOctokit)
    const mockGithubContext = vi.mocked(github.context)
    const mockOctokit = {
      rest: {
        git: {
          createTree: vi.fn(async () => ({ data: { sha: 'tree123' } })),
          createCommit: vi.fn(async () => ({ data: { sha: 'commit123' } })),
          updateRef: vi.fn(async () => ({})),
          createRef: vi.fn(async () => ({})),
          listMatchingRefs: vi.fn(async () => ({ data: [] }))
        }
      }
    }
    mockGetOctokit.mockReturnValue(mockOctokit as any)
    Object.assign(mockGithubContext, {
      eventName: 'pull_request',
      repo: { owner: 'JasonEtco', repo: 'test' },
      sha: '123abc',
      payload: {
        release: {
          tag_name: 'v2.0.0',
          draft: false,
          prerelease: false
        }
      }
    })

    config.TAG_NAME = 'v2.0.0'

    await main(config)

    expect(mockOctokit.rest.git.createTree).toHaveBeenCalled()
    expect(mockOctokit.rest.git.createCommit).toHaveBeenCalled()
    expect(mockOctokit.rest.git.createRef).toHaveBeenCalledTimes(2)
  })
})
