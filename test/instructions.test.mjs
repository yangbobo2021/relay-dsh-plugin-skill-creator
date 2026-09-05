import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const skillPath = join(root, 'skills', 'conversation-to-skill', 'SKILL.md')

test('SC-003/004/005/006/008/009/011/012/013/014: instruction contract is ordered and fail-closed', async () => {
  const text = await readFile(skillPath, 'utf8')
  const inspect = text.indexOf('reconstruct:')
  const contract = text.indexOf('acceptance contract with stable requirement IDs')
  const proposal = text.indexOf('Present a concise proposal before writing anything')
  const stop = text.indexOf('Stop and wait for explicit user confirmation')
  const create = text.indexOf('After confirmation, create the agreed directory')
  const validate = text.indexOf("Run this bundle's validator")
  const canary = text.indexOf('synthetic privacy canary gate')
  const discover = text.indexOf("Verify the installed Skill through DSH's Skill catalog")
  const replay = text.indexOf('perform one fresh-session replay')
  assert.ok(inspect >= 0 && contract > inspect && proposal > contract && stop > proposal && create > stop
    && validate > create && canary > validate && discover > canary && replay > discover)

  assert.match(text, /only messages and artifacts actually visible/iu)
  assert.match(text, /Do not claim access to hidden or expired session history/iu)
  assert.match(text, /`SKILL\.md`/u)
  assert.match(text, /`references\/`/u)
  assert.match(text, /`scripts\/`/u)
  assert.match(text, /`assets\/`/u)
  assert.match(text, /Never overwrite an existing Skill silently/iu)
  assert.match(text, /Do not leave orphan resources, placeholder files, empty directories/iu)
  assert.match(text, /Record skipped checks as unverified/iu)
  assert.match(text, /Never claim that a Skill is installed, discovered, or tested unless/iu)
  assert.match(text, /secrets, identities, customer data, machine-specific paths/iu)
  assert.match(text, /default to `<project>\/\.dsh\/skills\/<skill-name>\/`/iu)
  assert.match(text, /reject unexplained abbreviations/iu)
  assert.match(text, /Do not create a task tracker/iu)
  assert.match(text, /at most one fresh DSH replay and no paid cross-Agent runs/iu)
  assert.match(text, /A canary leak is a hard failure/iu)
  assert.match(text, /natural task prompt that does not name the Skill/iu)
  assert.match(text, /actual token\/step metrics/iu)
})
