import * as core from '@actions/core'
import buildAndTagAction from './buildAndTagAction.js'

export type ActionConfig = {
  GITHUB_TOKEN: string
  TAG_NAME?: string
  COMMIT_MESSAGE: string
}

try {
  let commitMessageInput = core.getInput('commit_message', { required: false })
  if (commitMessageInput.trim() === '') {
    commitMessageInput = 'Automatic compilation'
  }

  const config: ActionConfig = {
    GITHUB_TOKEN: core.getInput('github_token', { required: true }),
    TAG_NAME: core.getInput('tag_name', { required: false }),
    COMMIT_MESSAGE: commitMessageInput
  }

  buildAndTagAction(config)
} catch (error: unknown) {
  if (error instanceof Error) {
    core.setFailed(error.message)
  } else {
    core.setFailed(String(error))
  }
}
