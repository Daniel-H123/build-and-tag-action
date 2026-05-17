import { context, getOctokit } from '@actions/github'
import type { ActionConfig } from '../index.js'
import { info } from '@actions/core'

export default async function createOrUpdateRef(
  config: ActionConfig,
  sha: string,
  tagName: string
) {
  const refName = `tags/v${tagName}`
  const octokit = getOctokit(config.GITHUB_TOKEN)
  info(`Updating major version tag ${refName}`)
  const { data: matchingRefs } = await octokit.rest.git.listMatchingRefs({
    ...context.repo,
    ref: refName
  })

  const matchingRef = matchingRefs.find((refObj: { ref: string }) => {
    return refObj.ref.endsWith(refName)
  })

  if (matchingRef !== undefined) {
    await octokit.rest.git.updateRef({
      ...context.repo,
      force: true,
      ref: refName,
      sha
    })
  } else {
    await octokit.rest.git.createRef({
      ...context.repo,
      ref: `refs/${refName}`,
      sha
    })
  }
}
