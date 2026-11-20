/**
 * Pure, dependency-free core for dsh-plugin-memory-compiler (Session Memory Compiler).
 * Reads only metadata from session events; never prompts, tool bodies or file contents.
 */

const SECRET_RE = /((?:token|key|secret|password|authorization|bearer)[^\s:=]{0,24}[:=]\s*)[^\s&]+/gi
const QUERY_RE = /([?&](?:token|key|secret|password|auth)=)[^&#\s]+/gi
/** Strip credential-looking substrings before anything is printed. */
export function redact(value: unknown): string {
  const text = value instanceof Error ? value.stack || value.message : String(value)
  return text.replace(SECRET_RE, '$1[redacted]').replace(QUERY_RE, '$1[redacted]')
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function analyze(events: readonly unknown[]): any {
  const list = Array.isArray(events) ? events : []
  const entries: any[] = []
  const DECISION = /\b(decided|chose|agreed|will use|go with)\b/i
  const CONSTRAINT = /\b(must not|never|avoid|constraint|requirement|cannot)\b/i
  const OPEN = /\b(todo|open question|unresolved|later|maybe|pending)\b/i
  for (let i = 0; i < list.length; i++) {
    const e = list[i]
    if (!isRecord(e) || !isRecord(e.data)) continue
    const text = typeof e.data.text === 'string' ? e.data.text
      : typeof e.data.content === 'string' ? e.data.content : ''
    if (!text) continue
    const kind = DECISION.test(text) ? 'decision'
      : CONSTRAINT.test(text) ? 'constraint'
      : OPEN.test(text) ? 'open-question' : ''
    if (!kind) continue
    entries.push({ kind, source: 'event#' + i, text: text.slice(0, 160) })
  }
  return {
    sampledEvents: list.length,
    entries,
    total: entries.length,
    decisions: entries.filter(e => e.kind === 'decision').length,
    constraints: entries.filter(e => e.kind === 'constraint').length,
    open: entries.filter(e => e.kind === 'open-question').length,
  }
}

export function formatReport(a: any, opts: { json?: boolean } = {}): string {
  if (opts.json) return JSON.stringify(a, null, 2)
  const head = '[memory-compile] ' + a.total + ' memory entry(s): ' + a.decisions + ' decision, ' +
    a.constraints + ' constraint, ' + a.open + ' open'
  if (a.entries.length === 0) return head + '\n  no memory-worthy signals found in this session'
  const lines = a.entries.slice(0, 12).map(e =>
    '  [' + e.kind.toUpperCase() + '] ' + redact(e.text) + '  ← ' + e.source)
  return [head, ...lines].join('\n') + '\nReview each entry before saving to long-term memory.'
}
