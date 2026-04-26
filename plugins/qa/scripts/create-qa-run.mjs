#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const cwd = process.cwd();

function valueFor(flag) {
  const eq = args.find(arg => arg.startsWith(`${flag}=`));
  if (eq) return eq.split('=', 2)[1];
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : '';
}

function git(commandArgs) {
  const result = spawnSync('git', commandArgs, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return result.status === 0 ? result.stdout.trim() : '';
}

const sprint = valueFor('--sprint');
const summary = valueFor('--summary') || 'QA verification run';
const mode = sprint ? 'sprint' : valueFor('--mode') || 'branch';
const runId = valueFor('--run-id') || new Date().toISOString().replace(/[:.]/g, '-');
const baseDir = sprint
  ? path.join(path.resolve(sprint), 'evidence')
  : path.join(cwd, 'artifacts', 'qa');
const runDir = path.join(baseDir, runId);

fs.mkdirSync(path.join(runDir, 'screenshots'), { recursive: true });
fs.mkdirSync(path.join(runDir, 'logs'), { recursive: true });
fs.mkdirSync(path.join(runDir, 'recordings'), { recursive: true });

const manifest = {
  taskSummary: summary,
  runId,
  createdAt: new Date().toISOString(),
  cwd,
  gitBranch: git(['branch', '--show-current']) || null,
  gitHead: git(['rev-parse', 'HEAD']) || null,
  mode,
  sprintFolder: sprint ? path.resolve(sprint) : null,
  commandsRun: [],
  routesTested: [],
  checks: [],
  verdict: 'pending',
  gates: {
    review: 'pending',
    tests: 'pending',
    browser: 'pending',
    runtime: 'pending',
    merge: 'pending'
  },
  recordings: {
    walkthrough: null
  },
  proofVideo: null,
  videoDecision: 'pending',
  videoDecisionReason: null,
  proofVideoPolicy: {
    primaryEvidence: 'browser-walkthrough-recording',
    screenshotRole: 'supporting-chapter-evidence',
    requiresPassingVerdict: true,
    requiresWalkthroughRecording: true,
    targetDurationSeconds: {
      min: 300,
      max: 600
    },
    allowNonPassingReport: false
  },
  walkthroughDurationSeconds: null,
  artifacts: {
    report: 'verification-report.md',
    screenshots: [],
    walkthroughRecording: null,
    logs: [],
    narration: null,
    proofVideo: null
  },
  finalVerdict: 'pending',
  blockers: [],
  commitHash: null
};

fs.writeFileSync(path.join(runDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(
  path.join(runDir, 'verification-report.md'),
  `# QA Verification Report\n\n## Definition of done\n\n${summary}\n\n## Review findings\n\nPending.\n\n## Automated tests\n\nPending.\n\n## Runtime diagnostics\n\nPending.\n\n## Browser Use verification\n\nPending.\n\n## Browser Use walkthrough recording\n\nPending.\n\n## Computer Use fallback\n\nN/A.\n\n## GitHub and CI context\n\nN/A.\n\n## Fixes made\n\nPending.\n\n## Documentation updates\n\nPending.\n\n## Evidence inventory\n\nPending.\n\n## Video decision\n\nPending. Founder proof video is allowed only after all required gates are PASS or MERGE and a Browser Use walkthrough recording exists.\n\n## Residual risks\n\nPending.\n\n## Verdict\n\nPending.\n`
);

console.log(runDir);
