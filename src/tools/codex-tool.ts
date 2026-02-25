/**
 * "codex" MCP tool — start a new Codex CLI session.
 */

import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { execCodex } from '../codex-runner.js'
import { formatResult } from './format.js'
import log from '../util/logger.js'

const DESCRIPTION = `Run a Codex CLI session. Executes \`codex exec\` as a subprocess and returns the result.

Use this tool to start a new coding task with Codex. The response includes a Thread ID that can be used with the codex-reply tool to continue the conversation.`

const schema = {
  prompt: z.string().describe('The prompt to send to Codex'),
  model: z.string().optional().describe('Model name override. Do NOT set this unless the user explicitly requests a specific model. Codex CLI uses its own configured default.'),
  sandbox: z
    .enum(['read-only', 'workspace-write', 'danger-full-access'])
    .optional()
    .describe('Sandbox mode for file access'),
  cwd: z.string().optional().describe('Working directory for the Codex session'),
  profile: z.string().optional().describe('Configuration profile from config.toml'),
  config: z
    .record(z.string(), z.string())
    .optional()
    .describe('Config overrides as key-value pairs (passed as -c key=value)'),
  timeout: z
    .number()
    .optional()
    .describe('Timeout in milliseconds (default: 600000 = 10 min). Increase for long-running tasks.'),
}

export function registerCodexTool(server: McpServer): void {
  server.tool('codex', DESCRIPTION, schema, async ({ prompt, model, sandbox, cwd, profile, config, timeout }, extra) => {
    try {
      const progressToken = extra._meta?.progressToken
      const onProgress = progressToken !== undefined
        ? (progress: number, message: string) => {
            extra.sendNotification({
              method: 'notifications/progress' as const,
              params: { progressToken, progress, message },
            }).catch(() => {})  // best-effort
          }
        : undefined

      const result = await execCodex({ prompt, model, sandbox, cwd, profile, config, timeout }, onProgress)
      const text = formatResult(result)
      const isError = result.errors.length > 0 && result.messages.length === 0

      return {
        content: [{ type: 'text' as const, text }],
        ...(isError && { isError: true }),
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      log.error('codex tool error:', message)
      return {
        content: [{ type: 'text' as const, text: `Error: ${message}` }],
        isError: true,
      }
    }
  })
}
