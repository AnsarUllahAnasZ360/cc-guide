#!/usr/bin/env node
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const skipBrew = args.has('--skip-brew');
const skipDeepgram = args.has('--skip-deepgram');

function run(command, commandArgs = [], options = {}) {
  const rendered = [command, ...commandArgs].join(' ');
  if (dryRun) {
    console.log(`[dry-run] ${rendered}`);
    return { status: 0 };
  }
  console.log(`[run] ${rendered}`);
  const result = spawnSync(command, commandArgs, {
    stdio: 'inherit',
    shell: options.shell || false,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${rendered}`);
  }
  return result;
}

function has(command, commandArgs = ['--version']) {
  return spawnSync(command, commandArgs, { stdio: 'ignore' }).status === 0;
}

try {
  if (!has('agent-browser')) {
    run('npm', ['install', '-g', 'agent-browser@latest']);
  } else {
    run('npm', ['install', '-g', 'agent-browser@latest']);
  }

  run('agent-browser', ['install']);

  if (!has('ffmpeg', ['-version']) || !has('ffprobe', ['-version'])) {
    if (process.platform === 'darwin' && !skipBrew && has('brew')) {
      run('brew', ['install', 'ffmpeg']);
    } else {
      console.warn('[warn] ffmpeg/ffprobe missing; install ffmpeg manually for video validation.');
    }
  }

  if (!skipDeepgram && !has('dg')) {
    run('sh', ['-lc', 'curl -fsSL https://deepgram.com/install.sh | sh'], { shell: false });
  }

  run('node', ['plugins/proof-driven-verification/scripts/doctor.mjs']);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
