import { readFile } from 'node:fs/promises'
import type { SkillInvocationPolicy } from '@deepseek-ai/dsh-skill'
import YAML from 'yaml'

export interface ParsedSkillDocument {
  name: string
  description: string
  whenToUse?: string
  invocation: SkillInvocationPolicy
  metadata?: Readonly<Record<string, unknown>>
  body: string
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u

export async function readSkillDocument(url: URL): Promise<ParsedSkillDocument> {
  const source = await readFile(url, 'utf8')
  const match = FRONTMATTER.exec(source)
  if (!match) throw new Error('Bundled SKILL.md must begin with YAML frontmatter')

  const parsed: unknown = YAML.parse(match[1])
  if (!isRecord(parsed)) throw new Error('Bundled SKILL.md frontmatter must be a mapping')
  const name = requiredString(parsed, 'name')
  const description = requiredString(parsed, 'description')
  const whenToUse = optionalString(parsed, 'when-to-use')
  const modelInvocable = optionalBoolean(parsed, 'disable-model-invocation') !== true
  const userInvocable = optionalBoolean(parsed, 'user-invocable') !== false
  const metadata = isRecord(parsed.metadata) ? parsed.metadata : undefined
  const body = source.slice(match[0].length).trim()
  if (!body) throw new Error('Bundled SKILL.md body must not be empty')

  return {
    name,
    description,
    ...(whenToUse ? { whenToUse } : {}),
    invocation: { modelInvocable, userInvocable },
    ...(metadata ? { metadata } : {}),
    body,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key]
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`Bundled SKILL.md requires non-empty ${key}`)
  return value.trim()
}

function optionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key]
  if (value === undefined) return undefined
  if (typeof value !== 'string') throw new Error(`Bundled SKILL.md ${key} must be a string`)
  return value.trim() || undefined
}

function optionalBoolean(record: Record<string, unknown>, key: string): boolean | undefined {
  const value = record[key]
  if (value === undefined) return undefined
  if (typeof value !== 'boolean') throw new Error(`Bundled SKILL.md ${key} must be a boolean`)
  return value
}
