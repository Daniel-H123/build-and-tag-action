import { context } from "@actions/github"
import type { ActionConfig } from "../index.js"

/**
 * Get the tag name to update. 
 * This can come from either the action input, or from the release event payload.
 * 
 * @param config 
 * @returns The tag name to update
 * @throws If no tag name is found in the config or the event payload
 */
export default function getTagName(config: ActionConfig): string {
  if (config.TAG_NAME) {
    return config.TAG_NAME
  }

  if (context.eventName === 'release') {
    return context.payload.release.tag_name
  }

  throw new Error('No tag_name was found or provided!')
}
