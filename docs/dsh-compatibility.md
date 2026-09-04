# DSH compatibility

## Validated baseline

- Official repository: `https://github.com/deepseek-ai/deepseek-harness`
- Commit: `76fda729799fe9b3848dbe2c211d4b231032b81e`
- `@deepseek-ai/dsh-skill`: `0.1.2-rc.1`
- `@deepseek-ai/cordis`: `4.0.2`
- Node.js: `>=22.13`

The baseline was read from Relay's immutable `upstream/deepseek-harness/` checkout. This repository does not modify or redistribute that checkout.

## Contracts used

- `ctx.skills.registerProvider(...)`
- `SkillProvider.list(...)` and `SkillProvider.get(...)`
- `BUNDLED_SKILL_RANK`
- directory `SkillResourceBase`
- kebab-case DSH Skill names
- DSH filesystem roots `.dsh/skills` and `.agents/skills` at project/user scope
- `user-invocable`, `disable-model-invocation`, `when-to-use`, and `metadata` frontmatter

## Change policy

Before expanding peer dependency ranges, run the provider and package acceptance suite against the new official DSH version and record the tested commit here. Compatibility claims are based on exercised contracts, not similar naming or Markdown shape.

## Cross-Agent probe

Codex's `skill-creator` quick validator currently rejects the DSH frontmatter keys `when-to-use`, `user-invocable`, and `disable-model-invocation`. DSH officially supports these fields and this V1 intentionally retains them. Therefore the bundled Skill is structurally similar to a Codex Skill but is not claimed to be fully Codex-compatible. Cross-Agent metadata profiles are deferred until they can be specified and tested independently.
