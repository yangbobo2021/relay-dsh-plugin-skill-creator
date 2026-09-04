#!/usr/bin/env node
import { lstat, readFile, readdir, realpath } from 'node:fs/promises'
import { basename, dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import YAML from 'yaml'

const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u
const TEXT_EXTENSIONS = new Set(['', '.md', '.mdx', '.txt', '.json', '.jsonc', '.yaml', '.yml', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.py', '.sh', '.bash', '.zsh', '.toml', '.ini', '.cfg', '.csv', '.tsv', '.xml', '.html', '.css'])
const FORBIDDEN_NAMES = new Set(['.env', '.git', '.svn', 'node_modules', '__pycache__', '.DS_Store'])
const SENSITIVE_NAME = /(?:^|[._-])(?:id_rsa|id_ed25519|credentials?|secrets?|tokens?)(?:[._-]|$)/iu
const SECRET_PATTERNS = [
  { code: 'private-key', pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/u },
  { code: 'github-token', pattern: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/u },
  { code: 'openai-key', pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/u },
  { code: 'aws-access-key', pattern: /\bAKIA[0-9A-Z]{16}\b/u },
  { code: 'bearer-token', pattern: /\bBearer\s+[A-Za-z0-9._~+/-]{20,}={0,2}\b/iu },
]
const HOME_PATH = /(?:^|[\s`"'(])(?:\/Users\/[^/\s]+|\/home\/[^/\s]+|[A-Za-z]:\\Users\\[^\\\s]+)/u
const PLACEHOLDER = /^\s*(?:(?:[-*]|#{1,6})\s*)?(?:TODO|TBD|FIXME)\b|\{\{[^}\n]+\}\}/mu

export async function validateSkill(skillDirectory) {
  const root = resolve(skillDirectory)
  const errors = []
  const warnings = []
  const files = []

  let rootStat
  try {
    rootStat = await lstat(root)
  } catch (error) {
    errors.push(issue('missing-root', '.', `Skill directory does not exist: ${root}`))
    return report(root, files, errors, warnings)
  }
  if (rootStat.isSymbolicLink()) {
    errors.push(issue('symlink-root', '.', 'Skill directory must not be a symbolic link'))
    return report(root, files, errors, warnings)
  }
  if (!rootStat.isDirectory()) {
    errors.push(issue('root-not-directory', '.', 'Skill path must be a directory'))
    return report(root, files, errors, warnings)
  }

  await walk(root, root, files, errors)
  const fileSet = new Set(files)
  const skillPath = resolve(root, 'SKILL.md')
  if (!files.includes('SKILL.md')) {
    errors.push(issue('missing-skill-md', 'SKILL.md', 'Required SKILL.md is missing'))
    return report(root, files, errors, warnings)
  }

  const skillSource = await readFile(skillPath, 'utf8')
  const match = FRONTMATTER.exec(skillSource)
  let metadata
  if (!match) {
    errors.push(issue('missing-frontmatter', 'SKILL.md', 'SKILL.md must begin with YAML frontmatter'))
  } else {
    try {
      metadata = YAML.parse(match[1])
      validateMetadata(metadata, basename(root), errors)
      if (skillSource.slice(match[0].length).trim() === '') {
        errors.push(issue('empty-body', 'SKILL.md', 'SKILL.md instruction body must not be empty'))
      }
    } catch (error) {
      errors.push(issue('invalid-frontmatter', 'SKILL.md', `YAML frontmatter is invalid: ${messageOf(error)}`))
    }
  }

  for (const file of files) {
    const absolute = resolve(root, file)
    const name = basename(file)
    if (FORBIDDEN_NAMES.has(name) || SENSITIVE_NAME.test(name)) {
      errors.push(issue('forbidden-path', file, 'Sensitive or generated path must not be packaged in a Skill'))
    }
    if (!TEXT_EXTENSIONS.has(extname(file).toLowerCase())) continue
    const source = await readFile(absolute, 'utf8')
    if (source.trim() === '') errors.push(issue('empty-file', file, 'Resource file must not be empty'))
    for (const detector of SECRET_PATTERNS) {
      if (detector.pattern.test(source)) errors.push(issue(detector.code, file, 'Possible credential or private key detected'))
    }
    if (HOME_PATH.test(source)) errors.push(issue('machine-path', file, 'Machine-specific home path detected; use a portable placeholder'))
    if (PLACEHOLDER.test(source)) warnings.push(issue('unfinished-placeholder', file, 'Unresolved TODO or template placeholder detected'))
    if (extname(file).toLowerCase() === '.md') validateLinks(root, file, source, fileSet, errors)
  }

  for (const directory of ['references', 'scripts', 'assets']) {
    if (files.some(file => file.startsWith(`${directory}/`))) continue
    try {
      const stat = await lstat(resolve(root, directory))
      if (stat.isDirectory()) warnings.push(issue('empty-resource-directory', directory, 'Remove an empty resource directory'))
    } catch {
      // Optional resource directory is absent.
    }
  }

  return report(root, files, errors, warnings)
}

async function walk(root, directory, files, errors) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = resolve(directory, entry.name)
    const local = relative(root, absolute)
    if (entry.isSymbolicLink()) {
      errors.push(issue('symlink', local, 'Symbolic links are not allowed in a portable Skill bundle'))
      continue
    }
    if (entry.isDirectory()) {
      if (FORBIDDEN_NAMES.has(entry.name)) {
        errors.push(issue('forbidden-path', local, 'Generated or repository directory must not be packaged'))
        continue
      }
      await walk(root, absolute, files, errors)
    } else if (entry.isFile()) {
      files.push(local.split(sep).join('/'))
    }
  }
}

function validateMetadata(metadata, directoryName, errors) {
  if (!isRecord(metadata)) {
    errors.push(issue('frontmatter-type', 'SKILL.md', 'Frontmatter must be a YAML mapping'))
    return
  }
  if (typeof metadata.name !== 'string' || !SKILL_NAME.test(metadata.name)) {
    errors.push(issue('invalid-name', 'SKILL.md', 'name must be lowercase kebab-case'))
  } else if (metadata.name !== directoryName) {
    errors.push(issue('name-directory-mismatch', 'SKILL.md', `name '${metadata.name}' must match directory '${directoryName}'`))
  }
  if (typeof metadata.description !== 'string' || metadata.description.trim() === '') {
    errors.push(issue('invalid-description', 'SKILL.md', 'description must be a non-empty string'))
  }
  for (const key of ['when-to-use']) {
    if (metadata[key] !== undefined && typeof metadata[key] !== 'string') errors.push(issue('invalid-metadata', 'SKILL.md', `${key} must be a string`))
  }
  for (const key of ['user-invocable', 'disable-model-invocation']) {
    if (metadata[key] !== undefined && typeof metadata[key] !== 'boolean') errors.push(issue('invalid-metadata', 'SKILL.md', `${key} must be a boolean`))
  }
  if (metadata.metadata !== undefined && !isRecord(metadata.metadata)) errors.push(issue('invalid-metadata', 'SKILL.md', 'metadata must be a mapping'))
}

function validateLinks(root, sourceFile, source, fileSet, errors) {
  const links = source.matchAll(/\[[^\]]*\]\(([^)]+)\)/gu)
  for (const match of links) {
    let target = match[1].trim().replace(/^<|>$/gu, '')
    if (!target || target.startsWith('#') || /^[a-z][a-z0-9+.-]*:/iu.test(target)) continue
    target = target.split('#', 1)[0].split('?', 1)[0]
    try {
      target = decodeURIComponent(target)
    } catch {
      errors.push(issue('invalid-link', sourceFile, `Link is not valid URI encoding: ${match[1]}`))
      continue
    }
    if (isAbsolute(target)) {
      errors.push(issue('absolute-link', sourceFile, `Local link must be relative: ${target}`))
      continue
    }
    const destination = resolve(root, dirname(sourceFile), target)
    const escaped = relative(root, destination)
    if (escaped === '..' || escaped.startsWith(`..${sep}`) || isAbsolute(escaped)) {
      errors.push(issue('link-escape', sourceFile, `Link escapes the Skill directory: ${target}`))
      continue
    }
    if (!existsInFiles(root, destination, fileSet)) errors.push(issue('broken-link', sourceFile, `Linked resource does not exist: ${target}`))
  }
}

function existsInFiles(root, destination, fileSet) {
  try {
    const local = relative(root, destination)
    return fileSet.has(local.split(sep).join('/'))
  } catch {
    return false
  }
}

function report(root, files, errors, warnings) {
  return { valid: errors.length === 0, root, files: [...files].sort(), errors, warnings }
}

function issue(code, path, message) {
  return { code, path, message }
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}

async function main(argv) {
  const json = argv.includes('--json')
  const args = argv.filter(argument => argument !== '--json')
  if (args.length !== 1) {
    process.stderr.write('Usage: validate-skill.mjs [--json] <skill-directory>\n')
    process.exitCode = 2
    return
  }
  const result = await validateSkill(args[0])
  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  } else {
    for (const error of result.errors) process.stderr.write(`ERROR ${error.code} ${error.path}: ${error.message}\n`)
    for (const warning of result.warnings) process.stderr.write(`WARN  ${warning.code} ${warning.path}: ${warning.message}\n`)
    process.stdout.write(`${result.valid ? 'VALID' : 'INVALID'} ${result.root} (${result.files.length} files, ${result.errors.length} errors, ${result.warnings.length} warnings)\n`)
  }
  if (!result.valid) process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(await realpath(process.argv[1])).href) {
  await main(process.argv.slice(2))
}
