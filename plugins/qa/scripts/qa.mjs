#!/usr/bin/env node
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const command = args[0] || 'prompt';
const cwd = process.cwd();

function valueFor(flag) {
  const eq = args.find(arg => arg.startsWith(`${flag}=`));
  if (eq) return eq.split('=', 2)[1];
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : '';
}

function run(commandName, commandArgs, options = {}) {
  return spawnSync(commandName, commandArgs, {
    cwd,
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    encoding: 'utf8',
  });
}

function usage() {
  console.log(`QA

Usage:
  node plugins/qa/scripts/qa.mjs setup [--install] [--smoke]
  node plugins/qa/scripts/qa.mjs prompt --task "Verify this work" [--sprint sprints/name]
  node plugins/qa/scripts/qa.mjs run --task "Verify this work" [--sprint sprints/name]
  node plugins/qa/scripts/qa.mjs proof-video <run-dir> --target-url <url>
`);
}

function buildPrompt() {
  const task = valueFor('--task') || valueFor('-t') || args.slice(1).filter(arg => !arg.startsWith('--')).join(' ');
  const sprint = valueFor('--sprint');
  if (!task && !sprint) {
    usage();
    process.exit(1);
  }
  return [
    'Use the QA plugin to verify this work end to end.',
    '',
    task ? `Task: ${task}` : '',
    sprint ? `Sprint folder: ${sprint}` : '',
    '',
    'Preferences:',
    '- Use subagents for code review, tests, Next.js diagnostics, Convex review, Browser Use QA, Computer Use fallback when justified, fixes, documentation, and proof production.',
    '- Use Browser Use in the Codex in-app browser for all user-visible verification.',
    '- Use Playwright recording from an explicit proof walkthrough plan as the default proof-video recorder. Browser Use frame recording and macOS screen recording are fallback/diagnostic paths, not the default founder proof path.',
    '- Use Computer Use only for native GUI, system-dialog, extension, simulator, or Browser Use blocker scenarios.',
    '- Use GitHub or gh for PR comments, CI, and publish context when the target has a PR.',
    '- Use Agent Browser CLI only as the last fallback after Browser Use and Computer Use cannot complete the needed capture or diagnostic path.',
    '- Create a walkthrough recording, supporting screenshots, logs, manifest, verification-report.md, and a narrated QA proof video.',
    '- Do not render a founder-facing proof video unless the manifest verdict/gates are PASS or MERGE-ready and the walkthrough recording is present.',
    '- Iterate fixes until the definition of done passes or a hard blocker is proven.',
    '- Commit scoped fixes and docs when verification changes are made.'
  ]
    .filter(Boolean)
    .join('\n');
}

if (args.includes('--help') || args.includes('-h')) {
  usage();
  process.exit(0);
}

if (command === 'setup') {
  const setupArgs = ['plugins/qa/scripts/setup-qa-video-pipeline.mjs', ...args.slice(1)];
  const result = run('node', setupArgs);
  process.exit(result.status || 0);
}

if (command === 'proof-video') {
  const proofArgs = ['plugins/qa/scripts/run-proof-video-pipeline.mjs', ...args.slice(1)];
  const result = run('node', proofArgs);
  process.exit(result.status || 0);
}

if (command !== 'prompt' && command !== 'run') {
  usage();
  process.exit(1);
}

const prompt = buildPrompt();

if (command === 'prompt') {
  console.log(prompt);
  process.exit(0);
}

if (spawnSync('codex', ['--version'], { stdio: 'ignore' }).status !== 0) {
  console.error('codex CLI not found. Re-run with `prompt --task ...` and paste the prompt into Codex.');
  process.exit(1);
}

const result = run('codex', ['exec', '-C', cwd, prompt]);
process.exit(result.status || 0);
