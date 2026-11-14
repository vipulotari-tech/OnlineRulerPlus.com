#!/usr/bin/env node
/**
 * Hardened Ruflo MCP Launcher for Windows & Cross-Platform
 * Dynamically resolves local, cached, or global Ruflo binary without machine-specific hash locking.
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function resolveRuflo() {
  // 1. Dynamic discovery in LocalAppData npm cache (any user hash) - battle-tested standalone bundle
  const localAppData = process.env.LOCALAPPDATA;
  if (localAppData) {
    const npxDir = path.join(localAppData, 'npm-cache', '_npx');
    if (fs.existsSync(npxDir)) {
      try {
        const hashes = fs.readdirSync(npxDir);
        for (const h of hashes) {
          const candidate = path.join(npxDir, h, 'node_modules', 'ruflo', 'bin', 'ruflo.js');
          if (fs.existsSync(candidate)) {
            return { cmd: process.execPath, args: [candidate] };
          }
        }
      } catch (e) {
        // Ignore read errors
      }
    }
  }

  // 2. Local project node_modules (only if complete ruflo package exists)
  const localRuflo = path.resolve(__dirname, '../../../node_modules/ruflo/bin/ruflo.js');
  if (fs.existsSync(localRuflo)) {
    return { cmd: process.execPath, args: [localRuflo] };
  }

  // 3. Global npm install
  const appData = process.env.APPDATA;
  if (appData) {
    const globalCandidate = path.join(appData, 'npm', 'node_modules', 'ruflo', 'bin', 'ruflo.js');
    if (fs.existsSync(globalCandidate)) {
      return { cmd: process.execPath, args: [globalCandidate] };
    }
  }

  // 4. Safe Windows fallback to npx
  const isWin = process.platform === 'win32';
  return {
    cmd: isWin ? 'cmd.exe' : 'npx',
    args: isWin ? ['/c', 'npx', '-y', 'ruflo@latest'] : ['-y', 'ruflo@latest']
  };
}

const target = resolveRuflo();
const commandArgs = [...target.args, ...process.argv.slice(2)];

const child = spawn(target.cmd, commandArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
    npm_config_update_notifier: 'false',
    CLAUDE_FLOW_MODE: 'v3',
    CLAUDE_FLOW_HOOKS_ENABLED: 'true',
    CLAUDE_FLOW_TOPOLOGY: 'hierarchical-mesh',
    CLAUDE_FLOW_MAX_AGENTS: '15',
    CLAUDE_FLOW_MEMORY_BACKEND: 'hybrid'
  }
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

child.on('error', (err) => {
  console.error('[Ruflo MCP Launcher Error]:', err.message);
  process.exit(1);
});
