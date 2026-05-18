import { describe, it, beforeEach, expect, vi } from 'vitest'
import createOrUpdateRef from '../src/lib/create-or-update-ref.js'
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

describe('create-or-update-ref', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates the major ref if it already exists', async () => {
    const mockOctokit = createMockOctokit() as any
    mockOctokit.rest.git.listMatchingRefs.mockResolvedValueOnce({ data: [{ ref: 'tags/v1' }] })

    await createOrUpdateRef(mockOctokit, '123abc', '1')

    expect(mockOctokit.rest.git.listMatchingRefs).toHaveBeenCalledWith(
      expect.objectContaining({ ref: 'tags/v1' })
    )
    expect(mockOctokit.rest.git.updateRef).toHaveBeenCalledWith(
      expect.objectContaining({ sha: '123abc', ref: 'tags/v1', force: true })
    )
  })

  it('creates a new major ref if it does not already exist', async () => {
    const mockOctokit = createMockOctokit() as any
    mockOctokit.rest.git.listMatchingRefs.mockResolvedValueOnce({ data: [] })

    await createOrUpdateRef(mockOctokit, '123abc', '1')

    expect(mockOctokit.rest.git.listMatchingRefs).toHaveBeenCalledWith(
      expect.objectContaining({ ref: 'tags/v1' })
    )
    expect(mockOctokit.rest.git.createRef).toHaveBeenCalledWith(
      expect.objectContaining({ sha: '123abc', ref: 'refs/tags/v1' })
    )
  })

  it('creates a new minor ref if it does not already exist', async () => {
    const mockOctokit = createMockOctokit() as any
    mockOctokit.rest.git.listMatchingRefs.mockResolvedValueOnce({ data: [] })

    await createOrUpdateRef(mockOctokit, '123abc', '1.0')

    expect(mockOctokit.rest.git.listMatchingRefs).toHaveBeenCalledWith(
      expect.objectContaining({ ref: 'tags/v1.0' })
    )
    expect(mockOctokit.rest.git.createRef).toHaveBeenCalledWith(
      expect.objectContaining({ sha: '123abc', ref: 'refs/tags/v1.0' })
    )
  })
})
