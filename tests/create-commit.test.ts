import { describe, it, beforeEach, expect, vi } from 'vitest'
import createCommit from '../src/lib/create-commit.js'
import type { Octokit } from '../src/buildAndTagAction.js'
import { generateConfig, createMockOctokit } from './helpers.js'
import type { ActionConfig } from '../src/index.js'

vi.mock('@actions/github', async () => {
  const actual = await vi.importActual('@actions/github')
  return {
    ...actual,
    context: {
      repo: { owner: 'JasonEtco', repo: 'test' },
      sha: '123abc'
    },
    getOctokit: vi.fn(() => createMockOctokit())
  }
})

describe('create-commit', () => {
  let octokit: Octokit
  let config: ActionConfig
  let treeParams: any
  let commitParams: any

  beforeEach(() => {
    vi.clearAllMocks()

    octokit = createMockOctokit() as unknown as Octokit
    config = generateConfig({ COMMIT_MESSAGE: 'Commit message' })

    // capture params for assertions
    ;(octokit.rest.git.createTree as any).mockImplementationOnce(async (params: any) => {
      treeParams = params
      return { data: { sha: 'tree123' } }
    })
    ;(octokit.rest.git.createCommit as any).mockImplementationOnce(async (params: any) => {
      commitParams = params
      return { data: { sha: 'commit123' } }
    })

    process.env.GITHUB_WORKSPACE = 'tests/fixtures/workspace'
  })

  it('creates the tree and commit', async () => {
    await createCommit(octokit, config)

    expect(octokit.rest.git.createTree).toHaveBeenCalled()
    expect(octokit.rest.git.createCommit).toHaveBeenCalled()

    // Test that our tree was created correctly (action.yml, package.json, main)
    expect(treeParams.tree).toHaveLength(3)
    expect(treeParams.tree.some((obj: any) => obj.path === 'index.js')).toBe(true)
    expect(treeParams.tree.some((obj: any) => obj.path === 'dist/package.json')).toBe(true)
    expect(treeParams.tree.some((obj: any) => obj.path === 'action.yml')).toBe(true)

    // Test that our commit was created correctly
    expect(commitParams.message).toBe('Commit message')
    expect(commitParams.parents).toEqual(['123abc'])
  })

  it('throws when action.yml and action.yaml are not defined', async () => {
    process.env.GITHUB_WORKSPACE = 'tests/fixtures'

    await expect(createCommit(octokit, config)).rejects.toThrow(
      'Neither action.yml nor action.yaml found in the repository.'
    )
  })

  it('throws when GITHUB_WORKSPACE is not set', async () => {
    delete process.env.GITHUB_WORKSPACE

    await expect(createCommit(octokit, config)).rejects.toThrow(
      'GITHUB_WORKSPACE environment variable is not set.'
    )
  })
})
