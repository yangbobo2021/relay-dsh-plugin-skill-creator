#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { lstat, readFile, readdir, realpath } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const MAX_CAPTURE_BYTES = 16 * 1024 * 1024
const COMMAND_TIMEOUT_MS = 60_000
const SKIP_DIRECTORIES = new Set(['.git', 'node_modules'])

export async function checkPrivacyCanaries({ canaries, scans = [], command, args = [], cwd }) {
  if (!Array.isArray(canaries) || canaries.length === 0) {
    throw new Error('at least one --canary value is required')
  }
  if (canaries.some(value => typeof value !== 'string' || value.length < 8)) {
    throw new Error('each canary must be a string of at least 8 characters')
  }
  if (new Set(canaries).size !== canaries.length) throw new Error('canary values must be unique')
  if (typeof command !== 'string' || command.length === 0) throw new Error('a command is required after --')

  const child = await runCaptured(command, args, cwd)
  const leaks = []
  inspectText('stdout', child.stdout, canaries, leaks)
  inspectText('stderr', child.stderr, canaries, leaks)
  for (let index = 0; index < scans.length; index += 1) {
    await inspectPath(resolve(scans[index]), canaries, leaks, `scan-target-${index + 1}`)
  }
  return { passed: !child.timedOut && child.code === 0 && leaks.length === 0, commandExitCode: child.code, timedOut: child.timedOut, leaks }
}

async function runCaptured(command, args, cwd) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    const stdout = []
    const stderr = []
    let stdoutBytes = 0
    let stderrBytes = 0
    let overflow = false
    let timedOut = false
    const capture = (target, counter) => chunk => {
      const bytes = Buffer.from(chunk)
      const next = counter() + bytes.length
      if (next > MAX_CAPTURE_BYTES) {
        overflow = true
        child.kill('SIGKILL')
        return
      }
      target.push(bytes)
      counter(next)
    }
    child.stdout.on('data', capture(stdout, value => value === undefined ? stdoutBytes : (stdoutBytes = value)))
    child.stderr.on('data', capture(stderr, value => value === undefined ? stderrBytes : (stderrBytes = value)))
    child.once('error', reject)
    const timer = setTimeout(() => {
      timedOut = true
      child.kill('SIGKILL')
    }, COMMAND_TIMEOUT_MS)
    timer.unref()
    child.once('close', code => {
      clearTimeout(timer)
      if (overflow) {
        reject(new Error(`child output exceeded ${MAX_CAPTURE_BYTES} bytes`))
        return
      }
      resolvePromise({
        code: typeof code === 'number' ? code : 1,
        timedOut,
        stdout: Buffer.concat(stdout).toString('utf8'),
        stderr: Buffer.concat(stderr).toString('utf8'),
      })
    })
  })
}

async function inspectPath(path, canaries, leaks, label) {
  const stat = await lstat(path)
  if (stat.isSymbolicLink()) throw new Error(`scan path must not be a symbolic link: ${path}`)
  if (stat.isDirectory()) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) continue
      await inspectPath(resolve(path, entry.name), canaries, leaks, label)
    }
    return
  }
  if (!stat.isFile()) return
  const bytes = await readFile(path)
  if (bytes.includes(0)) return
  inspectText(label, bytes.toString('utf8'), canaries, leaks)
}

function inspectText(location, text, canaries, leaks) {
  for (let index = 0; index < canaries.length; index += 1) {
    if (text.includes(canaries[index])) leaks.push({ canary: index + 1, location })
  }
}

function parseArguments(argv) {
  const canaries = []
  const scans = []
  let cwd
  let index = 0
  for (; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--') {
      index += 1
      break
    }
    if (value === '--canary' || value === '--scan' || value === '--cwd') {
      const argument = argv[index + 1]
      if (argument === undefined) throw new Error(`${value} requires a value`)
      if (value === '--canary') canaries.push(argument)
      if (value === '--scan') scans.push(argument)
      if (value === '--cwd') cwd = argument
      index += 1
      continue
    }
    throw new Error(`unknown argument before --: ${value}`)
  }
  const [command, ...args] = argv.slice(index)
  return { canaries, scans, command, args, cwd }
}

async function main(argv) {
  let parsed
  try {
    parsed = parseArguments(argv)
    const result = await checkPrivacyCanaries(parsed)
    if (result.timedOut) {
      process.stderr.write(`CANARY CHECK ERROR: child command exceeded ${COMMAND_TIMEOUT_MS}ms; output suppressed\n`)
      process.exitCode = 2
      return
    }
    if (result.commandExitCode !== 0) {
      process.stderr.write(`CANARY CHECK ERROR: child command exited ${result.commandExitCode}; output suppressed\n`)
      process.exitCode = 2
      return
    }
    if (result.leaks.length > 0) {
      for (const leak of result.leaks) {
        process.stderr.write(`CANARY LEAK: canary-${leak.canary} found in ${leak.location}\n`)
      }
      process.exitCode = 1
      return
    }
    process.stdout.write(`CANARY SAFE: ${result.leaks.length} leaks across stdout, stderr, and ${parsed.scans.length} scan target(s)\n`)
  } catch (error) {
    const message = redactCanaries(error instanceof Error ? error.message : String(error), parsed?.canaries ?? [])
    process.stderr.write(`CANARY CHECK ERROR: ${message}\n`)
    process.exitCode = 2
  }
}

function redactCanaries(value, canaries) {
  return canaries.reduce((text, canary) => text.split(canary).join('<redacted-canary>'), value)
}

if (process.argv[1] && import.meta.url === pathToFileURL(await realpath(process.argv[1])).href) {
  await main(process.argv.slice(2))
}
