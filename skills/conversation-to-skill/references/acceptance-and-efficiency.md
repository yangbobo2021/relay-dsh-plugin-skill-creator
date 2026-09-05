# Acceptance contract and efficiency budget

Use this reference to turn conversational corrections into executable evidence without multiplying paid Agent runs.

## Acceptance contract

Before proposing files, build a compact contract table. Show it in the proposal so the user can correct the contract before any writes.

| Field | Meaning |
| --- | --- |
| ID | Stable `R1`, `R2`, ... identifier used by tests and the completion report |
| Requirement | Observable rule derived from the conversation |
| Evidence | The latest visible user correction or accepted result that supports it |
| Test | The cheapest deterministic check that can falsify the rule |
| Oracle | Exact pass condition |

Every user correction, safety boundary, output-shape rule, and completion condition needs an ID. Do not create a contract row for incidental examples or transient values. When requirements conflict, the latest explicit user correction wins and the superseded behavior becomes a negative test when useful.

Trace each proposed file to one or more requirement IDs. A file with no requirement or verification purpose should not be created.

## Layered verification

Use the cheapest layer that can catch the defect, in this order:

1. Static bundle validation: metadata, links, portability, secrets, PII-like literals, orphan resources, and unfinished content.
2. Deterministic resource checks: run generated scripts on sanitized success, malformed-input, and safety fixtures.
3. Privacy canary gate: prove that scripts do not echo synthetic identifiers.
4. DSH discovery: confirm that the generated Skill appears in the target project's catalog and its resources load.
5. One fresh-session replay: use the same DSH installation and account, but a new Session and a second sanitized input. Do not name the Skill in the replay prompt; this tests routing as well as execution.

Paid cross-Agent or cross-account runs are not required. One creator run plus at most one fresh DSH replay is the default semantic test budget. If the environment cannot create a fresh Session, provide the exact replay prompt, fixture, expected rules, and mark this layer unverified.

Privacy and retained confirmation gates are hard requirements: any failure prevents a successful completion report even when the structural validator says `VALID`.

## Efficiency budget

For a generated bundle of eight files or fewer:

- keep the proposal at or below roughly 1,500 output tokens;
- target at most 8,000 output tokens for generation, repair, and validation;
- do not create a task tracker solely for this bounded workflow;
- read each creator reference once and do not restate it in hidden or visible prose;
- batch independent reads and writes when the runtime supports it;
- prefer a packaged template or a narrow standard-library script over inventing a general framework;
- keep test narration to one short status line per validation layer;
- stop after two failed repair cycles for the same resource and report the remaining failure instead of looping.

These are budgets, not reasons to skip safety checks. Report actual token/step data when DSH exposes it. Exceeding the target is a warning in the completion report and evidence for improving the creator or template.
