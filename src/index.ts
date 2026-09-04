import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import { BUNDLED_SKILL_RANK, type SkillCandidate, type SkillProvider } from '@deepseek-ai/dsh-skill'
import { readSkillDocument } from './skill-document.js'

const PROVIDER_NAME = 'relay-skill-creator'
const SKILL_URL = new URL('../skills/conversation-to-skill/SKILL.md', import.meta.url)
const RESOURCE_DIRECTORY_URL = new URL('../skills/conversation-to-skill/', import.meta.url)
const RESOURCE_BASE = Object.freeze({
  kind: 'directory' as const,
  path: fileURLToPath(RESOURCE_DIRECTORY_URL),
})
const DOCUMENT = await readSkillDocument(SKILL_URL)

export const name = 'relay-dsh-plugin-skill-creator'
export const inject = ['skills']

export function createConversationToSkillProvider(): SkillProvider {
  const candidate: SkillCandidate = Object.freeze({
    name: DOCUMENT.name,
    description: DOCUMENT.description,
    ...(DOCUMENT.whenToUse ? { whenToUse: DOCUMENT.whenToUse } : {}),
    invocation: DOCUMENT.invocation,
    provider: PROVIDER_NAME,
    source: 'bundled',
    resourceBase: RESOURCE_BASE,
    rank: BUNDLED_SKILL_RANK,
    locator: SKILL_URL,
    ...(DOCUMENT.metadata ? { metadata: DOCUMENT.metadata } : {}),
    path: fileURLToPath(SKILL_URL),
  })

  return {
    name: PROVIDER_NAME,
    list: async () => [candidate],
    async get(requested) {
      if (requested.name !== candidate.name || requested.provider !== PROVIDER_NAME) return undefined
      return {
        name: candidate.name,
        description: candidate.description,
        ...(candidate.whenToUse ? { whenToUse: candidate.whenToUse } : {}),
        invocation: candidate.invocation,
        provider: candidate.provider,
        source: candidate.source,
        resourceBase: candidate.resourceBase,
        content: DOCUMENT.body,
        ...(candidate.metadata ? { metadata: candidate.metadata } : {}),
        path: candidate.path,
      }
    },
  }
}

export function apply(ctx: Context): void {
  ctx.skills.registerProvider(() => createConversationToSkillProvider())
}
