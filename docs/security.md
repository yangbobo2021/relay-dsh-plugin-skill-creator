# Security model

## Threats addressed

- Accidental retention of credentials or private conversation details.
- Machine-specific paths that make a Skill non-portable and reveal identity.
- Markdown resources that escape the Skill directory.
- Symlinks that conceal external files in an apparently self-contained bundle.
- Silent overwrite of a user's existing Skill.
- Conversion of one-time authorization into permanent instructions.
- False claims that a bundle was installed or tested.

## Controls

The instruction layer requires a file-level proposal and explicit user confirmation before mutation. It generalizes private values, preserves permission boundaries, and requires DSH discovery after structural validation.

The validator is read-only. It rejects known secret formats, private-key material, sensitive filenames, forbidden generated directories, absolute home paths, broken/escaping local Markdown links, and symlinks. It warns about unfinished placeholders and empty optional resource directories.

## Known limits

Pattern matching cannot identify every proprietary fact or credential format and can produce false positives in security documentation. Human review remains mandatory. The validator does not execute generated scripts; the creating Agent must run safe representative tests separately and report skipped execution honestly.

The bundled Skill is trusted local instruction content. A malicious conversation may attempt to place unsafe behavior into a generated Skill, so user review happens before file creation and again when warnings represent intentional exceptions.
