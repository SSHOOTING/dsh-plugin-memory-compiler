# dsh-plugin-memory-compiler

**Compile a session into sourced memory entries — decisions, constraints and open questions — not a chat summary. Reviewable, editable, deletable.**

This is one of 14 read-only observability plugins for the DSH agent lifecycle (theme: **Session Memory Compiler**). It reads only metadata from session events — never prompts, tool bodies, or file contents — and makes no network calls.

## Install

```powershell
dsh plugin --profile web add dsh-plugin-memory-compiler
```

Requires Node `^22.19.0 || >=24` and DSH `>=0.2.0-rc.2 <0.3.0`.

## 30-second demo

1. Use DSH normally for a few turns.
2. In any session, type `/memory-compile`.
3. You get a compact, read-only report; use `/memory-compile --json` for machine-readable output.

```text
[memory-compile] 1 memory entry(s): 1 decision, 0 constraint, 0 open
  [DECISION] I decided to use the free route and will verify the result. Must not exceed budget.  ← event#8
Review each entry before saving to long-term memory.
```

## What it reads

Session event metadata only: event types, tool names, token counts, and route names. Credential-looking values are redacted before display. No file contents or prompts are read, stored, or transmitted.

## License

MIT — SSHOOTING.
