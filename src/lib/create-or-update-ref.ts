import { context } from '@actions/github'
import { info } from '@actions/core'
import type { Octokit } from '../buildAndTagAction.js'

export default async function createOrUpdateRef(
  octokit: Octokit,
  sha: string,
  tagName: string
) {
  const refName = `tags/v${tagName}`
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
