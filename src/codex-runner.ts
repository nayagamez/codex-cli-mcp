/**
 * Core Codex CLI subprocess execution and JSONL parsing.
 *
 * Runs `codex exec` as a child process, buffers stdout line-by-line,
 * parses JSONL events, and aggregates them into a CodexResult.
 */

import { spawn } from 'child_process'
import { buildShellCommand } from './util/shell.js'
import log from './util/logger.js'
import type {
  CodexExecOptions,
  CodexResumeOptions,
  CodexResult,
  CommandExecution,
} from './types.js'

const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000 // 10 minutes

function getTimeoutMs(): number {
  const env = process.env.CODEX_TIMEOUT_MS
  if (env) {
    const parsed = parseInt(env, 10)
    if (!isNaN(parsed) && parsed > 0) return parsed
  }
  return DEFAULT_TIMEOUT_MS
}

function getCodexCommand(): string {
  return process.env.CODEX_CLI_PATH || 'codex'
}

function buildSpawnEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env }
  // Prevent Codex from detecting it's running inside Claude Code
  delete env.CLAUDECODE
  return env
}

/**
 * Build CLI args for a new `codex exec` session.
 * The prompt is passed via stdin (using `-` as the positional arg)
 * to avoid shell length limits and special character issues.
 */
function buildExecArgs(options: CodexExecOptions): string[] {
  const args = ['exec', '--json', '--full-auto', '--skip-git-repo-check']

  if (options.model) {
    args.push('-m', options.model)
  }
  if (options.sandbox) {
    args.push('-s', options.sandbox)
  }
  if (options.cwd) {
    args.push('-C', options.cwd)
  }
  if (options.profile) {
    args.push('-p', options.profile)
  }
  if (options.config) {
    for (const [key, value] of Object.entries(options.config)) {
      args.push('-c', `${key}=${value}`)
    }
  }

  // Use `-` to read prompt from stdin
  args.push('-')

  return args
}

/**
 * Build CLI args for resuming a session with `codex exec resume`.
 * Note: resume does not support --sandbox, --cd, --profile flags.
 */
function buildResumeArgs(options: CodexResumeOptions): string[] {
  const args = ['exec', 'resume', '--json', '--full-auto', '--skip-git-repo-check']

  if (options.model) {
    args.push('-m', options.model)
  }
  if (options.config) {
    for (const [key, value] of Object.entries(options.config)) {
      args.push('-c', `${key}=${value}`)
    }
  }

  args.push(options.threadId)

  // Use `-` to read prompt from stdin
  args.push('-')

  return args
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonObject = Record<string, any>

/**
 * Parse a single JSONL line into a JSON object with a `type` field, or null.
 */
function parseEvent(line: string): JsonObject | null {
  try {
    const parsed = JSON.parse(line)
    if (parsed && typeof parsed.type === 'string') {
      return parsed as JsonObject
    }
    return null
  } catch {
    return null
  }
}

/**
 * Extract text content from an item.completed event's item.content.
 */
function extractTextFromContent(
  content: Array<{ type: string; text?: string }> | string | undefined
): string {
  if (!content) return ''
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .filter((c) => c.type === 'text' || c.type === 'output_text')
      .map((c) => c.text || '')
      .join('')
  }
  return ''
}

/**
 * Run a Codex CLI subprocess and collect the result.
 */
function runCodex(command: string, args: string[], stdinContent: string): Promise<CodexResult> {
  return new Promise((resolve, reject) => {
    const timeoutMs = getTimeoutMs()
    const shellCmd = buildShellCommand(command, args)

    log.debug('Spawning:', shellCmd)

    const proc = spawn(shellCmd, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      env: buildSpawnEnv(),
    })

    const result: CodexResult = {
      threadId: null,
      messages: [],
      commands: [],
      errors: [],
      usage: null,
    }

    let lineBuffer = ''
    let settled = false

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true
        proc.kill('SIGTERM')
        result.errors.push(`Timeout: process killed after ${timeoutMs}ms`)
        resolve(result)
      }
    }, timeoutMs)

    function processLine(line: string): void {
      const trimmed = line.trim()
      if (!trimmed) return

      const event = parseEvent(trimmed)
      if (!event) {
        log.debug('Unparseable line:', trimmed)
        return
      }

      log.debug('Event:', event.type)

      switch (event.type) {
        case 'thread.started':
          result.threadId = event.thread_id
          break

        case 'item.completed': {
          const item = event.item
          if (!item) break

          if (item.type === 'command_execution' || item.type === 'function_call_output') {
            // Command execution result
            const cmd: CommandExecution = {
              command: item.name || item.call_id || 'unknown',
              output: item.output || '',
            }
            // Try to extract command from arguments
            if (item.arguments) {
              try {
                const parsed = JSON.parse(item.arguments)
                if (parsed.command) {
                  cmd.command = Array.isArray(parsed.command)
                    ? parsed.command.join(' ')
                    : String(parsed.command)
                }
              } catch {
                // arguments is not JSON, use as-is
              }
            }
            result.commands.push(cmd)
          } else {
            // Agent message or reasoning — text may be in item.content or item.text
            const text = extractTextFromContent(item.content) || (typeof item.text === 'string' ? item.text : '')
            if (text) {
              result.messages.push(text)
            }
          }
          break
        }

        case 'turn.completed':
          if (event.usage) {
            result.usage = {
              inputTokens: event.usage.input_tokens ?? 0,
              outputTokens: event.usage.output_tokens ?? 0,
            }
          }
          break

        case 'turn.failed':
          if (event.error) {
            result.errors.push(event.error)
          }
          break

        case 'error':
          result.errors.push(event.error || event.message || 'Unknown error')
          break
      }
    }

    proc.stdout?.on('data', (data: Buffer) => {
      lineBuffer += data.toString()
      const lines = lineBuffer.split('\n')
      lineBuffer = lines.pop() || ''
      for (const line of lines) {
        processLine(line)
      }
    })

    proc.stderr?.on('data', (data: Buffer) => {
      log.debug('[codex stderr]', data.toString())
    })

    proc.on('close', (code) => {
      clearTimeout(timer)

      // Process remaining buffer
      if (lineBuffer.trim()) {
        processLine(lineBuffer)
      }

      if (!settled) {
        settled = true
        if (code !== 0 && code !== null) {
          result.errors.push(`Process exited with code ${code}`)
        }
        resolve(result)
      }
    })

    proc.on('error', (err) => {
      clearTimeout(timer)
      if (!settled) {
        settled = true
        reject(new Error(`Failed to spawn codex: ${err.message}`))
      }
    })

    // Write prompt to stdin and close
    if (proc.stdin) {
      proc.stdin.write(stdinContent)
      proc.stdin.end()
    }
  })
}

/**
 * Execute a new Codex session.
 */
export async function execCodex(options: CodexExecOptions): Promise<CodexResult> {
  const command = getCodexCommand()
  const args = buildExecArgs(options)
  log.info('Starting new Codex session')
  return runCodex(command, args, options.prompt)
}

/**
 * Resume an existing Codex session.
 */
export async function resumeCodex(options: CodexResumeOptions): Promise<CodexResult> {
  const command = getCodexCommand()
  const args = buildResumeArgs(options)
  log.info(`Resuming Codex session: ${options.threadId}`)
  return runCodex(command, args, options.prompt)
}
