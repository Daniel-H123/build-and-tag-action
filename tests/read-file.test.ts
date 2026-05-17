import { describe, it, expect } from 'vitest'
import path from 'path'
import { fileURLToPath } from 'url'
import readFile from '../src/lib/read-file.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('read-file', () => {
  const baseDir = path.join(__dirname, 'fixtures')

  it('reads the file and returns the contents', async () => {
    const result = await readFile(baseDir, 'file.md')
    expect(result).toBe('Hello!\n')
  })

  it('throws if the file does not exist', async () => {
    await expect(readFile(baseDir, 'nope')).rejects.toThrow(
      'nope does not exist.'
    )
  })
})
