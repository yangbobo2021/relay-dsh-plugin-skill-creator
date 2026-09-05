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
2. Read [references/acceptance-and-efficiency.md](references/acceptance-and-efficiency.md). Convert every user correction, safety boundary, output-shape rule, and completion condition into a compact acceptance contract with stable requirement IDs, evidence, a falsifying test, and an exact pass oracle. Use deterministic checks for most requirements; budget at most one fresh DSH replay and no paid cross-Agent runs.
3. Read [references/security-and-privacy.md](references/security-and-privacy.md). Remove secrets, identities, customer data, machine-specific paths, temporary values, and facts useful only to this one run. Replace genuinely required examples with sanitized placeholders. Treat stdout, stderr, generated files, and tool history as disclosure surfaces, not only the final answer.
4. Read [references/resource-routing.md](references/resource-routing.md). Design the smallest complete directory that supports the task:
   - put routing and the mandatory workflow in `SKILL.md`;
   - put detailed or conditional knowledge in `references/`;
   - put deterministic, repeatable operations in `scripts/`;
   - put templates or files copied into outputs in `assets/`.
5. Read [references/dsh-skill-format.md](references/dsh-skill-format.md) before choosing metadata, name, or install path. Prefer complete intent-bearing words and reject unexplained abbreviations or project codenames.
6. Present a concise proposal before writing anything. Do not create a task tracker for this bounded workflow. The proposal must contain:
   - Skill name and one-sentence routing description;
   - target scope and exact target directory;
   - full proposed file tree;
   - the acceptance-contract table and the requirement IDs served by every file;
   - excluded one-off or sensitive details;
   - planned validation, fresh-session replay packet, efficiency target, and checks that cannot be run.
7. Stop and wait for explicit user confirmation. A request to extract a Skill is not permission to create or overwrite files before this review.
8. After confirmation, create the agreed directory. Default to `<project>/.dsh/skills/<skill-name>/`. Use `~/.dsh/skills/<skill-name>/` only when the user explicitly requests user scope or no project applies and the user confirms that path.
9. If the target already exists, inspect it and propose an update or diff. Never overwrite an existing Skill silently.
10. Start from [assets/skill-skeleton/SKILL.md.tmpl](assets/skill-skeleton/SKILL.md.tmpl), then create only resources justified by the proposal. Reference every resource from reachable instructions. Do not leave orphan resources, placeholder files, empty directories, TODO-only scripts, or copied transcript dumps. Batch independent writes when the runtime supports it and keep reasoning/status narration concise.
11. Run this bundle's validator against the generated Skill:

    ```bash
    node scripts/validate-skill.mjs /absolute/path/to/generated-skill
    ```

    Resolve that script relative to this Skill's resource base, not the user's project. Fix every error. Review warnings with the user when they represent an intentional exception.
12. Execute generated scripts with safe representative success and malformed inputs when the environment permits. For every script that handles potentially sensitive data, first run the synthetic privacy canary gate exactly as specified in [references/security-and-privacy.md](references/security-and-privacy.md); never run the canary fixture naked. A canary leak is a hard failure even when the validator reports `VALID`. Record skipped checks as unverified; do not describe them as passing.
13. Verify the installed Skill through DSH's Skill catalog/loader in the target project. Confirm that its name, description, body, and relative resources resolve. If DSH cannot refresh dynamically, state the exact restart or reload needed and verify afterward when possible.
14. When the environment exposes DSH Session creation, perform one fresh-session replay using a second sanitized fixture and a natural task prompt that does not name the Skill. Verify routing, resource execution, every acceptance-contract oracle, and absence of unexpected writes. Otherwise provide the exact replay packet and mark this layer unverified. Do not substitute a same-session rerun or a static file check for this claim.

## Completion report

Report the installed path, created or changed files, requirement-by-requirement contract results, structural validation, privacy canary result, script checks, DSH discovery, fresh-session replay, excluded sensitive material, actual token/step metrics when available, budget overruns, and remaining unverified assumptions. Success requires a valid on-disk bundle, successful DSH discovery, and every available safety hard gate. Never call a privacy-unsafe bundle successful merely because structural validation passed.
