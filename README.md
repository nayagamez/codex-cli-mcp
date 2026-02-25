<div align="center">

<picture>
  <img alt="codex-cli-mcp" src="docs/images/banner.svg" width="100%">
</picture>

### Bridge OpenAI Codex CLI to any MCP client

English | [한국어](./README.ko.md)

<a href="https://www.npmjs.com/package/@nayagamez/codex-cli-mcp">npm</a> · <a href="https://github.com/nayagamez/codex-cli-mcp">GitHub</a> · <a href="https://github.com/nayagamez/codex-cli-mcp/issues">Issues</a>

[![npm version](https://img.shields.io/npm/v/@nayagamez/codex-cli-mcp?color=00d4aa&label=npm)](https://www.npmjs.com/package/@nayagamez/codex-cli-mcp)
[![license](https://img.shields.io/github/license/nayagamez/codex-cli-mcp?color=7b61ff)](https://github.com/nayagamez/codex-cli-mcp/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/nayagamez/codex-cli-mcp?style=social)](https://github.com/nayagamez/codex-cli-mcp)

</div>

---

## Overview

An MCP (Model Context Protocol) server that wraps [OpenAI Codex CLI](https://github.com/openai/codex) as tools. It enables MCP clients like **Claude Desktop**, **Cursor**, and **Windsurf** to run Codex CLI sessions in headless mode.

## Prerequisites

1. Install [Codex CLI](https://github.com/openai/codex) and make sure it is available in your PATH:
   ```bash
   npm install -g @openai/codex
   ```
2. Set your OpenAI API key:
   ```bash
   export OPENAI_API_KEY="your-api-key"
   ```

## Installation

```bash
npm install -g @nayagamez/codex-cli-mcp
```

Or run directly with npx:

```bash
npx @nayagamez/codex-cli-mcp
```

## Tools

### `codex`

Start a new Codex CLI session.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | The prompt to send to Codex |
| `model` | string | No | Model name (e.g. `o4-mini`, `gpt-4.1`, `o3`) |
| `sandbox` | enum | No | `read-only`, `workspace-write`, or `danger-full-access` |
| `cwd` | string | No | Working directory for the session |
| `profile` | string | No | Configuration profile from config.toml |
| `config` | object | No | Config overrides as key-value pairs |

### `codex-reply`

Continue an existing Codex CLI session.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | The follow-up prompt |
| `threadId` | string | Yes | Thread ID from a previous `codex` call |
| `model` | string | No | Model name override |
| `config` | object | No | Config overrides as key-value pairs |

## MCP Client Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "codex-cli-mcp": {
      "command": "npx",
      "args": ["-y", "@nayagamez/codex-cli-mcp"]
    }
  }
}
```

### Cursor / Windsurf

Add to your MCP settings:

```json
{
  "mcpServers": {
    "codex-cli-mcp": {
      "command": "npx",
      "args": ["-y", "@nayagamez/codex-cli-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add codex-cli-mcp -- npx -y @nayagamez/codex-cli-mcp
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CODEX_CLI_PATH` | `codex` | Path to the Codex CLI binary |
| `CODEX_TIMEOUT_MS` | `600000` (10 min) | Timeout for Codex process execution |
| `CODEX_MCP_DEBUG` | _(unset)_ | Set to enable debug logging to stderr |

## How It Works

```
MCP Client  →  Tool Call (codex / codex-reply)
            →  Spawn `codex exec --json --full-auto` as subprocess
            →  Stream and parse JSONL events from stdout
            →  Return formatted results to MCP client
```

1. The MCP client sends a tool call (`codex` or `codex-reply`)
2. The server spawns Codex CLI with `--json` and `--full-auto` flags
3. The prompt is passed via stdin
4. JSONL events are streamed and parsed in real-time
5. Results (messages, commands, errors, token usage) are formatted as markdown and returned

## License

MIT
