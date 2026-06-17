# HOS-Sec-Engine

> AI Code Audit & Penetration Testing Skill Engine

Anthropic Skills compatible format. Install via `npx skills add <owner>/<repo>`

## Available Skills

| Skill | Description |
|-------|-------------|
| [HOS-Sec-Engine](./HOS-Sec-Engine/SKILL.md) | Main engine - Full code audit + penetration testing dual engine |
| [audit](./HOS-Sec-Engine/audit/SKILL.md) | White-box code audit rules only |
| [pentest](./HOS-Sec-Engine/pentest/SKILL.md) | Black-box penetration testing rules only |
| [diagnostics](./HOS-Sec-Engine/diagnostics/SKILL.md) | Problem diagnostics and remediation |

## Installation

```bash
npx skills add <github-owner>/hos-audit-core
```

## Usage

After installation, each skill will be automatically loaded by Claude when relevant security tasks are detected.
