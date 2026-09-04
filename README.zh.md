# relay-dsh-plugin-skill-creator

这是一个公开的 DeepSeek Harness 插件。它向 DSH 注册 `conversation-to-skill`，用于把已经完成或基本成功的多轮对话，提炼为可复用、可审阅、可验证的 DSH Skill。

生成结果支持完整目录：`SKILL.md`、`references/`、`scripts/`、`assets/`。只有确有用途的资源才会创建，不会为了凑结构生成空目录。

## 安装到 DSH

在 DSH Host 中安装本仓库，并应用包内的 `cordis.patch.yml`：

```bash
npm install github:yangbobo2021/relay-dsh-plugin-skill-creator
```

## 使用方式

完成一次有价值的多轮任务后，要求 DSH“把当前对话提炼成 Skill”，或直接调用 `conversation-to-skill`。

它会先输出 Skill 名称、安装位置、完整文件树、每个文件的来源与用途、被排除的临时/敏感信息以及验证计划；只有收到明确确认后才写文件。完成后还会运行结构与隐私检查，并验证 DSH 能否发现和加载新 Skill。

V1 只使用当前 DSH 上下文中实际可见的对话与文件，不声称访问已经丢失或隐藏的历史。

## 开发与验收

```bash
npm ci
npm run verify
```

验收包括真实 DSH `SkillRegistry` 生命周期、独立验证器的正反例、指令安全顺序，以及 npm 打包内容检查。

详细约定见 [SPEC.md](SPEC.md)、[架构](docs/architecture.md)、[安全模型](docs/security.md)、[验收矩阵](docs/acceptance.md) 和 [DSH 兼容基线](docs/dsh-compatibility.md)。
