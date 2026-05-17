import { context, getOctokit } from "@actions/github";
import type { ActionConfig } from "../index.js"


export default async function updateTag(
  config: ActionConfig,
  sha: string,
  tagName: string
) {
  const octokit = getOctokit(config.GITHUB_TOKEN);

  const ref = `tags/${tagName}`

  octokit.log.info(`Updating ${ref}`)
  return octokit.rest.git.updateRef({
    ...context.repo,
    ref,
    force: true,
    sha
  })
}
