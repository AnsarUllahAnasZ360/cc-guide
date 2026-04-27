#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  boolFlag,
  commandStatus,
  ensureDir,
  fileOk,
  numberFor,
  readJson,
  relativeTo,
  resolveRunPath,
  run,
  safeName,
  updateManifestEvidence,
  valueFor,
  writeJson
} from './proof-video-utils.mjs';

const args = process.argv.slice(2);

function usage() {
  console.log(`Validate a raw or final proof video.

Usage:
  node plugins/qa/scripts/validate-proof-video.mjs <run-dir> --kind raw
  node plugins/qa/scripts/validate-proof-video.mjs <run-dir> --video proof-video/final/qa-proof-video.mp4 --kind final

Checks file size, duration, resolution, first/middle/last frame variance, execution log coverage, final URL/state expectations, and about:blank endings.`);
}

const runArg = args.find(arg => !arg.startsWith('--'));
if (!runArg || boolFlag(args, '--help') || boolFlag(args, '-h')) {
  usage();
  process.exit(runArg ? 0 : 1);
}

const runDir = path.resolve(runArg);
const kind = valueFor(args, '--kind', 'raw');
const manifest = readJson(path.join(runDir, 'manifest.json'), {});
const planPath = resolveRunPath(
  runDir,
  valueFor(
    args,
    '--plan',
    manifest?.proofVideoPipeline?.walkthroughPlan ||
      manifest?.artifacts?.proofWalkthroughPlan ||
      'proof-video/plans/proof-walkthrough.plan.json'
  )
);
const plan = readJson(planPath, {});
const logPath = resolveRunPath(
  runDir,
  valueFor(
    args,
    '--log',
    manifest?.artifacts?.playwrightExecutionLog ||
      manifest?.proofVideoPipeline?.recording?.executionLog ||
      'proof-video/logs/playwright-proof-walkthrough.json'
  )
);

function videoPathFromManifest() {
  if (valueFor(args, '--video', '')) return resolveRunPath(runDir, valueFor(args, '--video'));
  if (kind === 'final') {
    return (
      resolveRunPath(runDir, manifest?.artifacts?.proofVideo) ||
      resolveRunPath(runDir, manifest?.proofVideoPipeline?.render?.outputPath) ||
      path.join(runDir, 'proof-video', 'final', 'qa-proof-video.mp4')
    );
  }
  return (
    resolveRunPath(runDir, manifest?.artifacts?.rawProofVideo) ||
    resolveRunPath(runDir, manifest?.proofVideoPipeline?.recording?.path) ||
    path.join(runDir, 'proof-video', 'raw', 'browser-walkthrough.webm')
  );
}

function ffprobe(filePath) {
  const result = run(
    'ffprobe',
    [
      '-v',
      'error',
      '-print_format',
      'json',
      '-show_format',
      '-show_streams',
      filePath
    ],
    { check: false, maxBuffer: 20 * 1024 * 1024 }
  );
  if (result.status !== 0) return null;
  return JSON.parse(result.stdout);
}

function videoStream(metadata) {
  return (metadata?.streams || []).find(stream => stream.codec_type === 'video') || null;
}

function extractFramePng(filePath, seconds, outputPath) {
  run('ffmpeg', ['-y', '-ss', String(Math.max(0, seconds)), '-i', filePath, '-frames:v', '1', outputPath], {
    check: false
  });
  return fileOk(outputPath, 1000);
}

function rawFrameStats(filePath, seconds) {
  const result = run(
    'ffmpeg',
    [
      '-v',
      'error',
      '-ss',
      String(Math.max(0, seconds)),
      '-i',
      filePath,
      '-frames:v',
      '1',
      '-vf',
      'scale=64:36,format=rgb24',
      '-f',
      'rawvideo',
      'pipe:1'
    ],
    { check: false, encoding: false, maxBuffer: 2 * 1024 * 1024 }
  );
  if (result.status !== 0 || !result.stdout || result.stdout.length === 0) {
    return { ok: false, mean: 0, variance: 0, bytes: 0 };
  }
  const buffer = Buffer.from(result.stdout);
  let sum = 0;
  let sumSquares = 0;
  for (const value of buffer) {
    sum += value;
    sumSquares += value * value;
  }
  const mean = sum / buffer.length;
  const variance = sumSquares / buffer.length - mean * mean;
  return {
    ok: true,
    mean,
    variance,
    bytes: buffer.length,
    blankLike: variance < 4 || mean < 2 || mean > 253
  };
}

function validateExecutionLog(errors, warnings) {
  if (!logPath || !fs.existsSync(logPath)) {
    if (kind === 'raw') errors.push('Missing Playwright execution log.');
    return null;
  }
  const log = readJson(logPath, null);
  if (!log) {
    errors.push('Playwright execution log is not valid JSON.');
    return null;
  }
  if (log.status !== 'completed') errors.push(`Playwright execution did not complete: ${log.status || 'unknown'}`);
  const steps = Array.isArray(log.steps) ? log.steps : [];
  if (steps.length === 0) errors.push('Playwright execution log contains no steps.');
  const failed = steps.filter(step => step.status !== 'passed');
  if (failed.length) errors.push(`Playwright execution has failed steps: ${failed.map(step => step.id).join(', ')}`);
  const plannedStepIds = Array.isArray(plan?.steps) ? plan.steps.map(step => step.id).filter(Boolean) : [];
  const loggedStepIds = new Set(steps.map(step => step.id).filter(Boolean));
  const missing = plannedStepIds.filter(id => !loggedStepIds.has(id));
  if (missing.length) errors.push(`Execution log is missing planned steps: ${missing.join(', ')}`);
  if (!log.finalUrl || /^about:blank$/i.test(log.finalUrl)) errors.push(`Final URL is invalid: ${log.finalUrl || 'missing'}`);
  const expected = plan?.expected || {};
  if (expected.finalUrlIncludes && !String(log.finalUrl || '').includes(expected.finalUrlIncludes)) {
    errors.push(`Final URL does not include expected value: ${expected.finalUrlIncludes}`);
  }
  if (expected.finalTitleIncludes && !String(log.finalTitle || '').includes(expected.finalTitleIncludes)) {
    errors.push(`Final title does not include expected value: ${expected.finalTitleIncludes}`);
  }
  if (log.popupUrls?.length) warnings.push(`Walkthrough opened extra pages: ${log.popupUrls.join(', ')}`);
  if (log.pageErrors?.length) warnings.push(`Page errors were captured: ${log.pageErrors.length}`);
  return log;
}

const videoPath = videoPathFromManifest();
const errors = [];
const warnings = [];
const validationDir = ensureDir(path.join(runDir, 'proof-video', 'validation', safeName(kind, 'video')));
const minBytes = Math.max(10000, numberFor(args, '--min-bytes', kind === 'final' ? 100000 : 10000) || 0);
const minDuration = Math.max(0.1, numberFor(args, '--min-duration', 1) || 1);
const maxDuration = Math.max(minDuration, numberFor(args, '--max-duration', 1800) || 1800);
const minWidth = Math.max(1, numberFor(args, '--min-width', kind === 'final' ? 640 : 640) || 640);
const minHeight = Math.max(1, numberFor(args, '--min-height', kind === 'final' ? 360 : 360) || 360);

try {
  if (!commandStatus('ffprobe', ['-version']).ok) errors.push('ffprobe is not available.');
  if (!commandStatus('ffmpeg', ['-version']).ok) errors.push('ffmpeg is not available.');
  if (!fileOk(videoPath, 1)) {
    errors.push(`Video file does not exist or is empty: ${videoPath || 'missing'}`);
  }
  const stat = fileOk(videoPath, 1) ? fs.statSync(videoPath) : null;
  if (stat && stat.size < minBytes) errors.push(`Video file is too small: ${stat.size} bytes < ${minBytes} bytes.`);
  const metadata = fileOk(videoPath, 1) ? ffprobe(videoPath) : null;
  const stream = videoStream(metadata);
  const duration = Number(metadata?.format?.duration || stream?.duration || 0);
  if (!metadata) errors.push('ffprobe could not read the video.');
  if (metadata && (!Number.isFinite(duration) || duration <= 0)) errors.push('Video duration is missing or invalid.');
  if (duration && duration < minDuration) errors.push(`Video duration is too short: ${duration.toFixed(2)}s < ${minDuration}s.`);
  if (duration && duration > maxDuration) errors.push(`Video duration is too long: ${duration.toFixed(2)}s > ${maxDuration}s.`);
  if (stream && (Number(stream.width) < minWidth || Number(stream.height) < minHeight)) {
    errors.push(`Video resolution is too small: ${stream.width}x${stream.height}; expected at least ${minWidth}x${minHeight}.`);
  }
  const frameSamples = [];
  if (duration && fileOk(videoPath, 1)) {
    const sampleTimes = [
      ['first', Math.min(0.5, Math.max(0, duration * 0.05))],
      ['middle', duration / 2],
      ['last', Math.max(0, duration - 0.5)]
    ];
    for (const [label, seconds] of sampleTimes) {
      const pngPath = path.join(validationDir, `frame-${label}.png`);
      const pngOk = extractFramePng(videoPath, seconds, pngPath);
      const stats = rawFrameStats(videoPath, seconds);
      if (!pngOk) errors.push(`Could not extract ${label} frame sample.`);
      if (!stats.ok || stats.blankLike) {
        errors.push(
          `${label} frame appears blank or near-solid (mean=${stats.mean.toFixed(2)}, variance=${stats.variance.toFixed(2)}).`
        );
      }
      frameSamples.push({
        label,
        seconds,
        path: pngOk ? relativeTo(runDir, pngPath) : null,
        mean: stats.mean,
        variance: stats.variance,
        blankLike: Boolean(stats.blankLike)
      });
    }
  }
  const executionLog = validateExecutionLog(errors, warnings);
  const validationPath = path.join(validationDir, 'validation.json');
  const result = {
    ok: errors.length === 0,
    kind,
    validationPath: relativeTo(runDir, validationPath),
    videoPath: videoPath ? relativeTo(runDir, videoPath) : null,
    sizeBytes: stat?.size || 0,
    durationSeconds: duration || null,
    resolution: stream ? { width: Number(stream.width), height: Number(stream.height) } : null,
    frameSamples,
    executionLog: executionLog
      ? {
          path: relativeTo(runDir, logPath),
          status: executionLog.status,
          finalUrl: executionLog.finalUrl,
          finalTitle: executionLog.finalTitle,
          stepCount: executionLog.steps?.length || 0
        }
      : null,
    errors,
    warnings,
    validatedAt: new Date().toISOString()
  };
  writeJson(validationPath, result);
  updateManifestEvidence(runDir, manifestValue => {
    manifestValue.artifacts = manifestValue.artifacts || {};
    manifestValue.proofVideoPipeline = manifestValue.proofVideoPipeline || {};
    manifestValue.proofVideoPipeline.validations = manifestValue.proofVideoPipeline.validations || {};
    manifestValue.proofVideoPipeline.validations[kind] = relativeTo(runDir, validationPath);
    manifestValue.proofVideoPipeline.validationStatus = result.ok ? 'validated' : 'failed-validation';
    manifestValue.artifacts[`${kind}ProofVideoValidation`] = relativeTo(runDir, validationPath);
    return manifestValue;
  });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
