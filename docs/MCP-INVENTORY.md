# Master MCP Servers & Tools Inventory — OnlineRulerPlus.com

> **Audit Date:** November 14, 2026  
> **Target Workspace:** `C:\OnlineRulerPlus.com`  
> **Total Declared MCP Servers:** 2 configuration entries (1 conceptual server: `claude-flow`)  
> **Live Active MCP Connections:** 1 (`astro-docs` lazy server)  
> **Windows Compatibility Status:** ⚠️ Fragile (Hardcoded npm-cache path & uninstalled CLI)  
> **Authentication / Secrets Status:** ✅ Clean (No hardcoded credentials or API keys)

---

## 1. MCP Configuration Registry

| Server Identifier | Configuration Source | Command / Executable | Arguments | Windows Spawn Safety | Connectivity Status |
|:---|:---|:---|:---|:---:|:---:|
| **`claude-flow`** | `.mcp.json` (Line 3) | `cmd` | `["/c", "npx", "-y", "ruflo@latest", "mcp", "start"]` | ⚠️ Risky | ❌ Fails offline / Hangs without interactive tty |
| **`claude-flow`** | `.agents/plugins/ruflo/mcp_config.json` (Line 3) | `node` | `["C:\\Users\\vipul\\AppData\\Local\\npm-cache\\_npx\\2ed56890c96f58f7\\node_modules\\ruflo\\bin\\ruflo.js", "mcp", "start"]` | ❌ Critical Path Drift | ⚠️ Working locally only until npm cache is cleared |
| **`superpowers`** | `.superpowers/.muse-plugin/plugin.json` (Line 86) | N/A | `[]` (Empty server declaration) | N/A | ⚪ Unconfigured (Placeholder) |
| **`astro-docs`** | Antigravity Runtime (`<appDataDir>/mcp/astro-docs`) | Native Lazy | Tool: `search_astro_docs` | ✅ Verified Safe | ✅ Active & Functional |

---

## 2. Server-by-Server Technical Breakdown

### 2.1 Server: `claude-flow` (Root `.mcp.json`)
* **Path:** `C:\OnlineRulerPlus.com\.mcp.json`
* **Syntax:** Valid JSON.
* **Command Structure:**
  ```json
  {
    "mcpServers": {
      "claude-flow": {
        "command": "cmd",
        "args": ["/c", "npx", "-y", "ruflo@latest", "mcp", "start"],
        "env": {
          "npm_config_update_notifier": "false",
          "CLAUDE_FLOW_MODE": "v3",
          "CLAUDE_FLOW_HOOKS_ENABLED": "true",
          "CLAUDE_FLOW_TOPOLOGY": "hierarchical-mesh",
          "CLAUDE_FLOW_MAX_AGENTS": "15",
          "CLAUDE_FLOW_MEMORY_BACKEND": "hybrid"
        },
        "autoStart": false
      }
    }
  }
  ```
* **Evaluation & Flaws:**
  1. **Network Dependency at Boot:** `npx -y ruflo@latest` forces an online check against `registry.npmjs.org` on startup. Inside sandboxed environments, corporate firewalls, or offline dev environments, this invocation hangs or fails with network timeout.
  2. **Process Spawn Overhead:** Wrapping via `cmd /c` spawns a cmd.exe shell which in turn invokes `npx.cmd`, spawning another node process. On Windows, this multi-process chain adds latency and makes process tree cleanup difficult.
  3. **AutoStart Disabled:** Set to `"autoStart": false`, meaning clients will not spin it up automatically.

### 2.2 Server: `claude-flow` (`.agents/plugins/ruflo/mcp_config.json`)
* **Path:** `C:\OnlineRulerPlus.com\.agents\plugins\ruflo\mcp_config.json`
* **Syntax:** Valid JSON.
* **Command Structure:**
  ```json
  {
    "mcpServers": {
      "claude-flow": {
        "command": "node",
        "args": [
          "C:\\Users\\vipul\\AppData\\Local\\npm-cache\\_npx\\2ed56890c96f58f7\\node_modules\\ruflo\\bin\\ruflo.js",
          "mcp",
          "start"
        ],
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
* **Evaluation & Flaws:**
  1. **Critical Path Drift / Machine Tie-In:** Uses an absolute Windows path into a user-specific ephemeral directory:
     `C:\Users\vipul\AppData\Local\npm-cache\_npx\2ed56890c96f58f7\...`
     - If `npm cache clean --force` or Windows Disk Cleanup runs, this file is deleted.
     - Any collaborator or CI runner checking out this repository will experience immediate crash due to path non-existence.
  2. **Verification Test:** Executing `node "C:\Users\vipul\AppData\Local\npm-cache\_npx\2ed56890c96f58f7\node_modules\ruflo\bin\ruflo.js" --version` succeeds currently with output: `ruflo v3.77.1`. The executable exists right now, but its location is extremely volatile.

### 2.3 Server: `astro-docs` (Antigravity Built-in MCP)
* **Path:** `C:\Users\vipul\.gemini\antigravity-cli\mcp\astro-docs\search_astro_docs.json`
* **Type:** Lazy-loaded native MCP tool.
* **Schema:**
  ```json
  {
    "name": "search_astro_docs",
    "description": "Search the official Astro framework docs",
    "parameters": {
      "properties": {
        "query": { "type": "string", "description": "Search query" }
      },
      "required": ["query"],
      "type": "object"
    }
  }
  ```
* **Evaluation:** Working, well-formed, and completely aligned with the project's Astro codebase.

---

## 3. Duplicate Servers & Configuration Collision

| Conflict Vector | Details | Impact |
|:---|:---|:---|
| **Duplicate Identifier** | Both `.mcp.json` and `.agents/plugins/ruflo/mcp_config.json` declare server `"claude-flow"`. | Precedence collision depending on whether Antigravity or Claude Code loads project root config vs plugin config. |
| **Command Divergence** | Root config uses `cmd /c npx -y ruflo@latest` while plugin config uses direct `node C:\Users\vipul\...`. | Inconsistent behavior, different startup times, and unpredictable failures across different harnesses. |

---

## 4. Security & Credential Audit

- **Hardcoded Secrets:** None found in any MCP configuration file.
- **Sensitive Environment Variables:** Only configuration flags (`CLAUDE_FLOW_MODE`, `CLAUDE_FLOW_TOPOLOGY`, etc.) are present.
- **Access Boundary:** No unauthorized filesystem or network scopes are granted.

---

## 5. Remediation Plan for Windows MCP Stability

To eliminate fragility and enable 100% offline-resilient execution:
1. **Install ruflo locally in `package.json`**:
   Add `ruflo` to `devDependencies` (`npm install --save-dev ruflo`).
2. **Standardize MCP Command**:
   Update both `.mcp.json` and `.agents/plugins/ruflo/mcp_config.json` to resolve relative to project root:
   ```json
   {
     "mcpServers": {
       "claude-flow": {
         "command": "node",
         "args": ["./node_modules/ruflo/bin/ruflo.js", "mcp", "start"],
         "env": {
           "CLAUDE_FLOW_MODE": "v3",
           "CLAUDE_FLOW_HOOKS_ENABLED": "true"
         }
       }
     }
   }
   ```
This removes the hardcoded user path, eliminates the online `npx` query, and functions reliably across Windows, macOS, and Linux.
