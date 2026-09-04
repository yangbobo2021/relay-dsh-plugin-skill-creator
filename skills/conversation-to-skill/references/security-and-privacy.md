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

If sensitive information is essential to explain the workflow, describe its type and acquisition method rather than embedding its value.
