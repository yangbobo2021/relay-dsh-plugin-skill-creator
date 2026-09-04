import assert from 'node:assert/strict'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import { SkillRegistry } from '@deepseek-ai/dsh-skill'
import * as creatorPlugin from '../lib/index.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

test('SC-001/002: real DSH registry discovers, loads, and unloads the bundled Skill', async t => {
  const ctx = new Context()
  t.after(() => ctx.fiber.dispose())
  await ctx.plugin(SkillRegistry)
  ctx.skills.register({
    name: 'unrelated-skill',
    description: 'Lifecycle isolation fixture.',
    source: 'runtime',
    content: 'This Skill must survive plugin disposal.',
  })

  const installed = ctx.plugin(creatorPlugin)
  await installed
  const catalog = await ctx.skills.list({ cwd: root })
  assert.deepEqual(catalog.map(skill => skill.name), ['conversation-to-skill', 'unrelated-skill'])

  const summary = catalog[0]
  assert.equal(summary.provider, 'relay-skill-creator')
  assert.equal(summary.source, 'bundled')
  assert.deepEqual(summary.invocation, { modelInvocable: true, userInvocable: true })
  assert.match(summary.description, /completed.*DSH conversation/iu)

  const skill = await ctx.skills.get('conversation-to-skill', { cwd: root })
  assert.ok(skill)
  assert.equal(skill.resourceBase.kind, 'directory')
  assert.equal(resolve(skill.resourceBase.path), join(root, 'skills', 'conversation-to-skill'))
  assert.match(skill.content, /^# Conversation to Skill/mu)
  assert.doesNotMatch(skill.content, /^---$/mu)
  assert.equal(skill.path, join(root, 'skills', 'conversation-to-skill', 'SKILL.md'))

  const provider = creatorPlugin.createConversationToSkillProvider()
  assert.equal(await provider.get({ ...summary, rank: 600, locator: null, provider: 'stale-provider' }, {}), undefined)

  await installed.dispose()
  assert.deepEqual((await ctx.skills.list({ cwd: root })).map(skill => skill.name), ['unrelated-skill'])
})
