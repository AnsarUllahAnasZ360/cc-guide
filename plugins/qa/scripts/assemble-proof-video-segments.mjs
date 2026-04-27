#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  boolFlag,
  ensureDir,
  fileOk,
  readJson,
  relativeTo,
  resolveRunPath,
  run,
  updateManifestEvidence,
  valueFor,
  writeJson
} from './proof-video-utils.mjs';

const args = process.argv.slice(2);

function usage() {
  console.log(`Assemble intro + full-screen walkthrough + optional outro into a final proof video.

Usage:
  node plugins/qa/scripts/assemble-proof-video-segments.mjs <run-dir> --intro proof-video/remotion/intro.mp4 --walkthrough proof-video/raw/browser-walkthrough.webm --audio proof-video/audio/narration.mp3 --outro proof-video/remotion/outro.mp4

This script normalizes segments, adds silence where needed, attaches narration to the walkthrough, stitches with ffmpeg, validates the final MP4, and never changes QA verdicts or gates.`);
}

const runArg = args.find(arg => !arg.startsWith('--'));
if (!runArg || boolFlag(args, '--help') || boolFlag(args, '-h')) {
  usage();
  process.exit(runArg ? 0 : 1);
}

const runDir = path.resolve(runArg);
const manifest = readJson(path.join(runDir, 'manifest.json'), {});
const introPath = resolveRunPath(runDir, valueFor(args, '--intro', '') || manifest?.artifacts?.introProofVideoSegment || '');
const rawWalkthroughPath = resolveRunPath(
  runDir,
  valueFor(args, '--walkthrough', '') ||
    valueFor(args, '--raw', '') ||
    manifest?.artifacts?.rawProofVideo ||
    manifest?.proofVideoPipeline?.recording?.path ||
    'proof-video/raw/browser-walkthrough.webm'
);
const audioPath = resolveRunPath(runDir, valueFor(args, '--audio', '') || manifest?.artifacts?.narration || '');
const outroPath = resolveRunPath(runDir, valueFor(args, '--outro', '') || manifest?.artifacts?.outroProofVideoSegment || '');
const outputPath = resolveRunPath(runDir, valueFor(args, '--output', 'proof-video/final/qa-proof-video-polished.mp4'));
const workDir = ensureDir(path.join(runDir, 'proof-video', 'tmp-assembly'));
const width = Number(valueFor(args, '--width', '1280')) || 1280;
const height = Number(valueFor(args, '--height', '720')) || 720;
const fps = Number(valueFor(args, '--fps', '30')) || 30;

function ffprobe(filePath) {
  const result = run(
    'ffprobe',
    ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', filePath],
    { check: false, maxBuffer: 20 * 1024 * 1024 }
  );
  if (result.status !== 0) return null;
  return JSON.parse(result.stdout);
}

function duration(filePath) {
  const metadata = ffprobe(filePath);
  return Number(metadata?.format?.duration || metadata?.streams?.find(stream => stream.codec_type === 'video')?.duration || 0);
}

function hasAudio(filePath) {
  const metadata = ffprobe(filePath);
  return Boolean(metadata?.streams?.some(stream => stream.codec_type === 'audio'));
}

function videoFilter(extra = '') {
  return `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${fps},format=yuv420p${extra}`;
}

function normalizeSilent(input, output) {
  const inputDuration = duration(input);
  if (!inputDuration) throw new Error(`Cannot determine duration for ${input}`);
  const audioInput = ['-f', 'lavfi', '-t', String(inputDuration), '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000'];
  run(
    'ffmpeg',
    [
      '-y',
      '-i',
      input,
      ...audioInput,
      '-filter_complex',
      `[0:v]${videoFilter()}[v]`,
      '-map',
      '[v]',
      '-map',
      '1:a:0',
      '-shortest',
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '18',
      '-c:a',
      'aac',
      '-ar',
      '48000',
      '-ac',
      '2',
      '-b:a',
      '160k',
      output
    ],
    { inherit: true }
  );
}

function normalizeWalkthrough(input, audio, output) {
  const videoDuration = duration(input);
  if (!videoDuration) throw new Error(`Cannot determine walkthrough duration for ${input}`);
  if (!fileOk(audio, 1000)) {
    normalizeSilent(input, output);
    return { videoDuration, audioDuration: 0, paddedVideoSeconds: 0 };
  }
  const audioDuration = duration(audio);
  const padSeconds = Math.max(0, audioDuration - videoDuration);
  const padFilter = padSeconds > 0.25 ? `,tpad=stop_mode=clone:stop_duration=${padSeconds.toFixed(3)}` : '';
  const command = [
    '-y',
    '-i',
    input,
    '-i',
    audio,
    '-filter_complex',
    `[0:v]${videoFilter(padFilter)}[v]`,
    '-map',
    '[v]',
    '-map',
    '1:a:0',
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '18',
    '-c:a',
    'aac',
    '-ar',
    '48000',
    '-ac',
    '2',
    '-b:a',
    '160k'
  ];
  command.push(output);
  run('ffmpeg', command, { inherit: true });
  return { videoDuration, audioDuration, paddedVideoSeconds: padSeconds };
}

function concatSegments(inputs, output) {
  const listPath = path.join(workDir, 'concat-list.txt');
  fs.writeFileSync(listPath, inputs.map(file => `file '${file.replaceAll("'", "'\\''")}'`).join('\n'));
  ensureDir(path.dirname(output));
  run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', output], { inherit: true });
}

try {
  if (!fileOk(rawWalkthroughPath, 10000)) throw new Error(`Missing raw walkthrough video: ${rawWalkthroughPath}`);
  const normalized = [];
  if (fileOk(introPath, 50000)) {
    const target = path.join(workDir, 'intro-normalized.mp4');
    hasAudio(introPath) ? normalizeSilent(introPath, target) : normalizeSilent(introPath, target);
    normalized.push(target);
  }
  const walkthroughTarget = path.join(workDir, 'walkthrough-normalized.mp4');
  const walkthroughTiming = normalizeWalkthrough(rawWalkthroughPath, audioPath, walkthroughTarget);
  normalized.push(walkthroughTarget);
  if (fileOk(outroPath, 50000)) {
    const target = path.join(workDir, 'outro-normalized.mp4');
    normalizeSilent(outroPath, target);
    normalized.push(target);
  }
  concatSegments(normalized, outputPath);
  if (!fileOk(outputPath, 100000)) throw new Error(`Final stitched video was not created: ${outputPath}`);
  const metadata = {
    status: 'assembled',
    assembler: 'ffmpeg',
    outputPath: relativeTo(runDir, outputPath),
    introPath: introPath ? relativeTo(runDir, introPath) : null,
    rawWalkthroughPath: relativeTo(runDir, rawWalkthroughPath),
    audioPath: audioPath && fileOk(audioPath, 1000) ? relativeTo(runDir, audioPath) : null,
    outroPath: outroPath && fileOk(outroPath, 50000) ? relativeTo(runDir, outroPath) : null,
    normalizedSegments: normalized.map(file => relativeTo(runDir, file)),
    durationSeconds: duration(outputPath),
    walkthroughTiming,
    assembledAt: new Date().toISOString()
  };
  const metadataPath = path.join(runDir, 'proof-video', 'final', 'assembly-metadata.json');
  writeJson(metadataPath, metadata);
  updateManifestEvidence(runDir, manifestValue => {
    manifestValue.artifacts = manifestValue.artifacts || {};
    manifestValue.proofVideoPipeline = manifestValue.proofVideoPipeline || {};
    manifestValue.artifacts.polishedProofVideo = relativeTo(runDir, outputPath);
    manifestValue.artifacts.proofVideoAssemblyMetadata = relativeTo(runDir, metadataPath);
    manifestValue.proofVideoPipeline.assembly = metadata;
    return manifestValue;
  });
  run('node', [path.join(path.dirname(new URL(import.meta.url).pathname), 'validate-proof-video.mjs'), runDir, '--kind', 'final', '--video', outputPath], {
    inherit: true
  });
  console.log(JSON.stringify({ ok: true, ...metadata }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
