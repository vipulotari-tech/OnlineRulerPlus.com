# Master AI Skills Inventory — OnlineRulerPlus.com

> **Audit Date:** November 14, 2026  
> **Target Workspace:** `C:\OnlineRulerPlus.com`  
> **Total Discovered Skills:** 105  
> **Discoverable by Antigravity (AGY):** 56 (53.3%)  
> **Hidden/Undiscovered by AGY:** 49 (46.7%)  
> **Duplicate Skill Names:** 6 (12 duplicate files)

## 1. Executive Summary & Framework Distribution

| Framework / Origin | Skill Location | Count | AGY Native Discoverability | Primary Role |
|:---|:---|:---:|:---:|:---|
| **Everything Claude Code (ECC)** | `.agents/skills/*` | 56 | ✅ Yes (100%) | Engineering workflows, review, TDD, ADR, governance |
| **Claude-Flow / Ruflo** | `.claude/skills/*` | 22 | ❌ No (0%) | AgentDB, HNSW memory, WASM, Swarm, LoRA learning |
| **Superpowers (obra)** | `.superpowers/skills/*` | 15 | ❌ No (0%) | TDD, Brainstorming, Systematic Debugging, Worktrees |
| **Ponytail** | `.ponytail/skills/*` & `.ponytail/.openclaw/skills/*` | 12 | ❌ No (0%) | Lazy Senior Dev, minimalist diffs, YAGNI |
| **Total** | | **105** | **56 / 105 (53.3%)** | |

## 2. Antigravity (AGY) Discoverability & Compatibility Rules

Antigravity (`antigravity-cli`) discovers workspace skills by inspecting the `.agents/skills/<skill-name>/SKILL.md` path hierarchy. Skills placed inside `.claude/skills`, `.superpowers/skills`, or `.ponytail/skills` are **not in the discovery path** and remain invisible to the model during standard turns unless symlinked or mounted as plugins.

Furthermore, AGY injects discovered skill headers into context via **Progressive Disclosure**. If the total token footprint of skill descriptions exceeds AGY's context allocation, skills are silently excluded.

## 3. Comprehensive Master Catalog (105 Skills)

| # | Skill Name | Origin | Path | AGY Discoverable | Dependencies | Status / Compatibility Notes |
|:---|:---|:---|:---|:---:|:---|:---|
| 1 | `agent-introspection-debugging` | Everything Claude Code (ECC) | `.agents/skills/agent-introspection-debugging/SKILL.md` | ✅ Yes | git | Fully compatible |
| 2 | `agent-self-evaluation` | Everything Claude Code (ECC) | `.agents/skills/agent-self-evaluation/SKILL.md` | ✅ Yes | python | Fully compatible |
| 3 | `agent-sort` | Everything Claude Code (ECC) | `.agents/skills/agent-sort/SKILL.md` | ✅ Yes | python, cargo | Fully compatible |
| 4 | `ai-regression-testing` | Everything Claude Code (ECC) | `.agents/skills/ai-regression-testing/SKILL.md` | ✅ Yes | npm, node | Fully compatible |
| 5 | `architecture-decision-records` | Everything Claude Code (ECC) | `.agents/skills/architecture-decision-records/SKILL.md` | ✅ Yes | None | Broken links: 0001-use-nextjs.md, 0002-postgres-over-mongo.md |
| 6 | `brownfield-retrospective` | Everything Claude Code (ECC) | `.agents/skills/brownfield-retrospective/SKILL.md` | ✅ Yes | git, python | Fully compatible |
| 7 | `browser-qa` | Everything Claude Code (ECC) | `.agents/skills/browser-qa/SKILL.md` | ✅ Yes | playwright | Fully compatible |
| 8 | `ck` | Everything Claude Code (ECC) | `.agents/skills/ck/SKILL.md` | ✅ Yes | git, node | Fully compatible |
| 9 | `click-path-audit` | Everything Claude Code (ECC) | `.agents/skills/click-path-audit/SKILL.md` | ✅ Yes | None | Fully compatible |
| 10 | `code-tour` | Everything Claude Code (ECC) | `.agents/skills/code-tour/SKILL.md` | ✅ Yes | git | Fully compatible |
| 11 | `codebase-onboarding` | Everything Claude Code (ECC) | `.agents/skills/codebase-onboarding/SKILL.md` | ✅ Yes | git, npx, npm, node, docker, cargo, playwright | Fully compatible |
| 12 | `codehealth-mcp` | Everything Claude Code (ECC) | `.agents/skills/codehealth-mcp/SKILL.md` | ✅ Yes | git, npx | Fully compatible |
| 13 | `config-gc` | Everything Claude Code (ECC) | `.agents/skills/config-gc/SKILL.md` | ✅ Yes | git, jq | Fully compatible |
| 14 | `configure-ecc` | Everything Claude Code (ECC) | `.agents/skills/configure-ecc/SKILL.md` | ✅ Yes | npx, npm, node | Fully compatible |
| 15 | `context-budget` | Everything Claude Code (ECC) | `.agents/skills/context-budget/SKILL.md` | ✅ Yes | None | Fully compatible |
| 16 | `continuous-learning` | Everything Claude Code (ECC) | `.agents/skills/continuous-learning/SKILL.md` | ✅ Yes | git | Fully compatible |
| 17 | `continuous-learning-v2` | Everything Claude Code (ECC) | `.agents/skills/continuous-learning-v2/SKILL.md` | ✅ Yes | git, python | Claude-specific hooks |
| 18 | `conventional-commit-review` | Everything Claude Code (ECC) | `.agents/skills/conventional-commit-review/SKILL.md` | ✅ Yes | git | Fully compatible |
| 19 | `council` | Everything Claude Code (ECC) | `.agents/skills/council/SKILL.md` | ✅ Yes | None | Fully compatible |
| 20 | `council-multi-model` | Everything Claude Code (ECC) | `.agents/skills/council-multi-model/SKILL.md` | ✅ Yes | node | Fully compatible |
| 21 | `deepseek-harness-setup` | Everything Claude Code (ECC) | `.agents/skills/deepseek-harness-setup/SKILL.md` | ✅ Yes | git, node | Fully compatible |
| 22 | `delivery-gate` | Everything Claude Code (ECC) | `.agents/skills/delivery-gate/SKILL.md` | ✅ Yes | python | Fully compatible |
| 23 | `dev-team` | Everything Claude Code (ECC) | `.agents/skills/dev-team/SKILL.md` | ✅ Yes | None | Fully compatible |
| 24 | `e2e-testing` | Everything Claude Code (ECC) | `.agents/skills/e2e-testing/SKILL.md` | ✅ Yes | npx, npm, node, playwright | Fully compatible |
| 25 | `ecc-guide` | Everything Claude Code (ECC) | `.agents/skills/ecc-guide/SKILL.md` | ✅ Yes | git, npm, node | Fully compatible |
| 26 | `ecc-recipes` | Everything Claude Code (ECC) | `.agents/skills/ecc-recipes/SKILL.md` | ✅ Yes | None | Fully compatible |
| 27 | `error-handling` | Everything Claude Code (ECC) | `.agents/skills/error-handling/SKILL.md` | ✅ Yes | python | Fully compatible |
| 28 | `eval-harness` | Everything Claude Code (ECC) | `.agents/skills/eval-harness/SKILL.md` | ✅ Yes | npm, node | Fully compatible |
| 29 | `git-workflow` | Everything Claude Code (ECC) | `.agents/skills/git-workflow/SKILL.md` | ✅ Yes | git, npx, npm | Fully compatible |
| 30 | `growth-log` | Everything Claude Code (ECC) | `.agents/skills/growth-log/SKILL.md` | ✅ Yes | git | Broken links: ../path/to/related-entry.md |
| 31 | `hookify-rules` | Everything Claude Code (ECC) | `.agents/skills/hookify-rules/SKILL.md` | ✅ Yes | git, node, python | Fully compatible |
| 32 | `inherit-legacy-style` | Everything Claude Code (ECC) | `.agents/skills/inherit-legacy-style/SKILL.md` | ✅ Yes | git | Fully compatible |
| 33 | `intent-driven-development` | Everything Claude Code (ECC) | `.agents/skills/intent-driven-development/SKILL.md` | ✅ Yes | None | Fully compatible |
| 34 | `iterative-retrieval` | Everything Claude Code (ECC) | `.agents/skills/iterative-retrieval/SKILL.md` | ✅ Yes | None | Fully compatible |
| 35 | `living-docs-governance` | Everything Claude Code (ECC) | `.agents/skills/living-docs-governance/SKILL.md` | ✅ Yes | git | Fully compatible |
| 36 | `loop-design-check` | Everything Claude Code (ECC) | `.agents/skills/loop-design-check/SKILL.md` | ✅ Yes | None | Fully compatible |
| 37 | `plan-canvas` | Everything Claude Code (ECC) | `.agents/skills/plan-canvas/SKILL.md` | ✅ Yes | node | Broken links: ../../docs/design/plan-canvas.md |
| 38 | `plankton-code-quality` | Everything Claude Code (ECC) | `.agents/skills/plankton-code-quality/SKILL.md` | ✅ Yes | git, npm, pnpm, python | Fully compatible |
| 39 | `product-lens` | Everything Claude Code (ECC) | `.agents/skills/product-lens/SKILL.md` | ✅ Yes | None | Fully compatible |
| 40 | `production-audit` | Everything Claude Code (ECC) | `.agents/skills/production-audit/SKILL.md` | ✅ Yes | git, npx, docker | Fully compatible |
| 41 | `repo-scan` | Everything Claude Code (ECC) | `.agents/skills/repo-scan/SKILL.md` | ✅ Yes | git | Fully compatible |
| 42 | `ruflo` | Everything Claude Code (ECC) | `.agents/skills/ruflo/SKILL.md` | ✅ Yes | git, npx, npm, node | Fully compatible |
| 43 | `rules-distill` | Everything Claude Code (ECC) | `.agents/skills/rules-distill/SKILL.md` | ✅ Yes | None | Fully compatible |
| 44 | `santa-method` | Everything Claude Code (ECC) | `.agents/skills/santa-method/SKILL.md` | ✅ Yes | python | Fully compatible |
| 45 | `skill-comply` | Everything Claude Code (ECC) | `.agents/skills/skill-comply/SKILL.md` | ✅ Yes | git, python | Fully compatible |
| 46 | `skill-host-compat` | Everything Claude Code (ECC) | `.agents/skills/skill-host-compat/SKILL.md` | ✅ Yes | npx, npm, node | Claude-specific hooks |
| 47 | `skill-scout` | Everything Claude Code (ECC) | `.agents/skills/skill-scout/SKILL.md` | ✅ Yes | gh | Fully compatible |
| 48 | `skill-stocktake` | Everything Claude Code (ECC) | `.agents/skills/skill-stocktake/SKILL.md` | ✅ Yes | node, python, jq | Fully compatible |
| 49 | `story-lifecycle` | Everything Claude Code (ECC) | `.agents/skills/story-lifecycle/SKILL.md` | ✅ Yes | git, node, python | Fully compatible |
| 50 | `strategic-compact` | Everything Claude Code (ECC) | `.agents/skills/strategic-compact/SKILL.md` | ✅ Yes | git, node | Fully compatible |
| 51 | `tailwind-4-docs` | Everything Claude Code (ECC) | `.agents/skills/tailwind-4-docs/SKILL.md` | ✅ Yes | git, python | Fully compatible |
| 52 | `tdd-workflow` | Everything Claude Code (ECC) | `.agents/skills/tdd-workflow/SKILL.md` | ✅ Yes | git, npx, npm, pnpm, node, playwright, curl | Fully compatible |
| 53 | `unified-memory` | Everything Claude Code (ECC) | `.agents/skills/unified-memory/SKILL.md` | ✅ Yes | git, npm, node | Fully compatible |
| 54 | `verification-loop` | Everything Claude Code (ECC) | `.agents/skills/verification-loop/SKILL.md` | ✅ Yes | git, npx, npm, pnpm, python | Fully compatible |
| 55 | `web-design-guidelines` | Everything Claude Code (ECC) | `.agents/skills/web-design-guidelines/SKILL.md` | ✅ Yes | None | Fully compatible |
| 56 | `windows-desktop-e2e` | Everything Claude Code (ECC) | `.agents/skills/windows-desktop-e2e/SKILL.md` | ✅ Yes | node, python, playwright | Fully compatible |
| 57 | `agentdb-advanced` | Claude-Flow / Ruflo | `.claude/skills/agentdb-advanced/SKILL.md` | ❌ No | npx, node | Located in .claude, invisible to AGY |
| 58 | `agentdb-learning` | Claude-Flow / Ruflo | `.claude/skills/agentdb-learning/SKILL.md` | ❌ No | npx, node | Located in .claude, invisible to AGY |
| 59 | `agentdb-memory-patterns` | Claude-Flow / Ruflo | `.claude/skills/agentdb-memory-patterns/SKILL.md` | ❌ No | npx, node | Located in .claude, invisible to AGY |
| 60 | `agentdb-optimization` | Claude-Flow / Ruflo | `.claude/skills/agentdb-optimization/SKILL.md` | ❌ No | npx, node | Located in .claude, invisible to AGY |
| 61 | `agentdb-vector-search` | Claude-Flow / Ruflo | `.claude/skills/agentdb-vector-search/SKILL.md` | ❌ No | npx, node | Located in .claude, invisible to AGY |
| 62 | `browser` | Claude-Flow / Ruflo | `.claude/skills/browser/SKILL.md` | ❌ No | npx | Located in .claude, invisible to AGY |
| 63 | `fast-code-edits` | Claude-Flow / Ruflo | `.claude/skills/fast-code-edits/SKILL.md` | ❌ No | npx | Claude-specific hooks; Located in .claude, invisible to AGY |
| 64 | `github-code-review` | Claude-Flow / Ruflo | `.claude/skills/github-code-review/SKILL.md` | ❌ No | gh, npx, npm, jq | Broken links: link, link; Located in .claude, invisible to AGY |
| 65 | `github-project-management` | Claude-Flow / Ruflo | `.claude/skills/github-project-management/SKILL.md` | ❌ No | gh, npx, node, curl, jq | Located in .claude, invisible to AGY |
| 66 | `graph-mincut` | Claude-Flow / Ruflo | `.claude/skills/graph-mincut/SKILL.md` | ❌ No | npx, npm, node | Located in .claude, invisible to AGY |
| 67 | `hooks-automation` | Claude-Flow / Ruflo | `.claude/skills/hooks-automation/SKILL.md` | ❌ No | git, npx, npm, docker, jq | Located in .claude, invisible to AGY |
| 68 | `injection-defense` | Claude-Flow / Ruflo | `.claude/skills/injection-defense/SKILL.md` | ❌ No | npx | Located in .claude, invisible to AGY |
| 69 | `lora-learning` | Claude-Flow / Ruflo | `.claude/skills/lora-learning/SKILL.md` | ❌ No | npx | Located in .claude, invisible to AGY |
| 70 | `pair-programming` | Claude-Flow / Ruflo | `.claude/skills/pair-programming/SKILL.md` | ❌ No | git, npm, node | Located in .claude, invisible to AGY |
| 71 | `reasoningbank-agentdb` | Claude-Flow / Ruflo | `.claude/skills/reasoningbank-agentdb/SKILL.md` | ❌ No | npx, node | Located in .claude, invisible to AGY |
| 72 | `reasoningbank-intelligence` | Claude-Flow / Ruflo | `.claude/skills/reasoningbank-intelligence/SKILL.md` | ❌ No | node | Located in .claude, invisible to AGY |
| 73 | `skill-builder` | Claude-Flow / Ruflo | `.claude/skills/skill-builder/SKILL.md` | ❌ No | git, npm, node | Broken links: docs/ADVANCED.md, docs/API_REFERENCE.md; Located in .claude, invisible to AGY |
| 74 | `sublinear-solver` | Claude-Flow / Ruflo | `.claude/skills/sublinear-solver/SKILL.md` | ❌ No | npx, npm | Located in .claude, invisible to AGY |
| 75 | `swarm-advanced` | Claude-Flow / Ruflo | `.claude/skills/swarm-advanced/SKILL.md` | ❌ No | npx, npm, node | Located in .claude, invisible to AGY |
| 76 | `swarm-orchestration` | Claude-Flow / Ruflo | `.claude/skills/swarm-orchestration/SKILL.md` | ❌ No | npx, node | Located in .claude, invisible to AGY |
| 77 | `vector-quantization` | Claude-Flow / Ruflo | `.claude/skills/vector-quantization/SKILL.md` | ❌ No | npx, npm | Located in .claude, invisible to AGY |
| 78 | `verification-quality` | Claude-Flow / Ruflo | `.claude/skills/verification-quality/SKILL.md` | ❌ No | git, npx, npm, node, curl, jq | Broken links: ../../../verification/README.md; Located in .claude, invisible to AGY |
| 79 | `ponytail` | Ponytail | `.ponytail/.openclaw/skills/ponytail/SKILL.md` | ❌ No | None | Located in .ponytail, invisible to AGY |
| 80 | `ponytail` | Ponytail | `.ponytail/skills/ponytail/SKILL.md` | ❌ No | None | Located in .ponytail, invisible to AGY |
| 81 | `ponytail-audit` | Ponytail | `.ponytail/.openclaw/skills/ponytail-audit/SKILL.md` | ❌ No | None | Located in .ponytail, invisible to AGY |
| 82 | `ponytail-audit` | Ponytail | `.ponytail/skills/ponytail-audit/SKILL.md` | ❌ No | None | Located in .ponytail, invisible to AGY |
| 83 | `ponytail-debt` | Ponytail | `.ponytail/.openclaw/skills/ponytail-debt/SKILL.md` | ❌ No | git | Located in .ponytail, invisible to AGY |
| 84 | `ponytail-debt` | Ponytail | `.ponytail/skills/ponytail-debt/SKILL.md` | ❌ No | git | Located in .ponytail, invisible to AGY |
| 85 | `ponytail-gain` | Ponytail | `.ponytail/.openclaw/skills/ponytail-gain/SKILL.md` | ❌ No | None | Located in .ponytail, invisible to AGY |
| 86 | `ponytail-gain` | Ponytail | `.ponytail/skills/ponytail-gain/SKILL.md` | ❌ No | None | Located in .ponytail, invisible to AGY |
| 87 | `ponytail-help` | Ponytail | `.ponytail/.openclaw/skills/ponytail-help/SKILL.md` | ❌ No | npm | Located in .ponytail, invisible to AGY |
| 88 | `ponytail-help` | Ponytail | `.ponytail/skills/ponytail-help/SKILL.md` | ❌ No | npm | Located in .ponytail, invisible to AGY |
| 89 | `ponytail-review` | Ponytail | `.ponytail/.openclaw/skills/ponytail-review/SKILL.md` | ❌ No | None | Located in .ponytail, invisible to AGY |
| 90 | `ponytail-review` | Ponytail | `.ponytail/skills/ponytail-review/SKILL.md` | ❌ No | None | Located in .ponytail, invisible to AGY |
| 91 | `brainstorming` | Superpowers (obra/superpowers) | `.superpowers/skills/brainstorming/SKILL.md` | ❌ No | None | Located in .superpowers, invisible to AGY |
| 92 | `diagnosing-superpowers` | Superpowers (obra/superpowers) | `.superpowers/skills/diagnosing-superpowers/SKILL.md` | ❌ No | gh | Located in .superpowers, invisible to AGY |
| 93 | `dispatching-parallel-agents` | Superpowers (obra/superpowers) | `.superpowers/skills/dispatching-parallel-agents/SKILL.md` | ❌ No | None | Located in .superpowers, invisible to AGY |
| 94 | `executing-plans` | Superpowers (obra/superpowers) | `.superpowers/skills/executing-plans/SKILL.md` | ❌ No | git | Located in .superpowers, invisible to AGY |
| 95 | `finishing-a-development-branch` | Superpowers (obra/superpowers) | `.superpowers/skills/finishing-a-development-branch/SKILL.md` | ❌ No | git, npm, cargo | Located in .superpowers, invisible to AGY |
| 96 | `receiving-code-review` | Superpowers (obra/superpowers) | `.superpowers/skills/receiving-code-review/SKILL.md` | ❌ No | gh | Located in .superpowers, invisible to AGY |
| 97 | `requesting-code-review` | Superpowers (obra/superpowers) | `.superpowers/skills/requesting-code-review/SKILL.md` | ❌ No | git | Located in .superpowers, invisible to AGY |
| 98 | `subagent-driven-development` | Superpowers (obra/superpowers) | `.superpowers/skills/subagent-driven-development/SKILL.md` | ❌ No | git | Located in .superpowers, invisible to AGY |
| 99 | `systematic-debugging` | Superpowers (obra/superpowers) | `.superpowers/skills/systematic-debugging/SKILL.md` | ❌ No | git | Located in .superpowers, invisible to AGY |
| 100 | `test-driven-development` | Superpowers (obra/superpowers) | `.superpowers/skills/test-driven-development/SKILL.md` | ❌ No | npm, cargo | Located in .superpowers, invisible to AGY |
| 101 | `using-git-worktrees` | Superpowers (obra/superpowers) | `.superpowers/skills/using-git-worktrees/SKILL.md` | ❌ No | git, npm, node, python, cargo | Located in .superpowers, invisible to AGY |
| 102 | `using-superpowers` | Superpowers (obra/superpowers) | `.superpowers/skills/using-superpowers/SKILL.md` | ❌ No | git | Located in .superpowers, invisible to AGY |
| 103 | `verification-before-completion` | Superpowers (obra/superpowers) | `.superpowers/skills/verification-before-completion/SKILL.md` | ❌ No | None | Located in .superpowers, invisible to AGY |
| 104 | `writing-plans` | Superpowers (obra/superpowers) | `.superpowers/skills/writing-plans/SKILL.md` | ❌ No | git, python | Located in .superpowers, invisible to AGY |
| 105 | `writing-skills` | Superpowers (obra/superpowers) | `.superpowers/skills/writing-skills/SKILL.md` | ❌ No | git, node, python | Located in .superpowers, invisible to AGY |

## 4. Duplicate & Overlapping Skills Analysis

### 4.1 Identical File Duplicates (Ponytail)
The Ponytail ecosystem contains 6 exact duplicate skills stored in two separate subtrees:
- `.ponytail/skills/` vs `.ponytail/.openclaw/skills/`
  1. `ponytail`
  2. `ponytail-audit`
  3. `ponytail-debt`
  4. `ponytail-gain`
  5. `ponytail-help`
  6. `ponytail-review`

### 4.2 Functional Redundancies Across Frameworks

| Capability Domain | Overlapping Skills | Framework Collisions |
|:---|:---|:---|
| **Test-Driven Development** | `.agents/skills/tdd-workflow`<br>`.superpowers/skills/test-driven-development`<br>`.agents/skills/ai-regression-testing` | ECC mandates 80% coverage and AAA; Superpowers mandates strict red/green ceremony; Ponytail mandates only one tiny test for logic branches. |
| **Debugging & Root Cause** | `.agents/skills/agent-introspection-debugging`<br>`.superpowers/skills/systematic-debugging` | Both enforce 'no fixes without root cause', but Superpowers enforces strict phase gate checklists while ECC focuses on introspection reports. |
| **Planning & Architecture** | `.superpowers/skills/writing-plans`<br>`.agents/skills/architecture-decision-records`<br>`.agents/skills/story-lifecycle`<br>`.superpowers/skills/brainstorming` | Heavy ceremony overlap. Superpowers requires brainstorming before any plan. ECC requires ADRs and PRDs. |
| **Code Review** | `.claude/skills/github-code-review`<br>`.ponytail/skills/ponytail-review`<br>`.agents/skills/conventional-commit-review`<br>`.superpowers/skills/receiving-code-review`<br>`.superpowers/skills/requesting-code-review` | 5 conflicting methodologies: GitHub swarm review vs lazy ponytail review vs 6-agent ECC review vs Superpowers PR review. |
| **Swarm Orchestration** | `.claude/skills/swarm-orchestration`<br>`.claude/skills/swarm-advanced`<br>`.agents/skills/ruflo`<br>`builtin/skills/native_swarm` | Claude-flow mesh swarms require Ruflo CLI, while Antigravity provides native background board swarms. |

## 5. Skills with Broken Internal References

The following skills contain broken relative file or documentation paths in their `SKILL.md` body:
1. **`architecture-decision-records`** (`.agents/skills/architecture-decision-records/SKILL.md`): References nonexistent files `0001-use-nextjs.md`, `0002-postgres-over-mongo.md`, `0003-rest-over-graphql.md`.
2. **`growth-log`** (`.agents/skills/growth-log/SKILL.md`): References non-existent placeholder path `../path/to/related-entry.md`.
3. **`plan-canvas`** (`.agents/skills/plan-canvas/SKILL.md`): References non-existent `../../docs/design/plan-canvas.md`.
4. **`github-code-review`** (`.claude/skills/github-code-review/SKILL.md`): Contains invalid markdown placeholders `[text](link)`.
5. **`skill-builder`** (`.claude/skills/skill-builder/SKILL.md`): References missing subfolders `docs/ADVANCED.md`, `docs/API_REFERENCE.md`, `resources/examples/`.
6. **`verification-quality`** (`.claude/skills/verification-quality/SKILL.md`): References missing path `../../../verification/README.md`.
