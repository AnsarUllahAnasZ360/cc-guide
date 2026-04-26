#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const json = args.includes('--json');
const runArg = args.find(arg => !arg.startsWith('--'));
const allowNonPassingReport = args.includes('--allow-non-passing-report');
const allowFrameRecording = args.includes('--allow-frame-recording');

if (!runArg || args.includes('--help')) {
  console.log('Usage: node plugins/qa/scripts/validate-qa-artifacts.mjs <run-dir> [--json] [--allow-non-passing-report] [--allow-frame-recording]');
  process.exit(runArg ? 0 : 1);
}

const runDir = path.resolve(runArg);
const errors = [];
const warnings = [];

function exists(relativePath) {
  return fs.existsSync(path.join(runDir, relativePath));
}

function resolveRunPath(relativePath) {
  if (!relativePath || typeof relativePath !== 'string') return null;
  return path.isAbsolute(relativePath) ? relativePath : path.join(runDir, relativePath);
}

function requireFile(relativePath, allowEmpty = false) {
  const filePath = path.join(runDir, relativePath);
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing file: ${relativePath}`);
    return null;
  }
  const stat = fs.statSync(filePath);
  if (!allowEmpty && stat.size === 0) {
    errors.push(`Empty file: ${relativePath}`);
  }
  return { path: filePath, size: stat.size };
}

function listFiles(relativePath, pattern) {
  const dirPath = path.join(runDir, relativePath);
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    errors.push(`Missing directory: ${relativePath}`);
    return [];
  }
  return fs
    .readdirSync(dirPath)
    .filter(name => pattern.test(name))
    .map(name => path.join(relativePath, name));
}

function listFilesRecursive(relativePath, pattern) {
  const dirPath = path.isAbsolute(relativePath) ? relativePath : path.join(runDir, relativePath);
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) return [];
  const files = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(fullPath, pattern));
    } else if (entry.isFile() && pattern.test(entry.name) && fs.statSync(fullPath).size > 0) {
      files.push(fullPath);
    }
  }
  return files;
}

function fileOk(filePath) {
  return Boolean(filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile() && fs.statSync(filePath).size > 0);
}

function fieldText(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'pass' : 'fail';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    return fieldText(value.status || value.verdict || value.result || value.state || value.outcome || '');
  }
  return String(value);
}

function isPassingVerdict(manifest) {
  const verdict = fieldText(manifest?.verdict || manifest?.finalVerdict || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return ['pass', 'passed', 'merge', 'merged', 'merge ready', 'ready to merge', 'clean pass', 'clean merge'].includes(verdict);
}

function gateEntries(gates) {
  if (!gates) return [];
  if (Array.isArray(gates)) return gates.map((gate, index) => [String(gate?.name || gate?.id || index), gate]);
  if (typeof gates === 'object') return Object.entries(gates);
  return [['gates', gates]];
}

function hasCleanGates(manifest) {
  const entries = gateEntries(manifest?.gates);
  if (entries.length === 0) return true;
  return entries.every(([, value]) => {
    const status = fieldText(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    return Boolean(
      status &&
        !status.includes('fail') &&
        !status.includes('block') &&
        !status.includes('partial') &&
        !status.includes('pending') &&
        status !== 'unknown' &&
        status !== 'error'
    );
  });
}

function readJson(filePath) {
  if (!fileOk(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function recordingFromValue(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    const filePath = resolveRunPath(value);
    if (fileOk(filePath) && /\.(mp4|webm|mov|m4v)$/i.test(filePath)) return { type: 'video', path: filePath };
    if (fileOk(filePath) && /\.json$/i.test(filePath)) return recordingFromMetadata(filePath, readJson(filePath));
    return null;
  }
  if (typeof value !== 'object') return null;
  const videoPath = resolveRunPath(value.path || value.videoPath || value.video || value.file || value.src);
  if (fileOk(videoPath) && /\.(mp4|webm|mov|m4v)$/i.test(videoPath)) return { type: 'video', path: videoPath };
  const metadataPath = resolveRunPath(value.metadataPath || value.manifestPath || value.path);
  if (metadataPath && /\.json$/i.test(metadataPath)) return recordingFromMetadata(metadataPath, readJson(metadataPath));
  return null;
}

function recordingFromMetadata(metadataPath, metadata) {
  if (!metadata) return null;
  const videoPath = resolveRunPath(metadata.videoPath);
  if (fileOk(videoPath)) return { type: 'video', path: videoPath, metadataPath };
  const framesDir = resolveRunPath(metadata.framesDirectory);
  const frames = framesDir ? listFilesRecursive(framesDir, /\.(png|jpe?g)$/i) : [];
  if (frames.length > 0) return { type: 'frame-recording', path: metadataPath, frames };
  return null;
}

function findWalkthroughRecording(manifest) {
  const candidates = [
    manifest?.recordings?.walkthrough,
    manifest?.recordings?.browserWalkthrough,
    manifest?.recordings?.primary,
    manifest?.artifacts?.walkthroughRecording,
    manifest?.artifacts?.recording
  ];
  if (Array.isArray(manifest?.recordings)) {
    candidates.push(...manifest.recordings);
  }
  for (const candidate of candidates) {
    const recording = recordingFromValue(candidate);
    if (recording) return recording;
  }
  const video = listFilesRecursive('recordings', /\.(mp4|webm|mov|m4v)$/i)[0];
  if (video) return { type: 'video', path: video };
  for (const metadataPath of listFilesRecursive('recordings', /\.json$/i)) {
    const recording = recordingFromMetadata(metadataPath, readJson(metadataPath));
    if (recording) return recording;
  }
  return null;
}

function proofVideoPath(manifest) {
  return (
    resolveRunPath(manifest?.proofVideo) ||
    resolveRunPath(manifest?.artifacts?.proofVideo) ||
    path.join(runDir, 'qa-proof-video.mp4')
  );
}

requireFile('verification-report.md');
const manifestFile = requireFile('manifest.json');
const screenshots = listFiles('screenshots', /\.(png|jpe?g)$/i);

if (screenshots.length === 0) {
  errors.push('No screenshots found under screenshots/');
}

for (const screenshot of screenshots) {
  const stat = fs.statSync(path.join(runDir, screenshot));
  if (stat.size === 0) errors.push(`Empty screenshot: ${screenshot}`);
}

if (!exists('logs')) {
  errors.push('Missing directory: logs');
}

const videoPath = path.join(runDir, 'qa-proof-video.mp4');
if (fs.existsSync(videoPath)) {
  if (fs.statSync(videoPath).size === 0) errors.push('Empty proof video: qa-proof-video.mp4');
} else {
  warnings.push('qa-proof-video.mp4 not present');
}

const requiredFields = [
  'taskSummary',
  'runId',
  'createdAt',
  'cwd',
  'gitBranch',
  'gitHead',
  'mode',
  'sprintFolder',
  'commandsRun',
  'routesTested',
  'checks',
  'verdict',
  'gates',
  'recordings',
  'proofVideo',
  'videoDecision',
  'videoDecisionReason',
  'proofVideoPolicy',
  'walkthroughDurationSeconds',
  'artifacts',
  'finalVerdict',
  'blockers',
  'commitHash'
];

if (manifestFile) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestFile.path, 'utf8'));
    for (const field of requiredFields) {
      if (!(field in manifest)) warnings.push(`manifest.json missing field: ${field}`);
    }
    const policyAllowsReportOnly =
      allowNonPassingReport ||
      manifest?.proofVideoPolicy?.allowNonPassingReport === true ||
      manifest?.proofVideoPolicy?.mode === 'report-only';
    const passingVerdict = isPassingVerdict(manifest);
    const cleanGates = hasCleanGates(manifest);
    const proofReady = passingVerdict && cleanGates;
    const recording = findWalkthroughRecording(manifest);
    const manifestProofVideo = proofVideoPath(manifest);
    const hasProofVideo = fileOk(manifestProofVideo);

    if (proofReady || policyAllowsReportOnly) {
      if (!recording && !policyAllowsReportOnly) {
        errors.push('Missing browser walkthrough recording under manifest.recordings/artifacts or recordings/');
      } else if (recording?.type === 'frame-recording') {
        const message = `Walkthrough recording uses high-frequency Browser Use frames: ${path.relative(runDir, recording.path)}`;
        if (allowFrameRecording || manifest?.proofVideoPolicy?.allowFrameRecording === true) {
          warnings.push(message);
        } else {
          errors.push(`${message}. Founder proof video requires an actual recorded video file.`);
        }
      }
      if (!hasProofVideo) {
        errors.push(`Missing or empty proof video: ${path.relative(runDir, manifestProofVideo)}`);
      }
    } else {
      if (hasProofVideo && !policyAllowsReportOnly) {
        errors.push('Proof video exists even though verdict/gates are not PASS/MERGE.');
      }
      warnings.push(
        `No founder proof video expected because verdict/gates are not clean (${manifest.verdict || manifest.finalVerdict || 'missing'}).`
      );
    }
  } catch (error) {
    errors.push(`manifest.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const result = {
  ok: errors.length === 0,
  runDir,
  errors,
  warnings,
  screenshots
};

if (json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`QA artifact validation: ${result.ok ? 'PASS' : 'FAIL'}`);
  for (const error of errors) console.log(`[FAIL] ${error}`);
  for (const warning of warnings) console.log(`[WARN] ${warning}`);
}

process.exit(result.ok ? 0 : 1);
