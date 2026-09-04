# Product specification

## 1. Purpose

`relay-dsh-plugin-skill-creator` is a DeepSeek Harness plugin that registers one bundled Skill, `conversation-to-skill`. The Skill helps a user convert the current completed or substantially successful DSH conversation into a reusable, quality-controlled DSH Skill directory.

Version 1 is deliberately DSH-only. It does not promise Codex, Claude Code, or other Agent compatibility, and it does not depend on private full-session export APIs.

## 2. Product boundary

The distributable artifact is an npm-compatible DSH plugin. It contains:

- a Cordis plugin entry that registers one DSH Skill provider;
- a canonical `skills/conversation-to-skill/SKILL.md`;
- extraction, resource-routing, DSH-format, and privacy references;
- a deterministic Skill bundle validator;
- a reusable `SKILL.md` skeleton asset;
- design, security, compatibility, and acceptance documentation.

It is not a Codex plugin and must not contain `.codex-plugin/plugin.json`.

## 3. Functional requirements

### SC-001 — Discovery

When installed in DSH, the plugin registers exactly one bundled candidate named `conversation-to-skill`. The candidate is both model-invocable and user-invocable.

### SC-002 — Resource resolution

Loading the candidate returns the instruction body without YAML frontmatter and exposes the packaged Skill directory as its `resourceBase`.

### SC-003 — Evidence-limited extraction

The instructions limit extraction to the current visible DSH conversation and relevant visible artifacts. They must not claim access to unavailable history.

### SC-004 — Full bundle support

The creator can propose and generate `SKILL.md`, `references/`, `scripts/`, and `assets/`. Each resource must have a demonstrated purpose; unused directories are omitted.

### SC-005 — Review before mutation

Before creating or updating files, the creator presents the exact target path, complete tree, per-file purpose/evidence, exclusions, and validation plan, then waits for explicit confirmation.

### SC-006 — Safe update

An existing Skill is read before changes. The creator must not overwrite it silently.

### SC-007 — Validation

The bundled validator checks required metadata, DSH name grammar, directory/name agreement, non-empty content, contained and existing Markdown links, symlinks, forbidden paths, common credential patterns, machine-specific home paths, empty files, and unfinished placeholders.

### SC-008 — Honest verification

Completion reporting distinguishes automated validation, executed script tests, DSH discovery, and unverified assumptions. It never reports skipped checks as passing.

### SC-009 — Privacy

The creator removes secrets, personal/customer identifiers, one-run state, absolute home paths, and transcript dumps. Safety confirmation gates from the source task remain safety gates in the generated Skill.

### SC-010 — Packaging

The public package contains runtime code, the complete Skill resources, Cordis patch, license, and product documentation. It excludes tests, source files, repository metadata, environment files, and Codex plugin metadata.

## 4. Default install behavior

Generated Skills default to project scope at `<project>/.dsh/skills/<skill-name>/`. User scope at `~/.dsh/skills/<skill-name>/` requires an explicit choice or confirmation when no project applies.

## 5. Non-goals for version 1

- Full transcript retrieval beyond context visible to the Agent.
- Automatic inference from an unfinished brainstorming conversation.
- Publishing generated Skills to GitHub or npm.
- A universal cross-Agent Skill manifest.
- Running paid multi-Agent compatibility tests.
- Evaluating the semantic quality of every future generated Skill without user review.

## 6. Acceptance

The release is acceptable only when all automated cases in [docs/acceptance.md](docs/acceptance.md) pass against the pinned DSH compatibility baseline and the dry-run package contains the expected runtime resources.
