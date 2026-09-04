# Extraction guide

Use this guide to turn conversational evidence into reusable operating instructions.

## Evidence hierarchy

Prefer evidence in this order:

1. The user's latest explicit requirements and acceptance statements.
2. Corrections the user made after seeing an intermediate result.
3. A procedure that actually produced an accepted or clearly successful artifact.
4. Stable project conventions visible in instructions or repository files.
5. Reasonable defaults, labeled as defaults rather than user requirements.

Do not preserve an early assistant proposal when a later message rejects or supersedes it. A correction is often the highest-value part of the future Skill because it prevents a repeated failure.

## Extraction record

Build a private working record before drafting files:

| Field | Question |
| --- | --- |
| Trigger | What user intent should cause DSH to choose this Skill? |
| Outcome | What observable artifact or state means the task is complete? |
| Inputs | What must be supplied, discovered, or confirmed? |
| Workflow | Which ordered actions reliably produced the outcome? |
| Decisions | Which branches depend on input type, risk, or environment? |
| Corrections | What did the user reject, refine, or insist on? |
| Failures | Which attempts failed and what recovery worked? |
| Safety | Which writes, permissions, privacy rules, or stop points apply? |
| Verification | Which checks demonstrate correctness without subjective claims? |

This record is analysis material, not an output file. Do not save it unless the user asks.

## Generalization rules

- Replace instance-specific nouns with roles: `the customer spreadsheet`, not a real customer filename.
- Preserve a literal value only when the task protocol requires it.
- Express quality preferences as observable checks whenever possible.
- Separate required steps from optional improvements.
- Keep causal lessons: explain the condition that made a correction necessary.
- Do not manufacture a general rule from a single accidental detail.
- Retain tool names only when the tool is part of the required capability boundary. Otherwise describe the capability.

## Readiness gate

Recommend continuing the original task instead of creating a Skill when any of these is true:

- the desired outcome is still disputed;
- there is no successful path or accepted result to extract;
- the conversation is primarily brainstorming;
- critical inputs or safety decisions remain unresolved.

The user may override this gate. If so, label the resulting Skill as provisional in its documentation and list the missing validation.
