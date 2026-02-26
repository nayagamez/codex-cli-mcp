# Changelog

All notable changes to this project will be documented in this file.

## [0.3.3] - 2026-02-26

### Changed
- Improve installation guide: 3-scope prompt (local, project, global) and language matching
- Reorder MCP client sections with Claude Code first

## [0.3.2] - 2026-02-26

### Changed
- Instruct LLMs not to set `model` parameter unless the user explicitly requests a specific model

## [0.3.1] - 2026-02-26

### Changed
- Refactor README: replace Installation section with Setup (For Humans / For LLM Agents / Manual Setup)
- Add `docs/guide/installation.md` for LLM-agent-driven installation
- Wrap manual client configs in collapsible `<details>` sections

## [0.3.0] - 2026-02-26

### Added
- Real-time MCP progress notifications during Codex processing
- Idle-based timeout: timer resets on every Codex event instead of absolute timeout

## [0.2.0] - 2026-02-26

### Added
- Per-call `timeout` parameter for `codex` and `codex-reply` tools
- `CODEX_TIMEOUT_MS` environment variable for global timeout override

## [0.1.1] - 2026-02-26

### Changed
- Increase default timeout from 5 minutes to 10 minutes

## [0.1.0] - 2026-02-26

### Added
- Initial release
- `codex` tool: start new Codex CLI sessions via MCP
- `codex-reply` tool: continue existing sessions with thread ID
- JSON mode (`--json`) with JSONL event parsing
- Full-auto mode (`--full-auto`) for headless operation
