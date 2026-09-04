---
name: conversation-to-skill
description: Extract a completed or substantially successful DSH conversation into a reusable, validated DSH Skill bundle with SKILL.md and justified references, scripts, and assets. Use when the user asks to preserve this conversation as a Skill, make this workflow repeatable, or turn the result into a more controllable procedure.
when-to-use: Use after the conversation contains a concrete outcome, important corrections, or an agreed workflow worth reusing. Do not use for a vague idea that has not yet been worked through.
user-invocable: true
disable-model-invocation: false
metadata:
  locale: multilingual
  maturity: v1
---

# Conversation to Skill

Turn the current visible DSH conversation into a production-quality DSH Skill directory. Preserve the reasoning that improved the result, not the transcript itself.

## Scope and truthfulness

- Treat only messages and artifacts actually visible in the current DSH context as evidence. Do not claim access to hidden or expired session history.
- Inspect workspace files only when they are relevant to the workflow being extracted.
- Reply in the user's language unless they request another language.
- Never claim that a Skill is installed, discovered, or tested unless the corresponding operation succeeded.

## Workflow

1. Read [references/extraction-guide.md](references/extraction-guide.md), then reconstruct:
   - the reusable goal and trigger;
   - required inputs and expected outputs;
   - the successful procedure and decision points;
   - user corrections, rejected approaches, failure modes, and fallbacks;
   - permissions, safety boundaries, and observable acceptance criteria.
2. Read [references/security-and-privacy.md](references/security-and-privacy.md). Remove secrets, identities, customer data, machine-specific paths, temporary values, and facts useful only to this one run. Replace genuinely required examples with sanitized placeholders.
3. Read [references/resource-routing.md](references/resource-routing.md). Design the smallest complete directory that supports the task:
   - put routing and the mandatory workflow in `SKILL.md`;
   - put detailed or conditional knowledge in `references/`;
   - put deterministic, repeatable operations in `scripts/`;
   - put templates or files copied into outputs in `assets/`.
4. Read [references/dsh-skill-format.md](references/dsh-skill-format.md) before choosing metadata, name, or install path.
5. Present a proposal before writing anything. The proposal must contain:
   - Skill name and one-sentence routing description;
   - target scope and exact target directory;
   - full proposed file tree;
   - the purpose and conversation evidence for every file;
   - excluded one-off or sensitive details;
   - planned validation and any checks that cannot be run.
6. Stop and wait for explicit user confirmation. A request to extract a Skill is not permission to create or overwrite files before this review.
7. After confirmation, create the agreed directory. Default to `<project>/.dsh/skills/<skill-name>/`. Use `~/.dsh/skills/<skill-name>/` only when the user explicitly requests user scope or no project applies and the user confirms that path.
8. If the target already exists, inspect it and propose an update or diff. Never overwrite an existing Skill silently.
9. Start from [assets/skill-skeleton/SKILL.md.tmpl](assets/skill-skeleton/SKILL.md.tmpl), then create only resources justified by the proposal. Do not leave placeholder files, empty directories, TODO-only scripts, or copied transcript dumps.
10. Run this bundle's validator against the generated Skill:

    ```bash
    node scripts/validate-skill.mjs /absolute/path/to/generated-skill
    ```

    Resolve that script relative to this Skill's resource base, not the user's project. Fix every error. Review warnings with the user when they represent an intentional exception.
11. Execute generated scripts with safe representative inputs when the environment permits. Record skipped checks as unverified; do not describe them as passing.
12. Verify the installed Skill through DSH's Skill catalog/loader in the target project. Confirm that its name, description, body, and relative resources resolve. If DSH cannot refresh dynamically, state the exact restart or reload needed and verify afterward when possible.

## Completion report

Report the installed path, created or changed files, validation results, script checks, DSH discovery result, excluded sensitive material, and remaining unverified assumptions. Success requires both a valid on-disk bundle and successful DSH discovery; otherwise report the precise partial state.
