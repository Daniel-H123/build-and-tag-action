import readFile from './read-file.js'
import { context } from '@actions/github'
import type { Octokit } from '../buildAndTagAction.js'
import { info, setFailed } from '@actions/core'

export default async function createCommit(octokit: Octokit) {
  let main = ''

  const workspace = process.env.GITHUB_WORKSPACE

  if (!workspace) {
    throw new Error('GITHUB_WORKSPACE environment variable is not set.')
  }

  try {
    main = JSON.parse(await readFile(workspace, 'package.json')).main as string
  } catch (err) {
    setFailed(`Failed to read package.json: ${err}`)
  }

  if (!main) {
    throw new Error('Property "main" does not exist in your `package.json`.')
  }

  info('Creating tree')

  const tree = await octokit.rest.git.createTree({
    ...context.repo,
    tree: [
      {
        path: 'action.yml',
        mode: '100644',
        type: 'blob',
        content: await readFile(workspace, 'action.yml')
      },
      {
        path: main,
        mode: '100644',
        type: 'blob',
        content: await readFile(workspace, main)
      }
    ]
  })

  info('Tree created')

  info('Creating commit')
  const commit = await octokit.rest.git.createCommit({
    ...context.repo,
    message: 'Automatic compilation',
    tree: tree.data.sha,
    parents: [context.sha]
  })
  info('Commit created')

  return commit.data
}
