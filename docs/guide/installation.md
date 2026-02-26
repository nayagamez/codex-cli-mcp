# codex-cli-mcp Installation Guide

> This guide is intended for LLM agents. Follow each step in order.

## 1. Prerequisites

### 1.1 Install Codex CLI

Install [OpenAI Codex CLI](https://github.com/openai/codex) and ensure it is available in your PATH:

```bash
npm install -g @openai/codex
```

Alternative methods:

```bash
# Homebrew (macOS)
brew install --cask codex
```

Or download the binary from [GitHub Releases](https://github.com/openai/codex/releases/latest).

### 1.2 Authenticate

**Option A — ChatGPT Login (Recommended)**

Run `codex` and select "Sign in with ChatGPT". Requires a Plus, Pro, Team, Edu, or Enterprise plan.

**Option B — API Key**

For headless / CI environments:

```bash
export OPENAI_API_KEY="your-api-key"
```

See the [Codex Authentication docs](https://developers.openai.com/codex/auth/) for more details.

## 2. Configure MCP Client

### 2.1 Ask the user for scope

**STOP — you must ask the user before proceeding.**

Ask the user in the same language they are using (e.g. if the conversation is in Korean, ask in Korean).

Ask: "Where do you want codex-cli-mcp available?"

| Choice | Meaning |
|--------|---------|
| **This project only (private)** | Only me, only this project |
| **This project (shared with team)** | Everyone on the team, this project (committable to git) |
| **All projects (global)** | Only me, across all projects |

Wait for the user's answer, then use it in the steps below.

### 2.2 Detect the MCP client

Determine which MCP client you are running in (Claude Code, Claude Desktop, Cursor, or Windsurf), then follow the matching section.

### Claude Code

All options must come **before** the server name.

- If user chose **This project only (private)**:

```bash
claude mcp add codex-cli-mcp -- npx -y @nayagamez/codex-cli-mcp
```

- If user chose **This project (shared with team)**:

```bash
claude mcp add --scope project codex-cli-mcp -- npx -y @nayagamez/codex-cli-mcp
```

- If user chose **All projects (global)**:

```bash
claude mcp add --scope user codex-cli-mcp -- npx -y @nayagamez/codex-cli-mcp
```

### Claude Desktop

Claude Desktop only supports global configuration.

Add to `claude_desktop_config.json`:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

Restart Claude Desktop after saving.

### Cursor

- If user chose **This project only (private)** or **This project (shared with team)** → add to `.cursor/mcp.json` in the project root
- If user chose **All projects (global)** → add to `~/.cursor/mcp.json`

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

### Windsurf

- If user chose **This project only (private)** or **This project (shared with team)** → add to `.windsurf/mcp.json` in the project root
- If user chose **All projects (global)** → add via Windsurf settings UI

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

## 3. Verify

After configuration, confirm the `codex` tool is available in your MCP client. Try calling the `codex` tool with a simple prompt:

```
prompt: "echo hello"
```

If you get a response containing "hello", the setup is complete.
