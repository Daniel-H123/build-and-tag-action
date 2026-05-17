import type { ActionConfig } from '../src/index.js'
import type { Octokit } from '../src/buildAndTagAction.js'

export function generateConfig(): ActionConfig {
  return {
    GITHUB_TOKEN: '456def',
    TAG_NAME: undefined
  }
}

export function createMockOctokit(): Octokit {
  const mockOctokit = {
    rest: {
      git: {
        createTree: async () => ({ data: { sha: 'tree123' } }),
        createCommit: async () => ({ data: { sha: 'commit123' } }),
        updateRef: async () => ({}),
        createRef: async () => ({}),
        listMatchingRefs: async () => ({ data: [] })
      }
    }
  }
  return mockOctokit as unknown as Octokit
}
