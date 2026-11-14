# Ruflo V3 Multi-Agent Coordination Rules

## Core Principles
- Ruflo is the coordination ledger and policy decision point. Antigravity (AGY) is the executor.
- Named agents coordinate via direct delegation or the native swarm message board.
- Never allow two writers in one worktree; give each writing agent an isolated worktree or explicit non-overlapping file scope.
- Read-only research and auditing may run concurrently.

## Memory & Coordination Workflow
1. Recall memory and constraints using `ruflo memory retrieve` or `memory search`.
2. Inspect source, runtime, dependencies, and health.
3. Route to the smallest capable topology and specialist agents (hierarchical or mesh).
4. Execute via Antigravity specialist subagents (`invoke_subagent`) or parallel swarm workers (`swarm`).
5. After completing tasks, record outcomes to memory (`ruflo memory store --no-embedding`).

## Swarm Routing
- **Bug Fix**: researcher, coder, tester (hierarchical)
- **Feature**: architect, coder, tester, reviewer (hierarchical)
- **Refactor**: architect, coder, reviewer (hierarchical)
- **Performance**: performance-optimizer, coder
- **Security / Audit**: security-reviewer, auditor
