#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  boolFlag,
  commandStatus,
  copyRecursive,
  ensureDir,
  fileOk,
  numberFor,
  readJson,
  relativeTo,
  resolveRunPath,
  run,
  scriptPaths,
  updateManifestEvidence,
  valueFor,
  writeJson
} from './proof-video-utils.mjs';

const args = process.argv.slice(2);
const { remotionTemplateDir } = scriptPaths(import.meta.url);

function usage() {
  console.log(`Render a Remotion proof video around a raw Playwright walkthrough.

Usage:
  node plugins/qa/scripts/render-remotion-proof-video.mjs <run-dir> [--raw proof-video/raw/browser-walkthrough.webm] [--skip-final-validation]

Uses the raw Playwright video as the main segment, adds intro/chapter/evidence/outro cards, and appends render metadata without changing QA verdicts or gates.`);
}

const runArg = args.find(arg => !arg.startsWith('--'));
if (!runArg || boolFlag(args, '--help') || boolFlag(args, '-h')) {
  usage();
  process.exit(runArg ? 0 : 1);
}

const runDir = path.resolve(runArg);
const manifest = readJson(path.join(runDir, 'manifest.json'), {});
const workDir = path.resolve(valueFor(args, '--work-dir', path.join(runDir, '.qa-video-remotion')));
const outputPath = path.resolve(valueFor(args, '--output', path.join(runDir, 'proof-video', 'final', 'qa-proof-video.mp4')));
const rawPath = resolveRunPath(
  runDir,
  valueFor(args, '--raw', '') ||
    manifest?.artifacts?.rawProofVideo ||
    manifest?.proofVideoPipeline?.recording?.path ||
    'proof-video/raw/browser-walkthrough.webm'
);
const audioPath = resolveRunPath(runDir, valueFor(args, '--audio', '') || manifest?.artifacts?.narration || '');
const captionsPath = resolveRunPath(runDir, valueFor(args, '--captions', '') || manifest?.artifacts?.narrationCaptions || '');
const validationKind = valueFor(args, '--validation-kind', 'final');
const skipFinalValidation = boolFlag(args, '--skip-final-validation');

function ffprobeDuration(filePath) {
  if (!fileOk(filePath)) return null;
  const result = run(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', filePath],
    { check: false }
  );
  const value = Number(String(result.stdout || '').trim());
  return Number.isFinite(value) && value > 0 ? value : null;
}

function listFilesRecursive(dir, pattern) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...listFilesRecursive(full, pattern));
    if (entry.isFile() && pattern.test(entry.name) && fs.statSync(full).size > 0) results.push(full);
  }
  return results;
}

function inferChecks(value) {
  if (Array.isArray(value)) return value.slice(0, 8);
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .slice(0, 8)
      .map(([name, status]) => `${name}: ${typeof status === 'object' ? status.status || 'recorded' : status}`);
  }
  return [];
}

function narrationSegmentsFromCaptions() {
  if (!captionsPath || !fs.existsSync(captionsPath)) return [];
  const text = fs.readFileSync(captionsPath, 'utf8');
  const cues = text
    .split(/\n\n+/)
    .map(block => block.trim())
    .filter(block => block.includes('-->'))
    .slice(0, 12);
  return cues.map((cue, index) => {
    const lines = cue.split('\n');
    const timing = lines.find(line => line.includes('-->')) || '';
    const start = timing.split('-->')[0]?.trim() || '00:00:00.000';
    const parts = start.split(/[:.]/).map(Number);
    const startSeconds = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0) + (parts[3] || 0) / 1000;
    return {
      startSeconds,
      chapter: index === 0 ? 'Context' : index === cues.length - 1 ? 'Closeout' : `Evidence ${index}`,
      text: lines.slice(lines.indexOf(timing) + 1).join(' '),
      file: ''
    };
  });
}

try {
  if (!fs.existsSync(remotionTemplateDir)) throw new Error(`Remotion template not found: ${remotionTemplateDir}`);
  if (!fileOk(rawPath, 10000)) throw new Error(`Raw Playwright walkthrough video is missing or too small: ${rawPath}`);
  if (!commandStatus('ffprobe', ['-version']).ok) throw new Error('ffprobe is required before rendering proof video.');
  const durationSeconds = numberFor(args, '--walkthrough-duration', null) || ffprobeDuration(rawPath) || 12;
  const fps = Math.max(1, numberFor(args, '--fps', 30) || 30);
  const smoke = boolFlag(args, '--smoke');
  const introSeconds = Math.max(1, numberFor(args, '--intro-seconds', smoke ? 3 : 8) || 8);
  const outroSeconds = Math.max(1, numberFor(args, '--outro-seconds', smoke ? 3 : 8) || 8);
  const walkthroughSeconds = Math.max(1, numberFor(args, '--walkthrough-seconds', durationSeconds) || durationSeconds);
  const totalSeconds = introSeconds + walkthroughSeconds + outroSeconds;

  fs.rmSync(workDir, { recursive: true, force: true });
  copyRecursive(remotionTemplateDir, workDir);
  const publicAssets = ensureDir(path.join(workDir, 'public', 'assets'));
  const rawAssetName = `walkthrough${path.extname(rawPath) || '.webm'}`;
  copyRecursive(rawPath, path.join(publicAssets, rawAssetName));
  const screenshots = [];
  for (const [index, screenshot] of listFilesRecursive(path.join(runDir, 'proof-video', 'screenshots'), /\.(png|jpe?g)$/i)
    .concat(listFilesRecursive(path.join(runDir, 'screenshots'), /\.(png|jpe?g)$/i))
    .slice(0, 8)
    .entries()) {
    const target = `screenshot-${String(index + 1).padStart(2, '0')}${path.extname(screenshot).toLowerCase()}`;
    copyRecursive(screenshot, path.join(publicAssets, target));
    screenshots.push(`assets/${target}`);
  }

  let hasAudio = false;
  if (audioPath && fileOk(audioPath, 1000)) {
    copyRecursive(audioPath, path.join(publicAssets, 'narration.mp3'));
    hasAudio = true;
  }

  const proofData = {
    title: manifest.taskSummary || 'QA proof walkthrough',
    verdict: manifest.finalVerdict || manifest.verdict || 'QA evidence recorded',
    statusLabel: 'evidence recorded',
    durationInFrames: Math.ceil(totalSeconds * fps),
    fps,
    screenshots,
    walkthrough: {
      src: `assets/${rawAssetName}`,
      durationSeconds: walkthroughSeconds,
      sourceDurationSeconds: durationSeconds,
      assembledFromFrames: false
    },
    walkthroughVideo: `assets/${rawAssetName}`,
    walkthroughFrames: [],
    walkthroughFrameFps: 6,
    recordingSource: {
      kind: 'playwright-context-video',
      path: relativeTo(runDir, rawPath),
      durationSeconds
    },
    walkthroughDurationSeconds: walkthroughSeconds,
    timing: {
      introSeconds,
      walkthroughSeconds,
      outroSeconds,
      targetProofVideoSeconds: { min: 0, max: 1800 },
      smokeMode: smoke,
      durationOverrideSeconds: null
    },
    proofVideoPolicy: {
      primaryEvidence: 'playwright-context-video',
      screenshotRole: 'supporting-chapter-evidence',
      requiresPassingVerdict: false,
      requiresWalkthroughRecording: true,
      allowNonPassingReport: false,
      allowFrameRecording: false,
      cleanGates: null,
      passingVerdict: null
    },
    gateSummary: {},
    hasAudio,
    narrationSegments: narrationSegmentsFromCaptions(),
    routesTested: manifest.routesTested || [],
    commandsRun: manifest.commandsRun || [],
    checks: inferChecks(manifest.checks),
    blockers: manifest.blockers || [],
    reportSummary: ''
  };
  writeJson(path.join(workDir, 'src', 'proof-data.ts'), proofData);
  fs.writeFileSync(
    path.join(workDir, 'src', 'proof-data.ts'),
    `export const proofData = ${JSON.stringify(proofData, null, 2)} as const;\n`
  );

  if (!fs.existsSync(path.join(workDir, 'node_modules'))) {
    run('npm', ['install', '--silent'], { cwd: workDir, inherit: true });
  }
  ensureDir(path.dirname(outputPath));
  run('npx', ['remotion', 'render', 'QAVideo', outputPath, '--codec=h264', '--audio-codec=aac', '--overwrite', '--log=warn'], {
    cwd: workDir,
    inherit: true
  });
  if (!fileOk(outputPath, 100000)) throw new Error(`Remotion did not create a valid proof video: ${outputPath}`);

  const renderMetadata = {
    status: 'rendered',
    renderer: 'remotion',
    template: 'qa-proof-video-template',
    rawVideo: relativeTo(runDir, rawPath),
    outputPath: relativeTo(runDir, outputPath),
    durationSeconds: totalSeconds,
    sourceDurationSeconds: durationSeconds,
    hasAudio,
    renderedAt: new Date().toISOString()
  };
  const metadataPath = path.join(runDir, 'proof-video', 'final', 'render-metadata.json');
  writeJson(metadataPath, renderMetadata);
  updateManifestEvidence(runDir, manifestValue => {
    manifestValue.artifacts = manifestValue.artifacts || {};
    manifestValue.proofVideoPipeline = manifestValue.proofVideoPipeline || {};
    manifestValue.artifacts.proofVideo = relativeTo(runDir, outputPath);
    manifestValue.artifacts.proofVideoRenderMetadata = relativeTo(runDir, metadataPath);
    manifestValue.proofVideoPipeline.render = renderMetadata;
    return manifestValue;
  });

  if (!skipFinalValidation) {
    run('node', [path.join(path.dirname(new URL(import.meta.url).pathname), 'validate-proof-video.mjs'), runDir, '--kind', validationKind, '--video', outputPath], {
      cwd: process.cwd(),
      inherit: true
    });
  }

  console.log(JSON.stringify({ ok: true, ...renderMetadata }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
