# @nayagamez/codex-cli-mcp

An MCP (Model Context Protocol) server that wraps [OpenAI Codex CLI](https://github.com/openai/codex) as tools. It enables MCP clients like Claude Desktop, Cursor, and Windsurf to run Codex CLI sessions in headless mode.

## Installation

```bash
npm install -g @nayagamez/codex-cli-mcp
```

Or run directly with npx:

```bash
npx @nayagamez/codex-cli-mcp
```

### Prerequisites

- [Codex CLI](https://github.com/openai/codex) must be installed and available in your PATH
- An OpenAI API key configured for Codex CLI

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
| `CODEX_TIMEOUT_MS` | `300000` (5 min) | Timeout for Codex process execution |
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
