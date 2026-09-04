# Resource routing

Every file must reduce instruction load, make behavior more deterministic, or provide a reusable output resource.

## `SKILL.md`

Keep the routing description and mandatory workflow in `SKILL.md`. It must remain understandable without loading every reference. Include:

- when the Skill applies and when it does not;
- non-negotiable safety or confirmation gates;
- the ordered happy path;
- links to conditional details;
- concrete completion checks.

Avoid long background explanations, exhaustive schemas, large examples, and implementation code in the main file.

## `references/`

Use references for knowledge the agent reads, not files it executes or copies. Good examples include a schema, error catalog, decision table, platform-specific instructions, or detailed style guide.

Link every reference directly from `SKILL.md` or from one clearly linked routing reference. State when it should be read. Split a reference when only one branch needs most of its content.

## `scripts/`

Use scripts when a deterministic operation would otherwise be rewritten or inconsistently improvised. A script must:

- have a narrow purpose and documented invocation;
- validate arguments and fail with actionable messages;
- avoid hidden network calls or destructive defaults;
- be runnable in the declared environment;
- receive representative tests whenever practical.

Do not create a script to wrap one trivial command or to hold pseudocode.

## `assets/`

Use assets for material copied, filled, rendered, or otherwise used in final outputs: templates, starter files, schemas consumed by another tool, icons, or sample configuration.

Assets are not additional instructions. Keep explanatory prose in a reference. Use sanitized content and make placeholders obvious.

## Decision table

| Reusable content | Destination |
| --- | --- |
| Required behavior on nearly every invocation | `SKILL.md` |
| Detailed knowledge needed only in some cases | `references/` |
| Deterministic transformation or validation | `scripts/` |
| File copied or adapted into the result | `assets/` |
| Conversation transcript or one-run scratch data | Exclude |

Do not create empty directories for categories that the extracted workflow does not need. This creator supports all four categories; it does not force every generated Skill to use all four.
