# Master AI Integration Issues & Conflicts — OnlineRulerPlus.com

> **Audit Date:** November 14, 2026  
> **Target Workspace:** `C:\OnlineRulerPlus.com`  
> **Status:** 3 Critical (P0), 4 High (P1), 3 Medium (P2), 2 Low (P3)  
> **Assessment:** The repository contains four powerful but mutually antagonistic AI governance frameworks that conflict in philosophy, runtime assumptions, and discovery paths.

---

## 1. Issue Severity Classification

| Severity Level | Definition | Count |
|:---|:---|:---:|
| **P0 — Critical** | System crash, fatal tool failure, non-functional core commands, or severe path breakage. | 3 |
| **P1 — High** | Direct philosophical contradiction between agent instructions, silent failure, or hidden skills. | 4 |
| **P2 — Medium** | Broken internal documentation links, excessive hook latency, or context budget drops. | 3 |
| **P3 — Low** | Missing recommended root configs or ignored environment variables. | 2 |

---

## 2. P0 — Critical Technical Issues

### 2.1 Fragile Ephemeral npm-Cache Path in Ruflo MCP Config
* **Location:** `C:\OnlineRulerPlus.com\.agents\plugins\ruflo\mcp_config.json` (Line 6)
* **Root Cause:** The MCP server command points directly to an ephemeral Windows npm cache path:
  `"C:\\Users\\vipul\\AppData\\Local\\npm-cache\\_npx\\2ed56890c96f58f7\\node_modules\\ruflo\\bin\\ruflo.js"`
* **Impact:**
  - This path is machine-specific and tied to user `vipul`. Any other developer or CI environment will fail instantly.
  - Any standard `npm cache clean` or Windows temporary file cleanup will delete this hash directory, permanently breaking the MCP server.
* **Evidence:** The local `package.json` does not include `ruflo` as a dependency; Ruflo was only run via a transient `npx` execution.

### 2.2 Missing `test` Script in `package.json` vs Strict Test Mandates
* **Location:** `C:\OnlineRulerPlus.com\package.json` vs `CLAUDE.md` (Line 195) & `.agents/rules/common-testing.md`
* **Root Cause:**
  - `CLAUDE.md` instructs: `npm run build && npm test`.
  - `.agents/rules/common-testing.md` mandates: *"Minimum Test Coverage: 80% — Unit Tests, Integration Tests, E2E Tests ALL required"*.
  - `package.json` only contains:
    ```json
    "scripts": {
      "dev": "astro dev",
      "build": "astro build",
      "preview": "astro preview",
      "astro": "astro"
    }
    ```
* **Impact:** Any agent attempting to run tests via `npm test` receives an immediate fatal error: `npm error Missing script: "test"`. No test runner (Vitest, Jest, Playwright) is configured or installed in `package.json`.

### 2.3 Total Invisibility of 49 Skills (46.7%) to Antigravity
* **Location:** `.claude/skills/*` (22 skills), `.superpowers/skills/*` (15 skills), `.ponytail/skills/*` (12 skills)
* **Root Cause:** Antigravity (`antigravity-cli`) discovers workspace skills strictly under the `.agents/skills/<name>/SKILL.md` path hierarchy. Skills residing inside `.claude/`, `.superpowers/`, or `.ponytail/` are ignored by AGY's discovery scanner.
* **Impact:** While 56 ECC skills in `.agents/skills` are discoverable, nearly half of the project's installed AI skills cannot be loaded or used by Antigravity unless explicitly migrated or symlinked.

---

## 3. P1 — High Architectural & Governance Collisions

### 3.1 Methodological Warfare: Ponytail vs Superpowers vs ECC
The four frameworks prescribe completely incompatible developer behaviors:
```
                      ┌──────────────────────────────────────────────┐
                      │             ECOSYSTEM WARFARE                │
                      └──────────────────────────────────────────────┘
                                             │
         ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
         ▼                   ▼                               ▼                   ▼
    [ PONYTAIL ]      [ SUPERPOWERS ]                     [ ECC ]             [ RUFLO ]
   "Write 1 line.     "MUST brainstorm.               "Mandatory 80%     "Spawn 15-agent
   No abstractions.   Write design doc.               test coverage.     mesh swarm,
   Delete code.       Write plan doc.                 PRDs, ADRs,        AgentDB HNSW
   YAGNI first."      Strict red/green TDD."          6 review agents."  vector memory."
```

* **Ponytail:** *"He says nothing. He writes one line. It works. The best code is the code never written... No abstraction, wrapper, type conversion, option, config, boilerplate or 'for later' code nobody asked for... Deletion beats addition."*
* **Superpowers:** *"IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT. You MUST use this before any creative work... Lay out the approaches... Write the design doc... Get approval... Invoke writing-plans..."*
* **ECC:** *"Minimum Test Coverage: 80%. Test Types (ALL required): Unit Tests, Integration Tests, E2E Tests. MANDATORY review triggers: after writing or modifying code... STOP and use security-reviewer agent."*
* **Impact on Agents:** An agent exposed to all instructions receives contradictory directives: should it produce a 1-line minimalist fix with zero documentation (Ponytail), or stop and write design documents and plans (Superpowers), or scaffold full unit/integration/E2E test suites with ADRs (ECC)?

### 3.2 Anti-Documentation Rule in `CLAUDE.md` vs Framework Output Requirements
* **Location:** `C:\OnlineRulerPlus.com\CLAUDE.md` (Lines 6–7)
* **Contradiction:**
  - `CLAUDE.md` commands:
    - *"NEVER create files unless absolutely necessary — prefer editing existing files"*
    - *"NEVER create documentation files unless explicitly requested"*
  - Meanwhile, ECC's `architecture-decision-records` skill instructs agents to generate `docs/adr/000X-*.md`, `story-lifecycle` instructs agents to create epics and stories in `docs/stories/`, and Superpowers requires design docs in `docs/plans/`.

### 3.3 File Length Ceiling Collision
* **Location:** `CLAUDE.md` (Line 12) vs `.agents/rules/common-coding-style.md`
* **Contradiction:**
  - `CLAUDE.md` states: *"Keep files under 500 lines"* (hard ceiling).
  - `common-coding-style.md` states: *"200-400 lines typical, with 800 lines as a soft maintainability ceiling for source files"*.
* **Impact:** Ambiguity on whether 501–800 line source files are violations or acceptable exceptions.

### 3.4 Identical Duplicate Skills in Ponytail
* **Location:** `.ponytail/skills/` vs `.ponytail/.openclaw/skills/`
* **Details:** 6 skills (`ponytail`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`, `ponytail-review`) exist as bit-for-bit duplicate copies across two directories, bloating the workspace.

---

## 4. P2 — Medium Technical Issues

### 4.1 Broken Internal Path References in Skills
6 skills contain references to non-existent files or dummy placeholders:
1. `architecture-decision-records`: Links to non-existent examples `0001-use-nextjs.md`, `0002-postgres-over-mongo.md`.
2. `growth-log`: Links to dummy placeholder `../path/to/related-entry.md`.
3. `plan-canvas`: Links to missing `../../docs/design/plan-canvas.md`.
4. `github-code-review`: Contains empty markdown placeholders `[text](link)`.
5. `skill-builder`: References missing subdirectories `docs/ADVANCED.md`, `resources/examples/`.
6. `verification-quality`: References non-existent `../../../verification/README.md`.

### 4.2 Excessive Claude-Code Hook Overhead
* **Location:** `.claude/settings.json` (Lines 1–110) & `.claude/helpers/hook-handler.cjs` (1,359 lines)
* **Details:** `.claude/settings.json` defines 8 hook events (`PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `SessionStart`, `SessionEnd`, `Stop`, `PreCompact`, `SubagentStop`) running complex inline node scripts.
* **Impact:** In non-Claude harnesses, these hooks are either ignored or, if invoked in shell, introduce 500ms–2000ms process spawn latency on Windows on every tool call.

### 4.3 Skill Context Truncation in Antigravity
* **Issue:** Because there are so many discovered skills, Antigravity's context budget limit frequently drops skills from the system prompt during active sessions:
  `"The following items were excluded due to context budget limits: intent-driven-development, living-docs-governance, loop-design-check..."`

---

## 5. P3 — Low / Cosmetic Issues

1. **Missing `GEMINI.md`:** While `AGENTS.md` and `CLAUDE.md` exist at root, there is no root `GEMINI.md` to define project-level rules for Gemini / Antigravity agents.
2. **Vestigial Claude Variables:** `.claude/settings.json` exports variables such as `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: "1"` which are inert outside Claude Code.
