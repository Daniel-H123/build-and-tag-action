import { context } from '@actions/github'
import { info } from '@actions/core'
import type { Octokit } from '../buildAndTagAction.js'

export default async function updateTag(
  octokit: Octokit,
  sha: string,
  tagName: string
) {
  const ref = `tags/${tagName}`

  info(`Updating ${ref}`)
  return octokit.rest.git.updateRef({
    ...context.repo,
    ref,
    force: true,
    sha
  })
}
