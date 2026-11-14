import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

test('Smoke Test 1: Project configuration and package.json integrity', () => {
    const pkgPath = path.join(projectRoot, 'package.json');
    assert.ok(fs.existsSync(pkgPath), 'package.json must exist');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    assert.strictEqual(pkg.name, 'onlinerulerplus-com');
    assert.strictEqual(pkg.type, 'module');
    assert.ok(pkg.scripts.build, 'build script must exist');
    assert.ok(pkg.scripts.test, 'test script must exist');
    assert.ok(pkg.dependencies.astro, 'astro dependency must exist');
});

test('Smoke Test 2: Astro configuration integrity', () => {
    const configPath = path.join(projectRoot, 'astro.config.mjs');
    assert.ok(fs.existsSync(configPath), 'astro.config.mjs must exist');
    const content = fs.readFileSync(configPath, 'utf-8');
    assert.match(content, /defineConfig/, 'astro.config.mjs must call defineConfig');
});

test('Smoke Test 3: Core index page existence and structure', () => {
    const indexPath = path.join(projectRoot, 'src', 'pages', 'index.astro');
    assert.ok(fs.existsSync(indexPath), 'src/pages/index.astro must exist');
    const content = fs.readFileSync(indexPath, 'utf-8');
    assert.match(content, /<html/i, 'index.astro must contain <html> tag');
    assert.match(content, /<\/html>/i, 'index.astro must contain </html> tag');
});

test('Smoke Test 4: Unified GEMINI.md project guidelines existence', () => {
    const geminiPath = path.join(projectRoot, 'GEMINI.md');
    assert.ok(fs.existsSync(geminiPath), 'GEMINI.md must exist');
    const content = fs.readFileSync(geminiPath, 'utf-8');
    assert.match(content, /Core Operating Priorities/i, 'GEMINI.md must outline core operating priorities');
    assert.match(content, /Security & Data Integrity/i, 'GEMINI.md must prioritize security');
});

test('Smoke Test 5: MCP Configuration integrity', () => {
    const mcpPath = path.join(projectRoot, '.mcp.json');
    assert.ok(fs.existsSync(mcpPath), '.mcp.json must exist');
    const mcp = JSON.parse(fs.readFileSync(mcpPath, 'utf-8'));
    assert.ok(mcp.mcpServers['claude-flow'], 'claude-flow server must be configured');
    assert.ok(!JSON.stringify(mcp).includes('AppData'), '.mcp.json must not contain hardcoded AppData paths');
});
