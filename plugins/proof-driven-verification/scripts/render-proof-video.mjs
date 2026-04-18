#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const rawArgs = process.argv.slice(2);
const artifactArg = rawArgs.find(arg => !arg.startsWith('--'));
const skipTts = rawArgs.includes('--skip-tts');
const dryRun = rawArgs.includes('--dry-run');
const voiceModel =
  rawArgs.find(arg => arg.startsWith('--voice-model='))?.split('=', 2)[1] ||
  process.env.DEEPGRAM_MODEL ||
  'aura-2-odysseus-en';

if (rawArgs.includes('--help')) {
  console.log('Usage: node plugins/proof-driven-verification/scripts/render-proof-video.mjs <artifact-dir> [--skip-tts] [--voice-model=aura-2-odysseus-en] [--dry-run]');
  process.exit(0);
}

if (!artifactArg) {
  console.log('Usage: node plugins/proof-driven-verification/scripts/render-proof-video.mjs <artifact-dir> [--skip-tts] [--voice-model=aura-2-odysseus-en] [--dry-run]');
  process.exit(1);
}

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const pluginRoot = path.resolve(scriptDir, '..');
const templateDir = path.join(pluginRoot, 'assets/remotion-template');
const artifactDir = path.resolve(artifactArg);
const workDir = path.join(artifactDir, '.proof-video-remotion');
const outputPath = path.join(artifactDir, 'proof-video.mp4');

function run(command, args = [], options = {}) {
  const rendered = [command, ...args].join(' ');
  if (dryRun) {
    console.log(`[dry-run] ${rendered}`);
    return { status: 0, stdout: '', stderr: '' };
  }
  console.log(`[run] ${rendered}`);
  const result = spawnSync(command, args, {
    cwd: options.cwd || artifactDir,
    encoding: 'utf8',
    stdio: options.inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${rendered}\n${result.stderr || ''}`);
  }
  return result;
}

function has(command, args = ['--version']) {
  return spawnSync(command, args, { stdio: 'ignore' }).status === 0;
}

function deepgramKey() {
  if (process.env.DEEPGRAM_API_KEY) return process.env.DEEPGRAM_API_KEY;
  const result = spawnSync('node', [path.join(pluginRoot, 'scripts/deepgram-key.mjs'), 'get'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return result.status === 0 ? result.stdout.trim() : '';
}

function copyRecursive(source, target) {
  const base = path.basename(source);
  if (base === 'node_modules' || base === '.git' || base === '.turbo' || base === 'dist') {
    return;
  }
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
    return;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function listFiles(dir, pattern) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(name => pattern.test(name))
    .map(name => path.join(dir, name))
    .filter(file => fs.statSync(file).isFile() && fs.statSync(file).size > 0);
}

function readManifest() {
  const filePath = path.join(artifactDir, 'manifest.json');
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function summarizeReport() {
  const report = path.join(artifactDir, 'verification-report.md');
  if (!fs.existsSync(report)) return '';
  return fs.readFileSync(report, 'utf8').replace(/\s+/g, ' ').slice(0, 900);
}

function ensureNarration() {
  const narrationText = path.join(artifactDir, 'narration.txt');
  const narrationAudio = path.join(artifactDir, 'narration.mp3');
  if (!fs.existsSync(narrationText)) {
    const manifest = readManifest();
    const fallback = [
      manifest?.taskSummary || 'This proof video summarizes a verification run.',
      `Final verdict: ${manifest?.finalVerdict || 'unknown'}.`,
      summarizeReport() || 'Review the attached report and browser evidence for details.',
    ].join('\n\n');
    fs.writeFileSync(narrationText, fallback);
  }
  if (fs.existsSync(narrationAudio) || skipTts) {
    return fs.existsSync(narrationAudio);
  }
  const key = deepgramKey();
  if (!key || !has('dg')) {
    console.warn('[warn] Deepgram key or dg CLI missing; rendering silent proof video.');
    return false;
  }
  const previousKey = process.env.DEEPGRAM_API_KEY;
  process.env.DEEPGRAM_API_KEY = key;
  run('dg', ['speak', '--file', narrationText, '-m', voiceModel, '-o', narrationAudio, '--encoding', 'mp3'], {
    cwd: artifactDir,
    inherit: true,
  });
  if (previousKey === undefined) {
    delete process.env.DEEPGRAM_API_KEY;
  } else {
    process.env.DEEPGRAM_API_KEY = previousKey;
  }
  return fs.existsSync(narrationAudio) && fs.statSync(narrationAudio).size > 0;
}

function updateManifest(proofVideoPath) {
  const manifestPath = path.join(artifactDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return;
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.artifacts = manifest.artifacts || {};
    manifest.artifacts.proofVideo = path.relative(artifactDir, proofVideoPath);
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  } catch {
    console.warn('[warn] Could not update manifest.json with proofVideo path.');
  }
}

if (!fs.existsSync(artifactDir)) {
  console.error(`Artifact directory not found: ${artifactDir}`);
  process.exit(1);
}
if (!fs.existsSync(templateDir)) {
  console.error(`Remotion template not found: ${templateDir}`);
  process.exit(1);
}

try {
  const screenshotFiles = [
    ...listFiles(path.join(artifactDir, 'screenshots'), /\.(png|jpe?g)$/i),
    ...listFiles(artifactDir, /\.(png|jpe?g)$/i),
  ].slice(0, 8);
  const videoFiles = [
    ...listFiles(path.join(artifactDir, 'videos'), /\.(webm|mp4|mov)$/i),
    ...listFiles(artifactDir, /\.(webm|mp4|mov)$/i),
  ].filter(file => path.basename(file) !== 'proof-video.mp4').slice(0, 2);

  if (screenshotFiles.length === 0 && videoFiles.length === 0) {
    throw new Error('No screenshots or videos found to render.');
  }

  const hasAudio = ensureNarration();
  if (!dryRun) {
    fs.rmSync(workDir, { recursive: true, force: true });
    copyRecursive(templateDir, workDir);
  }

  const publicAssetDir = path.join(workDir, 'public/assets');
  fs.mkdirSync(publicAssetDir, { recursive: true });
  const screenshots = [];
  const videos = [];

  for (const [index, file] of screenshotFiles.entries()) {
    const targetName = `screenshot-${index + 1}${path.extname(file).toLowerCase()}`;
    copyRecursive(file, path.join(publicAssetDir, targetName));
    screenshots.push(`assets/${targetName}`);
  }
  for (const [index, file] of videoFiles.entries()) {
    const targetName = `video-${index + 1}${path.extname(file).toLowerCase()}`;
    copyRecursive(file, path.join(publicAssetDir, targetName));
    videos.push(`assets/${targetName}`);
  }
  if (hasAudio) {
    copyRecursive(path.join(artifactDir, 'narration.mp3'), path.join(publicAssetDir, 'narration.mp3'));
  }

  const manifest = readManifest() || {};
  const proofData = {
    title: manifest.taskSummary || 'Proof-driven verification',
    verdict: manifest.finalVerdict || 'unknown',
    durationInFrames: hasAudio ? 2580 : 900,
    fps: 30,
    screenshots,
    videos,
    hasAudio,
    routesTested: manifest.routesTested || [],
    commandsRun: manifest.commandsRun || [],
    blockers: manifest.blockers || [],
  };
  fs.writeFileSync(
    path.join(workDir, 'src/proof-data.ts'),
    `export const proofData = ${JSON.stringify(proofData, null, 2)} as const;\n`
  );

  if (!fs.existsSync(path.join(workDir, 'node_modules'))) {
    run('npm', ['install', '--silent'], { cwd: workDir, inherit: true });
  }

  run('npx', ['remotion', 'render', 'ProofVideo', outputPath, '--codec=h264', '--audio-codec=aac', '--overwrite', '--log=warn'], {
    cwd: workDir,
    inherit: true,
  });

  if (has('ffprobe', ['-version'])) {
    run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size', '-of', 'json', outputPath]);
  }
  updateManifest(outputPath);
  console.log(`Proof video written: ${outputPath}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
