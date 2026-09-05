# Security and privacy

Treat the conversation as potentially sensitive source material. A reusable Skill should encode procedure, not retain private evidence.

## Exclude by default

- passwords, API keys, cookies, bearer tokens, private keys, connection strings, and recovery codes;
- real customer or employee names, email addresses, phone numbers, account identifiers, and private URLs;
- production logs, proprietary source excerpts, unredacted documents, and internal incident details;
- absolute home directories and machine-specific temporary paths;
- session IDs, task IDs, timestamps, one-off amounts, and transient system state;
- assistant chain-of-thought or transcript dumps.

Sanitize examples with unmistakable placeholders such as `EXAMPLE_PROJECT`, `user@example.invalid`, and `${API_TOKEN}`. Never invent realistic-looking credentials.

## Permission boundaries

The generated Skill must retain confirmation gates for destructive actions, external publication, account changes, money movement, or messages sent to third parties. It must not turn a one-time permission into standing authorization.

Prefer read-only discovery before mutation. Scope file writes to the agreed directory. If a generated script can delete, overwrite, publish, or transmit data, make the dangerous mode explicit and require a confirmation flag or interactive gate.

## Validation limits

Pattern scanning can catch common leaks but cannot prove that content is non-sensitive. Review every proposed file against the visible conversation. Report both automated scan results and the limits of the scan.

Static scanning is insufficient for generated scripts. A script may correctly report a PII warning while also echoing the complete source row elsewhere in stdout, stderr, or an output file. Treat all script outputs and persisted artifacts as part of the disclosure boundary.

For every generated script that consumes user, customer, employee, credential, or production data, create a sanitized fixture containing at least three unique synthetic canaries: an `@example.invalid` email, a reserved-looking phone value, and an account identifier. Run the script only through [the privacy canary wrapper](../scripts/check-privacy-canary.mjs), for example:

```bash
node <creator-resource-base>/scripts/check-privacy-canary.mjs \
  --canary privacy-canary@example.invalid \
  --canary 13900001234 \
  --canary ACCOUNT-CANARY-7Q9K2 \
  -- node <generated-skill>/scripts/example.mjs <sanitized-canary-input>
```

Add `--scan <generated-output-path>` for every file or directory the command may create. Do not scan the canary input itself. The wrapper captures child stdout and stderr instead of replaying them into DSH history, and reports only the canary index and leak location. Any leak is a hard failure: fix the script and rerun the wrapper before executing it normally.

If sensitive information is essential to explain the workflow, describe its type and acquisition method rather than embedding its value.
