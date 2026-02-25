/**
 * "codex-reply" MCP tool — continue an existing Codex CLI session.
 */

import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { resumeCodex } from '../codex-runner.js'
import { formatResult } from './format.js'
import log from '../util/logger.js'

const DESCRIPTION = `Continue a Codex CLI conversation by providing the thread ID from a previous codex call and a follow-up prompt.

Uses \`codex exec resume\` to load the previous session from disk and continue the conversation.`

const schema = {
  prompt: z.string().describe('The follow-up prompt to send to Codex'),
  threadId: z
    .string()
    .describe('The thread ID from a previous codex tool call'),
  model: z.string().optional().describe('Model name (e.g. "gpt-4.1", "o4-mini", "o3")'),
  config: z
    .record(z.string(), z.string())
    .optional()
    .describe('Config overrides as key-value pairs (passed as -c key=value)'),
  timeout: z
    .number()
    .optional()
    .describe('Timeout in milliseconds (default: 600000 = 10 min). Increase for long-running tasks.'),
}

export function registerCodexReplyTool(server: McpServer): void {
  server.tool('codex-reply', DESCRIPTION, schema, async ({ prompt, threadId, model, config, timeout }) => {
    try {
      const result = await resumeCodex({ prompt, threadId, model, config, timeout })
      const text = formatResult(result)
      const isError = result.errors.length > 0 && result.messages.length === 0

      return {
        content: [{ type: 'text' as const, text }],
        ...(isError && { isError: true }),
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      log.error('codex-reply tool error:', message)
      return {
        content: [{ type: 'text' as const, text: `Error: ${message}` }],
        isError: true,
      }
    }
  })
}
