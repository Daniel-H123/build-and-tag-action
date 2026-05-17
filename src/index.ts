import * as core from "@actions/core";
import main from "./main.js";

export type ActionConfig = {
    GITHUB_TOKEN: string;
    TAG_NAME?: string;
};

try {
    const config: ActionConfig = {
        GITHUB_TOKEN: core.getInput("githubToken", { required: true }),
        TAG_NAME: core.getInput("tagName", { required: false }),
    };
    
    main(config);
} catch (error: unknown) {
  if (error instanceof Error) {
    core.setFailed(error.message);
  } else {
    core.setFailed(String(error));
  }
}
