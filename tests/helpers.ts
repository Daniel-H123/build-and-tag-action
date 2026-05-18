import { vi } from 'vitest'
import type { ActionConfig } from '../src/index.js'
import type { Octokit } from '../src/buildAndTagAction.js'

export function generateConfig(override?: Partial<ActionConfig>): ActionConfig {
  return {
    GITHUB_TOKEN: '456def',
    TAG_NAME: undefined,
    COMMIT_MESSAGE: 'Commit message',
    ...override
  }
}

export function createMockOctokit(): Octokit {
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
  return mockOctokit as unknown as Octokit
}
