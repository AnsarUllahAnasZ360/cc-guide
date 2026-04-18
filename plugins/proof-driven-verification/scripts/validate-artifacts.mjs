#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const json = args.includes('--json');
const artifactArg = args.find(arg => !arg.startsWith('--'));

if (args.includes('--help')) {
  console.log('Usage: node plugins/proof-driven-verification/scripts/validate-artifacts.mjs <artifact-dir> [--json]');
  process.exit(0);
}

if (!artifactArg) {
  console.log('Usage: node plugins/proof-driven-verification/scripts/validate-artifacts.mjs <artifact-dir> [--json]');
  process.exit(1);
}

const artifactDir = path.resolve(artifactArg);
const errors = [];
const warnings = [];

function requireFile(relativePath, allowEmpty = false) {
  const filePath = path.join(artifactDir, relativePath);
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

function requireDir(relativePath) {
  const dirPath = path.join(artifactDir, relativePath);
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    errors.push(`Missing directory: ${relativePath}`);
    return [];
  }
  return fs.readdirSync(dirPath).map(name => path.join(dirPath, name));
}

function ffprobe(filePath) {
  const result = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size', '-of', 'json', filePath], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    errors.push(`ffprobe failed for ${path.relative(artifactDir, filePath)}: ${result.stderr.trim()}`);
    return null;
  }
  try {
    const parsed = JSON.parse(result.stdout);
    const duration = Number(parsed?.format?.duration || 0);
    const size = Number(parsed?.format?.size || 0);
    if (!duration || duration <= 0) errors.push(`No duration for ${path.relative(artifactDir, filePath)}`);
    if (!size || size <= 0) errors.push(`No media size for ${path.relative(artifactDir, filePath)}`);
    return { duration, size };
  } catch (error) {
    errors.push(`Could not parse ffprobe output for ${path.relative(artifactDir, filePath)}`);
    return null;
  }
}

requireFile('verification-report.md');
const manifestFile = requireFile('manifest.json');
requireFile('logs/browser-console.txt', true);
requireFile('logs/browser-errors.txt', true);
requireFile('logs/network-requests.txt', true);

const screenshots = requireDir('screenshots').filter(file => /\.(png|jpe?g)$/i.test(file));
const videos = requireDir('videos').filter(file => /\.(webm|mp4|mov)$/i.test(file));

if (screenshots.length === 0) errors.push('No screenshots found under screenshots/');
if (videos.length === 0) errors.push('No videos found under videos/');

for (const file of screenshots) {
  if (fs.statSync(file).size === 0) errors.push(`Empty screenshot: ${path.relative(artifactDir, file)}`);
}

for (const file of videos) {
  ffprobe(file);
}

const proofVideo = path.join(artifactDir, 'proof-video.mp4');
if (fs.existsSync(proofVideo)) {
  ffprobe(proofVideo);
} else {
  warnings.push('proof-video.mp4 not present; raw evidence only');
}

const requiredManifestFields = [
  'taskSummary',
  'gitBase',
  'gitHead',
  'changedFileCount',
  'reviewerShardCount',
  'commandsRun',
  'routesTested',
  'artifacts',
  'finalVerdict',
  'blockers',
  'commitHash',
];

if (manifestFile) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestFile.path, 'utf8'));
    for (const field of requiredManifestFields) {
      if (!(field in manifest)) errors.push(`manifest.json missing field: ${field}`);
    }
  } catch (error) {
    errors.push(`manifest.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const result = {
  ok: errors.length === 0,
  artifactDir,
  errors,
  warnings,
  screenshots: screenshots.map(file => path.relative(artifactDir, file)),
  videos: videos.map(file => path.relative(artifactDir, file)),
};

if (json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`Artifact validation: ${result.ok ? 'PASS' : 'FAIL'}`);
  for (const error of errors) console.log(`[FAIL] ${error}`);
  for (const warning of warnings) console.log(`[WARN] ${warning}`);
  if (result.ok) {
    console.log(`Screenshots: ${result.screenshots.length}`);
    console.log(`Videos: ${result.videos.length}`);
  }
}

process.exit(result.ok ? 0 : 1);
