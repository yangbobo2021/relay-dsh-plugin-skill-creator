import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateSkill } from '../skills/conversation-to-skill/scripts/validate-skill.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))

assert.equal(manifest.name, 'relay-dsh-plugin-skill-creator')
assert.match(manifest.version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u)
assert.equal(manifest.private, undefined)
assert.equal(manifest.publishConfig.access, 'public')
assert.equal(manifest.main, './lib/index.js')
assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
for (const hook of ['preinstall', 'install', 'postinstall']) assert.equal(manifest.scripts[hook], undefined)

const packOutput = execFileSync('npm', ['pack', '--ignore-scripts', '--dry-run', '--json'], {
  cwd: root,
  encoding: 'utf8',
  env: {
    ...process.env,
    FORCE_COLOR: '0',
    NO_COLOR: '1',
    npm_config_ignore_scripts: 'true',
    npm_config_loglevel: 'silent',
  },
})
const jsonPayload = /(?:^|\n)(\[\s*\{[\s\S]*\}\s*\])\s*$/u.exec(packOutput)?.[1]
assert.ok(jsonPayload, `npm pack did not return a JSON payload:\n${packOutput}`)
const packed = JSON.parse(jsonPayload)[0]
const paths = new Set(packed.files.map(file => file.path))
const required = [
  'lib/index.js',
  'lib/index.d.ts',
  'cordis.patch.yml',
  'SPEC.md',
  'docs/architecture.md',
  'docs/security.md',
  'docs/acceptance.md',
  'docs/dsh-compatibility.md',
  'docs/releasing.md',
  'skills/conversation-to-skill/SKILL.md',
  'skills/conversation-to-skill/references/extraction-guide.md',
  'skills/conversation-to-skill/references/resource-routing.md',
  'skills/conversation-to-skill/references/dsh-skill-format.md',
  'skills/conversation-to-skill/references/security-and-privacy.md',
  'skills/conversation-to-skill/scripts/validate-skill.mjs',
  'skills/conversation-to-skill/assets/skill-skeleton/SKILL.md.tmpl',
]
for (const path of required) assert.ok(paths.has(path), `packed artifact is missing ${path}`)

const forbidden = [...paths].filter(path =>
  path.startsWith('.codex-plugin/') ||
  path.startsWith('test/') ||
  path.startsWith('src/') ||
  /(?:^|\/)(?:node_modules|\.env|\.git)(?:\/|$)/u.test(path),
)
assert.deepEqual(forbidden, [])
const bundledSkill = await validateSkill(join(root, 'skills', 'conversation-to-skill'))
assert.equal(bundledSkill.valid, true)
assert.deepEqual(bundledSkill.warnings, [])
process.stdout.write(`Accepted ${manifest.name}@${manifest.version}: ${paths.size} packaged files.\n`)
