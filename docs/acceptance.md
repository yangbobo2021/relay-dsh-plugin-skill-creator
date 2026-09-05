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
| SC-011 | User corrections become traceable acceptance contracts and resources have no unexplained names/orphans | Instruction and validator tests |
| SC-012 | Potentially sensitive script inputs cannot leak canaries through stdout, stderr, or output files | Isolated subprocess and filesystem canary tests |
| SC-013 | Semantic reuse uses at most one fresh DSH Session and tests natural routing without naming the Skill | Instruction contract plus recorded live acceptance when credentials are available |
| SC-014 | Small bundles have explicit proposal/generation budgets and avoid orchestration overhead | Instruction contract test |

## Semantic acceptance without paid multi-Agent runs

The release avoids making cross-Agent quality claims. Its CI boundary is DSH itself: provider lifecycle, canonical parsing, resource resolution, validator behavior, privacy-canary containment, and package contents use deterministic tests. Instruction-contract tests verify required ordering, acceptance contracts, safety gates, replay shape, and cost budgets without spending model tokens.

One optional live acceptance uses the same DSH installation and account for a creator Session plus at most one fresh replay Session. The replay uses a second sanitized fixture and a natural prompt that does not name the Skill. When credentials or Session creation are unavailable, the completion report must provide the exact replay packet and mark SC-013 unverified. This split keeps CI deterministic while remaining honest about what static checks cannot prove.
