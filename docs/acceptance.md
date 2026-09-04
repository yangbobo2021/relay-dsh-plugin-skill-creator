# Acceptance matrix

| ID | Promise | Automated evidence |
| --- | --- | --- |
| SC-001 | DSH discovers exactly one invocable bundled Skill | Real `Context` + `SkillRegistry` integration test |
| SC-002 | Loaded body and resources are canonical | Provider integration test |
| SC-003 | Extraction is limited to visible context | Instruction contract test |
| SC-004 | All resource types are supported and purposeful | Package and instruction contract tests |
| SC-005 | Proposal and confirmation precede writes | Instruction ordering test |
| SC-006 | Existing Skills are not silently overwritten | Instruction contract test |
| SC-007 | Structural/privacy validator fails closed | Valid and invalid fixture tests |
| SC-008 | Results distinguish verified and skipped checks | Instruction contract test |
| SC-009 | Privacy and permission boundaries are retained | Instruction and validator tests |
| SC-010 | Public DSH package is complete and clean | `npm pack --dry-run` acceptance script |

## Semantic acceptance without paid multi-Agent runs

V1 avoids making cross-Agent quality claims. Its executable acceptance boundary is DSH itself: provider lifecycle, canonical parsing, resource resolution, validator behavior, and package contents use deterministic tests. Instruction-contract tests verify required ordering and safety invariants without spending model tokens. Human review remains the acceptance mechanism for the semantic usefulness of a newly extracted Skill.

This split makes the deliverable reproducible while being honest about what static checks cannot prove.
