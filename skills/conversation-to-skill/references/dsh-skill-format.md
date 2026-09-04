# DSH Skill format

This release targets DeepSeek Harness (DSH) only.

## Directory and name

The canonical directory form is:

```text
<skill-root>/<skill-name>/SKILL.md
```

`skill-name` must be lowercase kebab-case and match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. The directory name and frontmatter `name` must match.

Project scope defaults to `.dsh/skills/`. DSH also recognizes project `.agents/skills/`, user `~/.dsh/skills/`, and user `~/.agents/skills/`, but this creator uses `.dsh/skills/` unless the user deliberately selects another scope.

## Frontmatter

Required fields:

```yaml
---
name: example-skill
description: State what the Skill does and the user intent that should trigger it.
---
```

Supported optional routing fields include:

- `when-to-use`: additional selection guidance;
- `user-invocable`: whether human-facing invocation is available;
- `disable-model-invocation`: whether model-facing discovery is disabled;
- `metadata`: provider-neutral structured annotations.

Use booleans for invocation flags. Keep the description concise and include trigger language because DSH uses it during discovery.

## Resources

Relative Markdown links in `SKILL.md` resolve against the Skill directory. Keep links inside that directory. Do not depend on the creator plugin's own files after generation, except while running its validator during creation.

## Compatibility baseline

The plugin implementation is validated against official DeepSeek Harness commit `76fda729799fe9b3848dbe2c211d4b231032b81e`, `@deepseek-ai/dsh-skill` `0.1.2-rc.1`, and `@deepseek-ai/cordis` `4.0.2`. See the repository's `docs/dsh-compatibility.md` before changing provider behavior.
