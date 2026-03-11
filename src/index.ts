#!/usr/bin/env node
/**
 * Codex MCP Server — entrypoint.
 *
 * Exposes Codex CLI (codex exec) as MCP tools via stdio transport.
 * stdout is reserved for JSON-RPC; all diagnostics go to stderr.
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { registerCodexTool } from './tools/codex-tool.js'
import { registerCodexReplyTool } from './tools/codex-reply-tool.js'
import log from './util/logger.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf-8'))

async function main(): Promise<void> {
  const server = new McpServer({
    name: 'codex',
    version: pkg.version,
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
