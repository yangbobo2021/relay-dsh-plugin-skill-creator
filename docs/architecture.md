# Architecture

## Components

```text
DSH / Cordis
  └─ relay-dsh-plugin-skill-creator (src/index.ts)
       └─ SkillProvider: relay-skill-creator
            └─ conversation-to-skill/
                 ├─ SKILL.md                 routing + mandatory workflow
                 ├─ references/              conditional knowledge
                 ├─ scripts/validate-skill   deterministic structural/privacy checks
                 └─ assets/skill-skeleton/   authoring seed
```

The provider parses the packaged `SKILL.md` once when it is registered. This keeps catalog metadata and loaded instructions derived from one canonical document. DSH receives the body without provider-specific YAML frontmatter and a directory `resourceBase` for relative links.

## Why plugin plus Skill

A compressed Skill directory is the reusable behavior. The plugin supplies installation, discovery, versioning, and a stable resource base. Keeping both layers separate also permits a future release to install the Skill directly through another DSH distribution mechanism without changing its content model.

## Progressive disclosure

The main instructions load only the references required for the current phase. Detailed extraction heuristics, resource classification, DSH format rules, and security guidance do not inflate every catalog entry or initial routing decision.

## Trust boundaries

- DSH owns conversation context, invocation, and presentation.
- The plugin owns one trusted bundled Skill provider.
- The Skill reasons only over context and files available through DSH.
- The validator inspects a requested local Skill directory and performs no network access or writes.
- The user owns approval before generated files are created or updated.

## Future extension points

Future versions may add an explicit session-export adapter, adapters for other Agent formats, and fixture-based semantic evaluations. Those capabilities must not weaken the V1 evidence, privacy, or confirmation boundaries.
