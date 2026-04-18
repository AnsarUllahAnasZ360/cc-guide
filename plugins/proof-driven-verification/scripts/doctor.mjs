#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
const json = args.has('--json');
const cwd = process.cwd();
const pluginRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

function run(command, commandArgs = []) {
  const result = spawnSync(command, commandArgs, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  };
}

function commandCheck(name, command = name, commandArgs = ['--version'], required = true) {
  const result = run(command, commandArgs);
  return {
    name,
    required,
    ok: result.ok,
    detail: result.ok
      ? (result.stdout.split('\n')[0] || `${command} available`)
      : result.stderr.split('\n')[0] || `${command} not found`,
  };
}

function readJsonIfExists(filePath) {
  try {
    return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : null;
  } catch (error) {
    return { __parseError: error instanceof Error ? error.message : String(error) };
  }
}

function rootPackage() {
  const filePath = path.join(cwd, 'package.json');
  return readJsonIfExists(filePath);
}

function hasNextDevtoolsConfig() {
  const candidates = [
    path.join(cwd, '.mcp.json'),
    path.join(cwd, 'apps/web/.mcp.json'),
    path.join(pluginRoot, '.mcp.json'),
  ];
  for (const filePath of candidates) {
    const config = readJsonIfExists(filePath);
    if (config?.mcpServers?.['next-devtools']) {
      return { ok: true, detail: path.relative(cwd, filePath) || filePath };
    }
  }
  return { ok: false, detail: 'next-devtools MCP config not found' };
}

function hasAgentBrowserPayload() {
  const browserRoot = path.join(os.homedir(), '.agent-browser', 'browsers');
  if (!fs.existsSync(browserRoot)) {
    return { ok: false, detail: `${browserRoot} missing` };
  }
  const entries = fs.readdirSync(browserRoot).filter(entry => !entry.startsWith('.'));
  return entries.length > 0
    ? { ok: true, detail: entries.join(', ') }
    : { ok: false, detail: `${browserRoot} is empty` };
}

function scriptCheck(scriptName) {
  const pkg = rootPackage();
  const value = pkg?.scripts?.[scriptName];
  return {
    name: `package script ${scriptName}`,
    required: false,
    ok: Boolean(value),
    detail: value || 'not declared',
  };
}

function deepgramKeyStatus() {
  if (process.env.DEEPGRAM_API_KEY) {
    return { ok: true, detail: 'DEEPGRAM_API_KEY is set' };
  }
  const result = run('node', [path.join(pluginRoot, 'scripts/deepgram-key.mjs'), 'status']);
  return result.ok
    ? { ok: true, detail: result.stdout || 'Deepgram key configured' }
    : { ok: false, detail: 'No env var or secure local Deepgram key; narration will be skipped' };
}

function detectStack() {
  const pkg = rootPackage();
  const composer = readJsonIfExists(path.join(cwd, 'composer.json'));
  const markers = [];
  if (pkg?.dependencies?.next || pkg?.devDependencies?.next || fs.existsSync(path.join(cwd, 'next.config.ts')) || fs.existsSync(path.join(cwd, 'next.config.js'))) {
    markers.push('Next.js');
  }
  if (pkg?.dependencies?.['@supabase/supabase-js'] || pkg?.dependencies?.['@supabase/ssr'] || fs.existsSync(path.join(cwd, 'supabase'))) {
    markers.push('Supabase');
  }
  if (pkg?.dependencies?.convex || pkg?.devDependencies?.convex || fs.existsSync(path.join(cwd, 'convex'))) {
    markers.push('Convex');
  }
  if (composer?.require?.['laravel/framework'] || fs.existsSync(path.join(cwd, 'artisan'))) {
    markers.push('Laravel');
  }
  return markers.length ? markers.join(', ') : 'unknown';
}

const checks = [
  commandCheck('node', 'node', ['--version'], true),
  commandCheck('git', 'git', ['--version'], true),
  commandCheck('pnpm', 'pnpm', ['--version'], true),
  commandCheck('npm', 'npm', ['--version'], false),
  commandCheck('npx', 'npx', ['--version'], false),
  commandCheck('agent-browser', 'agent-browser', ['--version'], true),
  commandCheck('ffmpeg', 'ffmpeg', ['-version'], true),
  commandCheck('ffprobe', 'ffprobe', ['-version'], true),
  commandCheck('Deepgram CLI dg', 'dg', ['--version'], false),
  {
    name: 'Agent Browser browser payloads',
    required: true,
    ...hasAgentBrowserPayload(),
  },
  {
    name: 'Deepgram API key',
    required: false,
    ...deepgramKeyStatus(),
  },
  {
    name: 'Remotion template',
    required: true,
    ok: fs.existsSync(path.join(pluginRoot, 'assets/remotion-template/package.json')),
    detail: path.relative(cwd, path.join(pluginRoot, 'assets/remotion-template')),
  },
  {
    name: 'Next.js DevTools MCP config',
    required: false,
    ...hasNextDevtoolsConfig(),
  },
  scriptCheck('dev:web'),
  scriptCheck('dev:web:unsafe'),
  scriptCheck('dev'),
  scriptCheck('test'),
  scriptCheck('lint'),
  scriptCheck('typecheck'),
];

const failures = checks.filter(check => check.required && !check.ok);
const warnings = checks.filter(check => !check.required && !check.ok);
const result = {
  ok: failures.length === 0,
  cwd,
  pluginRoot,
  checks,
  failures,
  warnings,
  detectedStack: detectStack(),
};

if (json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`Proof-driven verification doctor: ${result.ok ? 'PASS' : 'FAIL'}`);
  console.log(`Detected stack: ${result.detectedStack}`);
  for (const check of checks) {
    const marker = check.ok ? 'PASS' : check.required ? 'FAIL' : 'WARN';
    console.log(`[${marker}] ${check.name}: ${check.detail}`);
  }
}

process.exit(result.ok ? 0 : 1);
