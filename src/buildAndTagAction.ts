import getTagName from './lib/get-tag-name.js'
import createCommit from './lib/create-commit.js'
import updateTag from './lib/update-tag.js'
import { context, getOctokit } from '@actions/github'
import type { ActionConfig } from './index.js'
import createOrUpdateRef from './lib/create-or-update-ref.js'
import semver from 'semver'
import { info } from '@actions/core'

export type Octokit = ReturnType<typeof getOctokit>

export default async (config: ActionConfig) => {
  const octokit = getOctokit(config.GITHUB_TOKEN)

  // Get the tag to update
  const tagName = getTagName(config)
  info(`Updating tag [${tagName}]`)

  // Create a new commit, with the new tree
  const commit = await createCommit(octokit)

  // Update the tag to point to the new commit
  await updateTag(octokit, commit.sha, tagName)

  // Also update the major version tag.
  // For example, for version v1.0.0, we'd also update v1.
  let shouldRewriteMajorAndMinorRef = true

  // If this is a release event, only update the major ref for a full release.
  if (context.eventName === 'release') {
    const { draft, prerelease } = context.payload.release
    if (draft || prerelease) {
      shouldRewriteMajorAndMinorRef = false
    }
  }

  if (shouldRewriteMajorAndMinorRef) {
    const majorStr = semver.major(tagName).toString()
    const minorStr = semver.minor(tagName).toString()
    await createOrUpdateRef(octokit, commit.sha, `${majorStr}.${minorStr}`)
    return createOrUpdateRef(octokit, commit.sha, majorStr)
  }
}
