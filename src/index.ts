import * as core from '@actions/core'
import buildAndTagAction from './buildAndTagAction.js'

export type ActionConfig = {
  GITHUB_TOKEN: string
  TAG_NAME?: string
}

try {
  const config: ActionConfig = {
    GITHUB_TOKEN: core.getInput('github_token', { required: true }),
    TAG_NAME: core.getInput('tag_name', { required: false })
  }

  buildAndTagAction(config)
} catch (error: unknown) {
  if (error instanceof Error) {
    core.setFailed(error.message)
  } else {
    core.setFailed(String(error))
  }
}
