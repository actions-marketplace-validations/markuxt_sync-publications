/**
 * .env loading for local execution.
 *
 * GitHub Actions sets INPUT_* env vars from action.yml inputs; locally we
 * read them from a .env file instead so the same code can run both ways.
 *
 * Load order (last one wins, matching dotenv's "multi" pattern):
 *   1. .env
 *   2. .env.<NODE_ENV>           (e.g. .env.development)
 *   3. process.env               (caller overrides)
 *
 * We don't override existing process.env values by default — that way
 * `ROR_ID=foo pnpm dev` on the CLI beats .env.
 */

import { configDotenv } from 'dotenv'
import { existsSync } from 'fs'
import { join } from 'path'

/**
 * Load .env files from the given directory (defaults to cwd).
 * Skips files that don't exist. Does not override existing process.env.
 */
export function loadEnvFiles(dir: string = process.cwd(), env: string = process.env.NODE_ENV ?? ''): void {
  const candidates = ['.env']
  if (env) candidates.push(`.env.${env}`)

  for (const name of candidates) {
    const path = join(dir, name)
    if (!existsSync(path)) continue
    configDotenv({ path, override: false })
  }
}
