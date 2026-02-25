/**
 * Platform-aware shell argument quoting and command building.
 *
 * Pattern reused from neo-agent-v1/src/main/providers/base-cli.ts.
 * Using `shell: true` with a pre-joined command string avoids
 * Node's DEP0190 deprecation warning.
 */

/**
 * Quote a single shell argument for the current platform.
 * - Windows: wraps in double quotes, escaping internal `"`
 * - POSIX:  wraps in single quotes, escaping internal `'`
 */
export function shellQuoteArg(arg: string): string {
  if (process.platform === 'win32') {
    return `"${arg.replace(/"/g, '\\"')}"`
  }
  return `'${arg.replace(/'/g, "'\\''")}'`
}

/**
 * Build a single shell command string from a command and its arguments.
 * Each arg is quoted for the current platform.
 */
export function buildShellCommand(command: string, args: string[]): string {
  return [command, ...args.map(shellQuoteArg)].join(' ')
}
