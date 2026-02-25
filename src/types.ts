/**
 * Types for Codex CLI JSONL events and aggregated results.
 *
 * Codex CLI `--json` output emits newline-delimited JSON objects.
 * Each object has a `type` field indicating the event kind.
 */

// ---------------------------------------------------------------------------
// Codex JSONL event types (from `codex exec --json` stdout)
// ---------------------------------------------------------------------------

export interface ThreadStartedEvent {
  type: 'thread.started'
  thread_id: string
}

export interface ItemCompletedEvent {
  type: 'item.completed'
  item: {
    type: string // "agent_message", "reasoning", "command_execution", etc.
    content?: Array<{
      type: string // "text", "output_text", "refusal", etc.
      text?: string
    }> | string
    call_id?: string
    name?: string        // for command_execution: command name
    arguments?: string   // for command_execution: JSON args
    output?: string      // for command_execution: output text
    status?: string      // e.g. "completed"
  }
}

export interface TurnCompletedEvent {
  type: 'turn.completed'
  usage?: {
    input_tokens?: number
    output_tokens?: number
    total_tokens?: number
  }
}

export interface TurnFailedEvent {
  type: 'turn.failed'
  error?: string
}

export interface ErrorEvent {
  type: 'error'
  error?: string
  message?: string
}

export type CodexEvent =
  | ThreadStartedEvent
  | ItemCompletedEvent
  | TurnCompletedEvent
  | TurnFailedEvent
  | ErrorEvent

// ---------------------------------------------------------------------------
// Aggregated result from a Codex CLI run
// ---------------------------------------------------------------------------

export interface CommandExecution {
  command: string
  output: string
}

export interface UsageInfo {
  inputTokens: number
  outputTokens: number
}

export interface CodexResult {
  threadId: string | null
  messages: string[]
  commands: CommandExecution[]
  errors: string[]
  usage: UsageInfo | null
}

// ---------------------------------------------------------------------------
// Options for running Codex CLI
// ---------------------------------------------------------------------------

export interface CodexExecOptions {
  prompt: string
  model?: string
  sandbox?: 'read-only' | 'workspace-write' | 'danger-full-access'
  cwd?: string
  profile?: string
  config?: Record<string, string>
}

export interface CodexResumeOptions {
  prompt: string
  threadId: string
  model?: string
  config?: Record<string, string>
}
