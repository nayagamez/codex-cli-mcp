#!/usr/bin/env node
/**
 * Codex MCP Server — entrypoint.
 *
 * Exposes Codex CLI (codex exec) as MCP tools via stdio transport.
 * stdout is reserved for JSON-RPC; all diagnostics go to stderr.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { registerCodexTool } from './tools/codex-tool.js'
import { registerCodexReplyTool } from './tools/codex-reply-tool.js'
import log from './util/logger.js'

async function main(): Promise<void> {
  const server = new McpServer({
    name: 'codex',
    version: '1.0.0',
  })

  registerCodexTool(server)
  registerCodexReplyTool(server)

  const transport = new StdioServerTransport()
  await server.connect(transport)

  log.info('Server started on stdio transport')
}

main().catch((err) => {
  log.error('Fatal error:', err)
  process.exit(1)
})
