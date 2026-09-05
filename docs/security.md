# Security model

## Threats addressed

- Accidental retention of credentials or private conversation details.
- Machine-specific paths that make a Skill non-portable and reveal identity.
- Markdown resources that escape the Skill directory.
- Symlinks that conceal external files in an apparently self-contained bundle.
- Silent overwrite of a user's existing Skill.
- Conversion of one-time authorization into permanent instructions.
- False claims that a bundle was installed or tested.
- Runtime disclosure where a generated script flags PII but also echoes the source row.

## Controls

The instruction layer requires a file-level proposal and explicit user confirmation before mutation. It generalizes private values, preserves permission boundaries, and requires DSH discovery after structural validation.

The validator is read-only. It rejects known secret formats, private-key material, PII-like email/phone literals outside explicit synthetic placeholders, sensitive filenames, forbidden generated directories, absolute home paths, broken/escaping local Markdown links, and symlinks. It warns about unexplained short name segments, orphan resources, unfinished placeholders, and empty optional resource directories.

The privacy-canary wrapper is a separate executable gate. It runs a generated command without a shell, captures stdout/stderr instead of replaying them, optionally scans declared output paths, and reports only canary indexes and locations. It never prints the canary value or captured child output.

## Known limits

Pattern matching cannot identify every proprietary fact or credential format and can produce false positives in security documentation. Human review remains mandatory. The structural validator does not execute generated scripts; the creating Agent must use the canary wrapper and safe representative tests separately and report skipped execution honestly. Literal canaries do not prove resistance to every encoding or semantic disclosure.

The bundled Skill is trusted local instruction content. A malicious conversation may attempt to place unsafe behavior into a generated Skill, so user review happens before file creation and again when warnings represent intentional exceptions.
