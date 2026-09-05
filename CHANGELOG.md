# Changelog

## 0.1.2 - 2026-09-05

- Add requirement-to-test acceptance contracts and a one-fresh-Session semantic replay gate.
- Add a captured runtime privacy-canary wrapper for stdout, stderr, and generated artifacts.
- Detect PII-like literals, unexplained short name segments, and orphan resources during validation.
- Add explicit proposal and generation token budgets to reduce unnecessary Agent work.
- Require intent-bearing Skill names and honest budget/replay reporting.

## 0.1.1 - 2026-09-04

- Publish subsequent releases through the verified GitHub Actions OIDC trusted publisher.
- Document npm installation and the tokenless release path.

## 0.1.0 - 2026-09-04

- Register the bundled `conversation-to-skill` DSH Skill.
- Support complete generated Skill bundles with references, scripts, and assets.
- Add proposal-before-write, privacy, safe-update, validation, and honest-reporting requirements.
- Add a standalone structural and privacy validator.
- Add real DSH registry, validator, instruction-contract, and package acceptance tests.
- Add tag-bound npm Trusted Publishing through GitHub Actions OIDC.
