# Changelog

## v1.0.0 (2026-06-30)

### 🎉 Initial Release

**HOS-Silly-Mock: Anti-Fake Data & Anti-Regex Reality Enforcement Layer**

A 4-layer enforcement engine that prevents AI from generating fake/mock systems,
overusing regex for structured parsing, creating silent failures, or producing
data without real source bindings.

#### Features

- **Layer 1: MOCK Exposure** — Detects unannotated mock data, catch→mock fallback patterns, mock-indicating variable names. Requires explicit `MOCK_MODE: TRUE` + reason annotations.
- **Layer 2: Regex Reflection Blocker** — Detects regex patterns used for JSON/HTML/XML/CSV/URL parsing in structural contexts. Recommends standard parsers.
- **Layer 3: Reality Binding** — Traces source → transform → sink chains. Flags unbound variables (no source) and orphaned data (no sink).
- **Layer 4: Silent Failure Detection** — Detects empty catch blocks, I/O functions without error paths, and complete systems with zero I/O operations (silent fake system).
- **Reality Score** — Weighted 0-100 score aggregating all 4 layers.
- **Reporters** — Pretty-print console output with ANSI colors, JSON export, Markdown report.

#### Test Results

```
6/6 test groups:   ALL PASSED
22/22 tests:       ALL PASSED
```

#### Integration

- Claude Code Skill (`SKILL.md`)
- HOS-Sec-Engine V2 compatible
- CI/CD gate via `enforce()` API
- AI Agent System Prompt included
- CLI: `hos-silly-mock analyze <files>`

#### Notes

- Zero runtime dependencies
- Pure TypeScript (compiles to CommonJS)
- Configurable thresholds and exemption markers
- Compatible with `@silly-mock:allow` test exemptions
