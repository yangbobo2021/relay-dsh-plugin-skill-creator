# Releasing

## Release contract

Releases are driven by an exact version tag. For package version `X.Y.Z`, push tag `vX.Y.Z` from a commit on `main`. Prerelease versions publish to the npm `next` dist-tag; stable versions publish to `latest`.

The workflow validates the tag, requires the tagged commit to be on `main`, runs the full test and package acceptance suite, audits runtime dependencies, inspects the tarball, skips an already-published immutable version, publishes, and verifies the resulting dist-tag.

## Authentication

`.github/workflows/release.yml` uses npm Trusted Publishing with GitHub Actions OIDC. It requests `id-token: write`, uses a GitHub-hosted runner and an OIDC-capable npm CLI, and contains no npm token or GitHub secret reference.

Configure the npm package's trusted publisher once with:

- GitHub user or organization: `yangbobo2021`
- Repository: `relay-dsh-plugin-skill-creator`
- Workflow filename: `release.yml`
- Allowed action: direct `npm publish`

After that one-time binding, tag releases require no browser authorization and no long-lived publish credential.

## First-release bootstrap

npm requires a package to exist before a Trusted Publisher can be attached. Version `0.1.0` was therefore bootstrapped with an interactive 2FA-authenticated npm session. The OIDC publisher is now attached; all later releases use the workflow only and require no long-lived token.

The equivalent npm CLI command, with npm 11.15 or newer and an interactive 2FA-authenticated session, is:

```bash
npm trust github relay-dsh-plugin-skill-creator \
  --repo yangbobo2021/relay-dsh-plugin-skill-creator \
  --file release.yml \
  --allow-publish \
  --yes
```
