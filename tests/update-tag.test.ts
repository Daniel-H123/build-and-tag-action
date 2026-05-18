import { describe, it, beforeEach, expect, vi } from 'vitest'
import updateTag from '../src/lib/update-tag.js'
import { createMockOctokit } from './helpers.js'

vi.mock('@actions/github', async () => {
  const actual = await vi.importActual('@actions/github')
  return {
    ...actual,
    context: {
      repo: { owner: 'JasonEtco', repo: 'test' }
    },
    getOctokit: vi.fn(() => createMockOctokit())
  }
})

describe('update-tag', () => {
  let params: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates the tag', async () => {
    const mockOctokit = createMockOctokit() as any
    mockOctokit.rest.git.updateRef.mockImplementationOnce(async (p: any) => {
      params = p
      return {}
    })

    await updateTag(mockOctokit, '123abc', 'v1.0.0')

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
