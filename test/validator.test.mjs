import assert from 'node:assert/strict'
import { mkdir, mkdtemp, symlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import test from 'node:test'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateSkill } from '../skills/conversation-to-skill/scripts/validate-skill.mjs'

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

async function fixture(t, name = 'example-skill') {
  const temporary = await mkdtemp(join(tmpdir(), 'dsh-skill-creator-'))
  const root = join(temporary, name)
  await mkdir(root, { recursive: true })
  t.after(async () => {
    const { rm } = await import('node:fs/promises')
    await rm(temporary, { recursive: true, force: true })
  })
  return root
}

test('SC-007: accepts a complete portable Skill bundle', async t => {
  const root = await fixture(t)
  await mkdir(join(root, 'references'))
  await mkdir(join(root, 'scripts'))
  await mkdir(join(root, 'assets'))
  await writeFile(join(root, 'SKILL.md'), `---\nname: example-skill\ndescription: Use when a user needs the example workflow.\nuser-invocable: true\n---\n# Example\nRead [the guide](references/guide.md), run [the validator](scripts/check.mjs), and use [the template](assets/template.txt).\n`)
  await writeFile(join(root, 'references', 'guide.md'), '# Guide\nFollow the verified process.\n')
  await writeFile(join(root, 'scripts', 'check.mjs'), "process.stdout.write('ok\\n')\n")
  await writeFile(join(root, 'assets', 'template.txt'), 'Example output template.\n')

  const result = await validateSkill(root)
  assert.equal(result.valid, true)
  assert.deepEqual(result.errors, [])
  assert.deepEqual(result.warnings, [])
})

test('SC-002/007: the bundled creator Skill validates itself without warnings', async () => {
  const result = await validateSkill(join(repositoryRoot, 'skills', 'conversation-to-skill'))
  assert.equal(result.valid, true)
  assert.deepEqual(result.errors, [])
  assert.deepEqual(result.warnings, [])
})

test('SC-007: rejects malformed metadata, mismatched name, and empty body', async t => {
  const root = await fixture(t, 'expected-name')
  await writeFile(join(root, 'SKILL.md'), '---\nname: Wrong_Name\ndescription: 42\nuser-invocable: yes\n---\n')
  const result = await validateSkill(root)
  assert.equal(result.valid, false)
  assert.ok(result.errors.some(error => error.code === 'invalid-name'))
  assert.ok(result.errors.some(error => error.code === 'invalid-description'))
  assert.ok(result.errors.some(error => error.code === 'invalid-metadata'))
  assert.ok(result.errors.some(error => error.code === 'empty-body'))
})

test('SC-007: rejects missing, escaping, and absolute local links', async t => {
  const root = await fixture(t)
  await writeFile(join(root, 'SKILL.md'), `---\nname: example-skill\ndescription: Link fixture.\n---\n[missing](references/no.md) [escape](../outside.md) [absolute](/tmp/private.md)\n`)
  const result = await validateSkill(root)
  assert.equal(result.valid, false)
  assert.ok(result.errors.some(error => error.code === 'broken-link'))
  assert.ok(result.errors.some(error => error.code === 'link-escape'))
  assert.ok(result.errors.some(error => error.code === 'absolute-link'))
})

test('SC-007/009: rejects secrets, private machine paths, sensitive names, and symlinks', async t => {
  const root = await fixture(t)
  await mkdir(join(root, 'references'))
  await writeFile(join(root, 'SKILL.md'), '---\nname: example-skill\ndescription: Security fixture.\n---\n# Example\n')
  const fakeToken = `ghp_${'a'.repeat(36)}`
  await writeFile(join(root, 'references', 'credentials.txt'), `token lives at /Users/alice/private and starts ${fakeToken}\n`)
  await symlink(join(root, 'SKILL.md'), join(root, 'references', 'linked.md'))
  const result = await validateSkill(root)
  assert.equal(result.valid, false)
  assert.ok(result.errors.some(error => error.code === 'forbidden-path'))
  assert.ok(result.errors.some(error => error.code === 'machine-path'))
  assert.ok(result.errors.some(error => error.code === 'github-token'))
  assert.ok(result.errors.some(error => error.code === 'symlink'))
})

test('SC-007: warns about unfinished placeholders and empty optional directories', async t => {
  const root = await fixture(t)
  await mkdir(join(root, 'assets'))
  await writeFile(join(root, 'SKILL.md'), '---\nname: example-skill\ndescription: Warning fixture.\n---\n# TODO complete this\n')
  const result = await validateSkill(root)
  assert.equal(result.valid, true)
  assert.ok(result.warnings.some(warning => warning.code === 'unfinished-placeholder'))
  assert.ok(result.warnings.some(warning => warning.code === 'empty-resource-directory'))
})
