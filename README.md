# relay-dsh-plugin-skill-creator

A public DeepSeek Harness plugin that registers `conversation-to-skill`: a bundled Skill for turning a completed DSH conversation into a reusable, reviewed, and validated DSH Skill directory.

The generated bundle can include `SKILL.md`, `references/`, `scripts/`, and `assets/`. Resources are created only when the extracted workflow needs them.

## Install in DSH

Add the public npm package to the DSH host and apply its bundled Cordis patch:

```bash
npm install relay-dsh-plugin-skill-creator
```

For repository development, installation from GitHub remains supported with `npm install github:yangbobo2021/relay-dsh-plugin-skill-creator`.

The included `cordis.patch.yml` inserts `relay-dsh-plugin-skill-creator` into the host configuration.

## Use

At the end of a useful multi-turn DSH conversation, ask DSH to turn the conversation into a Skill or invoke `conversation-to-skill`. The Skill first proposes the target path and full file tree. It writes only after explicit confirmation, validates the generated bundle, and then verifies DSH discovery.

V1 uses the conversation and artifacts visible in the current DSH context. It does not claim access to expired or hidden history.

## Development

```bash
npm ci
npm run verify
```

The tests use the real DSH `SkillRegistry`, exercise the standalone validator, and inspect the package produced by npm.

See [SPEC.md](SPEC.md), [architecture](docs/architecture.md), [security model](docs/security.md), [acceptance matrix](docs/acceptance.md), and [DSH compatibility](docs/dsh-compatibility.md).

## Releases

Version tags publish through GitHub Actions using npm Trusted Publishing (OIDC), with no long-lived npm token. See [the release guide](docs/releasing.md) for the one-time first-package bootstrap and publisher binding.

## License

MIT
