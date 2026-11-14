# Master AI Ecosystem Recommendations & Unification Roadmap

> **Audit Date:** November 14, 2026  
> **Target Workspace:** `C:\OnlineRulerPlus.com`  
> **Objective:** Transition the repository from a conflicting multi-framework pile to a hardened, unified, and high-performance AI development system.

---

## 1. Unified Architecture & Framework Hierarchy

Currently, four AI frameworks compete for control in the same repository. We recommend establishing a strict hierarchical governance model:

```
                           ┌─────────────────────────────────────┐
                           │      HOST PLATFORM / RUNTIME        │
                           │   Google Antigravity / Claude Code  │
                           └─────────────────────────────────────┘
                                              │
                                              ▼
                           ┌─────────────────────────────────────┐
                           │        PRIMARY GOVERNANCE           │
                           │      Everything Claude Code (ECC)   │
                           │  - 71 Active Subagents               │
                           │  - Core Review & TDD Workflows      │
                           │  - Architecture Decision Records    │
                           └─────────────────────────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
     ┌─────────────────────────────────┐             ┌─────────────────────────────────┐
     │        ORCHESTRATION LAYER      │             │        MODAL STYLES (Opt-In)    │
     │            Ruflo V3             │             │   Superpowers & Ponytail Modes   │
     │  - Unified Memory & Swarms      │             │  - Brainstorming / Spec Writing │
     │  - Hardened MCP Integration     │             │  - Lazy Senior Dev / Clean Diffs│
     └─────────────────────────────────┘             └─────────────────────────────────┘
```

1. **Host Runtime:** Antigravity is the primary execution harness in this environment. All configurations must first satisfy Antigravity's discovery and security rules.
2. **Primary Engineering Baseline:** Use ECC (`.agents/rules/` and `.agents/agents/`) as the single source of truth for code quality, review workflows, and git conventions.
3. **Modal Personas (Opt-In):** Treat Ponytail and Superpowers as **explicit, on-demand personas** rather than global unconstrained mandates.
   - Activate Ponytail when you want minimal diffs with zero boilerplate.
   - Activate Superpowers when embarking on complex creative architectural designs requiring formal brainstorming.
4. **Orchestrator:** Keep Ruflo V3 for persistent memory and multi-agent swarm operations, with its MCP server hardened for local execution.

---

## 2. Windows & MCP Hardening Plan

### 2.1 Eliminate Ephemeral npm-Cache Paths
* **Current Problem:** `.agents/plugins/ruflo/mcp_config.json` points to:
  `C:\Users\vipul\AppData\Local\npm-cache\_npx\2ed56890c96f58f7\node_modules\ruflo\bin\ruflo.js`
* **Fix Action:**
  1. Add `ruflo` to `package.json` devDependencies:
     ```bash
     npm install --save-dev ruflo
     ```
  2. Update `.agents/plugins/ruflo/mcp_config.json` to use relative project resolution:
     ```json
     {
       "mcpServers": {
         "claude-flow": {
           "command": "node",
           "args": ["./node_modules/ruflo/bin/ruflo.js", "mcp", "start"],
           "env": {
             "npm_config_update_notifier": "false",
             "CLAUDE_FLOW_MODE": "v3",
             "CLAUDE_FLOW_HOOKS_ENABLED": "true",
             "CLAUDE_FLOW_TOPOLOGY": "hierarchical-mesh",
             "CLAUDE_FLOW_MAX_AGENTS": "15",
             "CLAUDE_FLOW_MEMORY_BACKEND": "hybrid"
           }
         }
       }
     }
     ```
  3. Mirror this clean configuration in `.mcp.json` to eliminate duplicate conflicting commands.

---

## 3. Test Runner & Verification Provisioning

### 3.1 Unbreak `npm test`
* **Current Problem:** `CLAUDE.md` and `.agents/rules/common-testing.md` require running `npm test`, but no test script or framework is installed.
* **Fix Action:**
  1. Install Vitest as a lightweight, fast Astro-compatible test runner:
     ```bash
     npm install --save-dev vitest
     ```
  2. Add the test script to `package.json`:
     ```json
     "scripts": {
       "dev": "astro dev",
       "build": "astro build",
       "preview": "astro preview",
       "astro": "astro",
       "test": "vitest run"
     }
     ```
  3. Provide a starter sanity test in `tests/smoke.test.ts` to ensure `npm test` passes out of the box.

---

## 4. Antigravity Skill Discovery & Curation

### 4.1 Surface High-Value Skills to AGY
Currently, 49 skills in `.superpowers`, `.ponytail`, and `.claude` are invisible to Antigravity.
* **Recommended Selective Promotion:**
  Do not copy all 49 skills into `.agents/skills/`, as this would further exhaust AGY's context budget limit. Instead, selectively promote only the 5 most valuable unique skills into `.agents/skills/`:
  1. `brainstorming` (from Superpowers)
  2. `systematic-debugging` (from Superpowers)
  3. `using-git-worktrees` (from Superpowers)
  4. `ponytail` (from Ponytail)
  5. `pair-programming` (from Claude-Flow)

### 4.2 Deduplicate Ponytail
Delete or archive `.ponytail/.openclaw/` to eliminate the 6 redundant duplicate skill copies.

### 4.3 Prune Skills Context Budget (Agent-Sort Application)
To stop Antigravity from dropping skills due to prompt budget limits:
* Keep core engineering skills in the **Daily** tier (loaded in discovery).
* Move specialized niche framework skills (e.g. `bengali-reviewer`, `swift-reviewer`, `fsharp-reviewer`, `harmonyos-app-resolver`) into a **Library** folder (`.agents/skills-library/`), referencing them on-demand rather than injecting their headers into every single turn.

---

## 5. Instruction & Prompt Harmonization

### 5.1 Create `GEMINI.md` at Repository Root
Provide native instructions for Gemini and Antigravity that define:
* Astro 7 background server management (`astro dev --background`).
* Standardized file ceiling: 500 lines target, 800 lines absolute ceiling.
* Documentation allowance: `/docs` permitted for architectural records and system documentation; root kept clean.
* Test execution standard: Vitest via `npm test`.

### 5.2 Clean Up `CLAUDE.md`
Remove obsolete instructions (such as "NEVER create documentation files") and align test commands with `package.json`.

---

## 6. Implementation Phasing & Action Checklist

### Phase 1: Safe Documentation & Discovery Alignment (Zero-Risk, Read-Only / Additive)
- [x] Create comprehensive audit reports in `/docs/`.
- [ ] Create `GEMINI.md` at root with clear, harmonious project guidelines.
- [ ] Fix broken relative markdown links in `.agents/skills/`.

### Phase 2: Dependency & Configuration Fixes (Requires User Approval)
- [ ] Add `vitest` and `ruflo` to `package.json` devDependencies.
- [ ] Add `"test": "vitest run"` script to `package.json`.
- [ ] Update `.mcp.json` and `.agents/plugins/ruflo/mcp_config.json` to eliminate fragile user-path hardcoding.

### Phase 3: Skill Curation & De-duplication (Requires User Approval)
- [ ] Deduplicate `.ponytail/.openclaw/` copies.
- [ ] Selectively link or migrate top Superpowers/Ponytail skills into `.agents/skills/`.
- [ ] Sort niche language reviewers into `.agents/skills-library/` to optimize context budget.
