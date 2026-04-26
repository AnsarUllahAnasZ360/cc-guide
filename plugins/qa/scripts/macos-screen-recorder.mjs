#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawn, spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const command = args[0] || 'help';

function valueFor(flag, fallback = '') {
  const eq = args.find(arg => arg.startsWith(`${flag}=`));
  if (eq) return eq.split('=', 2)[1];
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
}

function boolFlag(flag) {
  return args.includes(flag);
}

function usage() {
  console.log(`macOS screen recorder for QA proof videos

Usage:
  node plugins/qa/scripts/macos-screen-recorder.mjs start <run-dir> [--label browser-walkthrough] [--duration-seconds 360] [--display 1] [--show-clicks]
  node plugins/qa/scripts/macos-screen-recorder.mjs stop <run-dir> [--label browser-walkthrough]
  node plugins/qa/scripts/macos-screen-recorder.mjs status <run-dir> [--label browser-walkthrough]

This records the visible Codex in-app browser surface with macOS screencapture.
Use it only after QA gates pass or when producing an explicitly approved proof-video walkthrough.
`);
}

function safeName(value) {
  return String(value || 'browser-walkthrough')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'browser-walkthrough';
}

function runDirArg() {
  const raw = args.find((arg, index) => index > 0 && !arg.startsWith('--'));
  if (!raw) {
    usage();
    process.exit(1);
  }
  return path.resolve(raw);
}

function recorderPaths(runDir, label) {
  const dir = path.join(runDir, 'recordings', label);
  return {
    dir,
    videoPath: path.join(dir, 'browser-walkthrough.mov'),
    metadataPath: path.join(dir, 'metadata.json'),
    pidPath: path.join(dir, 'screencapture.pid'),
    manifestPath: path.join(runDir, 'manifest.json')
  };
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function processAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function updateManifest(runDir, paths, metadata) {
  const manifest = readJson(paths.manifestPath);
  manifest.recordings = manifest.recordings || {};
  manifest.artifacts = manifest.artifacts || {};
  manifest.recordings.walkthrough = {
    kind: 'browser-walkthrough-video',
    captureMethod: 'macos-screencapture',
    path: path.relative(runDir, paths.videoPath),
    metadataPath: path.relative(runDir, paths.metadataPath),
    durationSeconds: metadata.durationSeconds || metadata.requestedDurationSeconds || null,
    display: metadata.display,
    showClicks: metadata.showClicks
  };
  manifest.artifacts.walkthroughRecording = manifest.recordings.walkthrough.path;
  manifest.walkthroughDurationSeconds = manifest.recordings.walkthrough.durationSeconds;
  writeJson(paths.manifestPath, manifest);
}

function ensureScreencapture() {
  const result = spawnSync('/usr/sbin/screencapture', ['-v', '-V', '1', '-x', '/tmp/qa-screencapture-doctor.mov'], {
    stdio: 'ignore'
  });
  try {
    fs.rmSync('/tmp/qa-screencapture-doctor.mov', { force: true });
  } catch {
    // Best effort cleanup only.
  }
  if (result.status !== 0) {
    throw new Error('macOS screencapture video mode is unavailable or blocked by screen-recording permissions.');
  }
}

if (command === 'help' || args.includes('--help') || args.includes('-h')) {
  usage();
  process.exit(0);
}

const runDir = runDirArg();
const label = safeName(valueFor('--label', 'browser-walkthrough'));
const paths = recorderPaths(runDir, label);

if (command === 'start') {
  ensureScreencapture();
  fs.mkdirSync(paths.dir, { recursive: true });
  const existing = readJson(paths.metadataPath);
  if (existing.pid && processAlive(existing.pid)) {
    console.log(JSON.stringify({ ok: true, status: 'already-recording', ...existing }, null, 2));
    process.exit(0);
  }

  const durationSeconds = Math.max(1, Number(valueFor('--duration-seconds', '360')) || 360);
  const display = Math.max(1, Number(valueFor('--display', '1')) || 1);
  const showClicks = boolFlag('--show-clicks');
  fs.rmSync(paths.videoPath, { force: true });

  const screencaptureArgs = [
    '-v',
    '-V',
    String(durationSeconds),
    `-D${display}`,
    '-x'
  ];
  if (showClicks) screencaptureArgs.push('-k');
  screencaptureArgs.push(paths.videoPath);

  const child = spawn('/usr/sbin/screencapture', screencaptureArgs, {
    detached: true,
    stdio: 'ignore'
  });
  child.unref();

  const metadata = {
    kind: 'browser-walkthrough-video',
    captureMethod: 'macos-screencapture',
    label,
    pid: child.pid,
    startedAt: new Date().toISOString(),
    stoppedAt: null,
    requestedDurationSeconds: durationSeconds,
    durationSeconds,
    display,
    showClicks,
    path: path.relative(runDir, paths.videoPath),
    status: 'recording'
  };
  writeJson(paths.metadataPath, metadata);
  fs.writeFileSync(paths.pidPath, `${child.pid}\n`);
  updateManifest(runDir, paths, metadata);
  console.log(JSON.stringify({ ok: true, ...metadata, metadataPath: path.relative(runDir, paths.metadataPath) }, null, 2));
  process.exit(0);
}

if (command === 'stop') {
  const metadata = readJson(paths.metadataPath);
  const pid = metadata.pid || Number(fs.existsSync(paths.pidPath) ? fs.readFileSync(paths.pidPath, 'utf8').trim() : 0);
  if (pid && processAlive(pid)) {
    process.kill(pid, 'SIGINT');
  }
  const startedAt = metadata.startedAt ? Date.parse(metadata.startedAt) : 0;
  const now = Date.now();
  const durationSeconds = startedAt ? Math.max(0, (now - startedAt) / 1000) : metadata.durationSeconds || null;
  const stopped = {
    ...metadata,
    stoppedAt: new Date(now).toISOString(),
    durationSeconds,
    status: fs.existsSync(paths.videoPath) && fs.statSync(paths.videoPath).size > 0 ? 'stopped' : 'stopping'
  };
  writeJson(paths.metadataPath, stopped);
  updateManifest(runDir, paths, stopped);
  console.log(JSON.stringify({ ok: true, ...stopped, fileExists: fs.existsSync(paths.videoPath) }, null, 2));
  process.exit(0);
}

if (command === 'status') {
  const metadata = readJson(paths.metadataPath);
  const alive = processAlive(metadata.pid);
  const fileExists = fs.existsSync(paths.videoPath) && fs.statSync(paths.videoPath).size > 0;
  console.log(JSON.stringify({ ok: true, alive, fileExists, ...metadata }, null, 2));
  process.exit(0);
}

usage();
process.exit(1);
