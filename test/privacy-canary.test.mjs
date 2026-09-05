import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { promisify } from 'node:util'
import test from 'node:test'
import { checkPrivacyCanaries } from '../skills/conversation-to-skill/scripts/check-privacy-canary.mjs'

const exec = promisify(execFile)
const cli = new URL('../skills/conversation-to-skill/scripts/check-privacy-canary.mjs', import.meta.url)

test('SC-012: privacy canary wrapper passes a redacting command', async () => {
  const result = await checkPrivacyCanaries({
    canaries: ['privacy-canary@example.invalid', '13900001234'],
    command: process.execPath,
    args: ['-e', 'process.stdout.write("safe aggregate only")'],
  })
  assert.deepEqual(result, { passed: true, commandExitCode: 0, timedOut: false, leaks: [] })
})

test('SC-012: privacy canary wrapper detects stdout without echoing the value', async () => {
  const canary = 'privacy-canary@example.invalid'
  await assert.rejects(
    exec(process.execPath, [cli.pathname, '--canary', canary, '--', process.execPath, '-e', 'process.stdout.write(process.env.CANARY_TEST)'], {
      env: { ...process.env, CANARY_TEST: canary },
    }),
    error => {
      assert.equal(error.code, 1)
      assert.match(error.stderr, /CANARY LEAK: canary-1 found in stdout/u)
      assert.doesNotMatch(`${error.stdout}${error.stderr}`, new RegExp(canary.replace('.', '\\.')))
      return true
    },
  )
})

test('SC-012: privacy canary wrapper scans produced files but not the input fixture', async t => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-skill-canary-'))
  t.after(async () => {
    const { rm } = await import('node:fs/promises')
    await rm(root, { recursive: true, force: true })
  })
  const output = join(root, 'output')
  await mkdir(output)
  const canary = 'ACCOUNT-CANARY-7Q9K2'
  await writeFile(join(output, 'report.txt'), `unsafe ${canary}\n`)

  const result = await checkPrivacyCanaries({
    canaries: [canary],
    scans: [output],
    command: process.execPath,
    args: ['-e', 'process.stdout.write("done")'],
  })
  assert.equal(result.passed, false)
  assert.deepEqual(result.leaks, [{ canary: 1, location: 'scan-target-1' }])
})

test('SC-012: privacy canary wrapper distinguishes child failures from leaks', async () => {
  const result = await checkPrivacyCanaries({
    canaries: ['privacy-canary@example.invalid'],
    command: process.execPath,
    args: ['-e', 'process.exit(7)'],
  })
  assert.equal(result.passed, false)
  assert.equal(result.commandExitCode, 7)
  assert.equal(result.timedOut, false)
  assert.deepEqual(result.leaks, [])
})

test('SC-012: privacy canary wrapper redacts canaries from its own errors', async () => {
  const canary = 'ACCOUNT-CANARY-7Q9K2'
  await assert.rejects(
    exec(process.execPath, [cli.pathname, '--canary', canary, '--scan', `/missing/${canary}`, '--', process.execPath, '-e', ''], {}),
    error => {
      assert.equal(error.code, 2)
      assert.match(error.stderr, /<redacted-canary>/u)
      assert.doesNotMatch(error.stderr, new RegExp(canary))
      return true
    },
  )
})

test('SC-012 regression: a script that warns about PII but echoes the source row still fails', async t => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-skill-pii-regression-'))
  t.after(async () => {
    const { rm } = await import('node:fs/promises')
    await rm(root, { recursive: true, force: true })
  })
  const canary = 'privacy-canary@example.invalid'
  const input = join(root, 'input.txt')
  const script = join(root, 'unsafe.mjs')
  await writeFile(input, `界面卡顿，请联系 ${canary}\n`)
  await writeFile(script, `
    import { readFileSync } from 'node:fs'
    const text = readFileSync(process.argv[2], 'utf8').trim()
    process.stdout.write(JSON.stringify({ piiWarnings: [{ row: 1, type: 'email' }], issues: [{ text }] }))
  `)
  const result = await checkPrivacyCanaries({
    canaries: [canary],
    command: process.execPath,
    args: [script, input],
  })
  assert.equal(result.passed, false)
  assert.deepEqual(result.leaks, [{ canary: 1, location: 'stdout' }])
})
