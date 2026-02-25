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

Add `codex-cli-mcp` to your MCP client. Choose the section that matches your client.

### Claude Desktop

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

Add to your Cursor MCP settings (`.cursor/mcp.json` in your project or global settings):

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

Add to your Windsurf MCP settings:

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

Run the following command:

```bash
claude mcp add codex-cli-mcp -- npx -y @nayagamez/codex-cli-mcp
```

## 3. Verify

After configuration, confirm the `codex` tool is available in your MCP client. Try calling the `codex` tool with a simple prompt:

```
prompt: "echo hello"
```

If you get a response containing "hello", the setup is complete.
