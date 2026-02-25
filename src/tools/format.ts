/**
 * Format a CodexResult into markdown text for MCP tool responses.
 */

import type { CodexResult } from '../types.js'

export function formatResult(result: CodexResult): string {
  const sections: string[] = []

  // Thread ID (always include for codex-reply usage)
  if (result.threadId) {
    sections.push(`**Thread ID:** \`${result.threadId}\``)
  }

  // Agent messages (main response)
  if (result.messages.length > 0) {
    sections.push(result.messages.join('\n\n'))
  }

  // Executed commands + output
  if (result.commands.length > 0) {
    const cmdLines = result.commands.map((cmd) => {
      let s = `**Command:** \`${cmd.command}\``
      if (cmd.output) {
        s += `\n\`\`\`\n${cmd.output}\n\`\`\``
      }
      return s
    })
    sections.push('### Commands Executed\n\n' + cmdLines.join('\n\n'))
  }

  // Errors
  if (result.errors.length > 0) {
    sections.push(
      '### Errors\n\n' + result.errors.map((e) => `- ${e}`).join('\n')
    )
  }

  // Token usage
  if (result.usage) {
    sections.push(
      `**Usage:** ${result.usage.inputTokens} input tokens, ${result.usage.outputTokens} output tokens`
    )
  }

  return sections.join('\n\n---\n\n') || 'No output from Codex.'
}
