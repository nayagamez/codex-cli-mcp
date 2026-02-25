/**
 * Logger that writes to stderr only.
 *
 * In an MCP stdio server, stdout is reserved for JSON-RPC messages.
 * All diagnostic output must go to stderr.
 */

const PREFIX = '[codex-mcp]'

export const log = {
  info(...args: unknown[]): void {
    console.error(PREFIX, ...args)
  },
  warn(...args: unknown[]): void {
    console.error(PREFIX, 'WARN:', ...args)
  },
  error(...args: unknown[]): void {
    console.error(PREFIX, 'ERROR:', ...args)
  },
  debug(...args: unknown[]): void {
    if (process.env.CODEX_MCP_DEBUG) {
      console.error(PREFIX, 'DEBUG:', ...args)
    }
  },
}

export default log
