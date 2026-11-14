# Project Guidelines — OnlineRulerPlus.com

Welcome to **OnlineRulerPlus.com**. This repository is an Astro 7.4 web application engineered with a unified AI development architecture under **Google Antigravity (AGY)**.

---

## 1. Core Operating Priorities

When planning, writing, modifying, or reviewing code, always follow this strict hierarchy:

1. **Security & Data Integrity:**
   - Never commit API keys, secrets, credentials, or `.env` files.
   - Validate and sanitize all inputs at system and component boundaries.
   - Guard against XSS, SSRF, injection, and prototype pollution.
2. **Correctness & Working Tests:**
   - Every change must build cleanly (`npm run build`).
   - Every non-trivial change must pass tests (`npm test`).
   - Never claim test coverage percentages unless actually measured by test tooling.
3. **Minimal Maintainable Implementation (Ponytail Principle):**
   - Take the simplest solution that completely and correctly solves the problem.
   - Prefer standard platform/language features and existing utilities over new external packages.
   - Avoid speculative generality, premature abstractions, boilerplate wrappers, and "for later" code.
   - Ponytail prevents unnecessary complexity; it does *not* prevent necessary architecture, validation, or testing.
4. **Task-Appropriate Engineering Workflows (Superpowers & ECC):**
   - For simple fixes: implement directly, verify with tests, and keep diffs small.
   - For complex/ambiguous features: use brainstorming and structured planning before implementation.
   - For tricky bugs: conduct systematic root-cause investigation before writing fixes.
   - Proportionality rule: do not force heavy ceremony on trivial one-line tasks.
5. **Documentation When Genuinely Necessary:**
   - Keep the project root clean; store architectural decisions and specifications in `docs/` (`docs/adr/`, `docs/plans/`).
   - Self-documenting, well-named code beats lengthy redundant comments.
   - Document only non-obvious invariants, security assumptions, and public API contracts.

---

## 2. Development & Server Lifecycle

- **Dev Server:** Always start the local development server in background mode:
  ```bash
  astro dev --background
  ```
- **Server Management:**
  - Check status: `astro dev status`
  - Inspect server logs: `astro dev logs`
  - Stop server: `astro dev stop`
- **Build & Verification:**
  - Build: `npm run build`
  - Test: `npm test`

---

## 3. Code Quality & Maintainability Standards

- **File Length:** Target 200–500 lines per file; 800 lines is the absolute soft maintainability ceiling. If a file approaches 800 lines, extract cohesive domain modules.
- **Functions:** High cohesion, single responsibility (<50 lines preferred).
- **Immutability:** Prefer immutable data patterns and pure transformations; avoid mutating shared state in-place.
- **Error Handling:** Explicit error boundaries and user-friendly failure feedback; never swallow errors silently.

---

## 4. Multi-Framework Modal Personas (Opt-In Modes)

Rather than conflicting globally, the workspace frameworks serve specialized, task-appropriate roles:

| Mode / Persona | Invocation / Trigger | Best Used For | Guidelines |
|:---|:---|:---|:---|
| **Standard Mode (Default)** | Default turn | Daily feature development, component creation, refactoring | Balanced approach: clean TypeScript/Astro, Vitest tests, readable code. |
| **Ponytail Mode** | User requests "be lazy", "ponytail", "minimal diff", or invokes `/ponytail` | Quick bug fixes, dead code cleanup, dependency pruning | Write minimal code. No boilerplate, no unrequested abstractions. |
| **Superpowers Mode** | User requests "brainstorm", "write plan", or invokes `/superpowers` | Large greenfield features, ambiguous requirements, multi-agent dispatch | Brainstorm options, get human signoff on design doc, execute plan incrementally. |
| **Ruflo Swarm Mode** | User requests `/ruflo` or multi-agent swarm operations | Complex parallel auditing, persistent vector memory, cross-session patterns | Utilize hardened local MCP tools (`memory_store`, `swarm_init`) without external dependencies. |

---

## 5. Testing & Verification Standards

- **Unit Tests:** Located in `tests/` or alongside source components (`*.test.mjs` / `*.test.ts`).
- **Runner:** Native Node.js Test Runner (`npm test` / `node --test tests/*.test.mjs`) or Vitest if subsequently added.
- **Smoke Tests:** Maintain baseline sanity tests (`tests/smoke.test.mjs`) validating Astro configuration, MCP health, and page routing.
- **Coverage Policy:** Testing depth must be proportional to risk. Core business logic, mathematical calculations, and security boundaries require unit test coverage.
