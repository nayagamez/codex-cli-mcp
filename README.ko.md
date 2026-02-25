<div align="center">

<picture>
  <img alt="codex-cli-mcp" src="docs/images/banner.svg" width="100%">
</picture>

### OpenAI Codex CLI를 MCP 클라이언트에 연결하세요

[English](./README.md) | 한국어

<a href="https://www.npmjs.com/package/@nayagamez/codex-cli-mcp">npm</a> · <a href="https://github.com/nayagamez/codex-cli-mcp">GitHub</a> · <a href="https://github.com/nayagamez/codex-cli-mcp/issues">Issues</a>

[![npm version](https://img.shields.io/npm/v/@nayagamez/codex-cli-mcp?color=00d4aa&label=npm)](https://www.npmjs.com/package/@nayagamez/codex-cli-mcp)
[![license](https://img.shields.io/github/license/nayagamez/codex-cli-mcp?color=7b61ff)](https://github.com/nayagamez/codex-cli-mcp/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/nayagamez/codex-cli-mcp?style=social)](https://github.com/nayagamez/codex-cli-mcp)

</div>

---

## 개요

[OpenAI Codex CLI](https://github.com/openai/codex)를 MCP 도구로 래핑한 MCP(Model Context Protocol) 서버입니다. **Claude Desktop**, **Cursor**, **Windsurf** 등의 MCP 클라이언트에서 Codex CLI를 헤드리스 모드로 실행할 수 있습니다.

## 사전 준비

### 1. Codex CLI 설치

[Codex CLI](https://github.com/openai/codex) ([문서](https://developers.openai.com/codex/cli))를 설치하고 PATH에 등록합니다:

```bash
# npm
npm install -g @openai/codex

# Homebrew (macOS)
brew install --cask codex
```

또는 [GitHub Releases](https://github.com/openai/codex/releases/latest)에서 바이너리를 직접 다운로드할 수 있습니다.

### 2. 인증

**방법 A — ChatGPT 로그인 (권장)**

`codex`를 실행하고 "Sign in with ChatGPT"를 선택합니다. Plus, Pro, Team, Edu, Enterprise 플랜이 필요합니다.

**방법 B — API Key**

헤드리스 / CI 환경에서 사용:

```bash
export OPENAI_API_KEY="your-api-key"
```

자세한 내용은 [Codex 인증 문서](https://developers.openai.com/codex/auth/)를 참고하세요.

## 설치

```bash
npm install -g @nayagamez/codex-cli-mcp
```

또는 npx로 바로 실행:

```bash
npx @nayagamez/codex-cli-mcp
```

## 도구

### `codex`

새 Codex CLI 세션을 시작합니다.

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `prompt` | string | O | Codex에 보낼 프롬프트 |
| `model` | string | X | 모델명 (예: `o4-mini`, `gpt-4.1`, `o3`) |
| `sandbox` | enum | X | `read-only`, `workspace-write`, `danger-full-access` |
| `cwd` | string | X | 작업 디렉토리 |
| `profile` | string | X | config.toml의 프로필 |
| `config` | object | X | key-value 형태의 설정 오버라이드 |

### `codex-reply`

기존 Codex CLI 세션을 이어서 진행합니다.

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `prompt` | string | O | 후속 프롬프트 |
| `threadId` | string | O | 이전 `codex` 호출에서 받은 Thread ID |
| `model` | string | X | 모델명 오버라이드 |
| `config` | object | X | key-value 형태의 설정 오버라이드 |

## MCP 클라이언트 설정

### Claude Desktop

`claude_desktop_config.json`에 추가:

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

MCP 설정에 추가:

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

## 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `CODEX_CLI_PATH` | `codex` | Codex CLI 바이너리 경로 |
| `CODEX_TIMEOUT_MS` | `600000` (10분) | Codex 프로세스 타임아웃 |
| `CODEX_MCP_DEBUG` | _(미설정)_ | 설정 시 stderr에 디버그 로그 출력 |

## 동작 방식

```
MCP 클라이언트  →  도구 호출 (codex / codex-reply)
               →  `codex exec --json --full-auto` 서브프로세스 실행
               →  stdout에서 JSONL 이벤트 스트리밍 및 파싱
               →  포맷된 결과를 MCP 클라이언트에 반환
```

1. MCP 클라이언트가 도구 호출(`codex` 또는 `codex-reply`)을 전송
2. 서버가 `--json`, `--full-auto` 플래그로 Codex CLI 실행
3. 프롬프트를 stdin으로 전달
4. JSONL 이벤트를 실시간으로 스트리밍 및 파싱
5. 결과(메시지, 실행된 명령어, 에러, 토큰 사용량)를 마크다운으로 포맷하여 반환

## 라이선스

MIT
