import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { releaseMetadata } from '../scripts/release-metadata.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

test('release tags exactly match package versions and select stable/prerelease dist-tags', () => {
  assert.deepEqual(releaseMetadata('v0.1.0', '0.1.0'), { version: '0.1.0', npmTag: 'latest' })
  assert.deepEqual(releaseMetadata('v0.2.0-rc.1', '0.2.0-rc.1'), { version: '0.2.0-rc.1', npmTag: 'next' })
  assert.throws(() => releaseMetadata('v0.1.0', '0.1.1'), /must exactly match/u)
})

test('release workflow uses tag-bound OIDC publishing without a long-lived npm token', async () => {
  const workflow = await readFile(join(root, '.github', 'workflows', 'release.yml'), 'utf8')
  assert.match(workflow, /tags:\s*\n\s*- "v\*"/u)
  assert.match(workflow, /id-token: write/u)
  assert.match(workflow, /git merge-base --is-ancestor "\$GITHUB_SHA" origin\/main/u)
  assert.match(workflow, /npm publish --access public --tag/u)
  assert.match(workflow, /npm@\^11\.15\.0/u)
  assert.doesNotMatch(workflow, /NODE_AUTH_TOKEN|NPM_TOKEN|secrets\./u)
})
