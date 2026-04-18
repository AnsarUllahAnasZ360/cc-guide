#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const command = args[0] || 'verify';
const cwd = process.cwd();

function valueFor(flag) {
  const eq = args.find(arg => arg.startsWith(`${flag}=`));
  if (eq) return eq.split('=', 2)[1];
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : '';
}

function hasFlag(flag) {
  return args.includes(flag);
}

function run(commandName, commandArgs, options = {}) {
  const result = spawnSync(commandName, commandArgs, {
    cwd,
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    encoding: 'utf8',
  });
  return result;
}

function usage() {
  console.log(`ProofOps

Usage:
  node plugins/proof-driven-verification/scripts/proofops.mjs verify --task "..." [--pr <url-or-number>] [--branch <name>] [--no-run]
  node plugins/proof-driven-verification/scripts/proofops.mjs prompt --task "..."

Examples:
  node plugins/proof-driven-verification/scripts/proofops.mjs verify --task "Verify the auth PR" --pr 123
  node plugins/proof-driven-verification/scripts/proofops.mjs prompt --task "Verify checkout flow"
`);
}

function buildPrompt() {
  const task = valueFor('--task') || valueFor('-t') || args.slice(1).filter(arg => !arg.startsWith('--')).join(' ');
  const pr = valueFor('--pr');
  const branch = valueFor('--branch') || run('git', ['branch', '--show-current'], { capture: true }).stdout?.trim();
  const base = valueFor('--base');

  if (!task) {
    usage();
    process.exit(1);
  }

  return [
    'Use ProofOps with subagents to verify this work.',
    '',
    `Task: ${task}`,
    pr ? `PR: ${pr}` : '',
    branch ? `Branch: ${branch}` : '',
    base ? `Base: ${base}` : '',
    '',
    'Preferences:',
    '- Be concise in user-facing output.',
    '- Run quiet preflight internally; report only failures.',
    '- Use Code Review, Browser QA, Developer Fixer, and Proof Producer roles.',
    '- Use Agent Browser for browser verification and evidence.',
    '- Use Computer Use only as fallback.',
    '- Iterate fixes until Browser QA confirms pass or a hard blocker is proven.',
    '- Produce final report and proof artifacts.',
  ]
    .filter(Boolean)
    .join('\n');
}

if (hasFlag('--help') || hasFlag('-h')) {
  usage();
  process.exit(0);
}

if (command !== 'verify' && command !== 'prompt') {
  usage();
  process.exit(1);
}

const prompt = buildPrompt();

if (command === 'prompt' || hasFlag('--no-run')) {
  console.log(prompt);
  process.exit(0);
}

if (spawnSync('codex', ['--version'], { stdio: 'ignore' }).status !== 0) {
  console.error('codex CLI not found. Re-run with `prompt --task ...` and paste the prompt into Codex.');
  process.exit(1);
}

const result = run('codex', ['exec', '-C', cwd, prompt]);
process.exit(result.status || 0);
