#!/usr/bin/env node
import path from 'node:path';
import process from 'node:process';
import {
  appendPipelineEvent,
  boolFlag,
  ensureDir,
  run,
  scriptPaths,
  valueFor,
  writeProofReport
} from './proof-video-utils.mjs';

const args = process.argv.slice(2);
const { scriptDir } = scriptPaths(import.meta.url);

function usage() {
  console.log(`Run the QA proof-video pipeline.

Usage:
  node plugins/qa/scripts/run-proof-video-pipeline.mjs <run-dir> --target-url <url>
  node plugins/qa/scripts/run-proof-video-pipeline.mjs <run-dir> --plan proof-video/plans/proof-walkthrough.plan.json

Sequence: plan -> record -> validate raw -> narration -> Remotion intro/outro -> ffmpeg assembly -> validate final -> proof report.
The runner stops on raw validation failure and never changes QA verdicts, gates, merge status, or report outcome.`);
}

const runArg = args.find(arg => !arg.startsWith('--'));
if (!runArg || boolFlag(args, '--help') || boolFlag(args, '-h')) {
  usage();
  process.exit(runArg ? 0 : 1);
}

const runDir = path.resolve(runArg);
const targetUrl = valueFor(args, '--target-url', '') || valueFor(args, '--url', '');
const suppliedPlan = valueFor(args, '--plan', '');
const skipNarration = boolFlag(args, '--skip-narration');
const headed = boolFlag(args, '--headed');
const skipOutro = boolFlag(args, '--skip-outro');
const introTitle = valueFor(args, '--intro-title', '');
const introSubtitle = valueFor(args, '--intro-subtitle', '');
const outroTitle = valueFor(args, '--outro-title', '');
const outroSubtitle = valueFor(args, '--outro-subtitle', '');
const report = {
  pipelineStatus: 'running',
  startedAt: new Date().toISOString(),
  runDir,
  steps: [],
  artifacts: {},
  errors: []
};

function recordStep(name, result, extra = {}) {
  const entry = {
    name,
    status: result.status === 0 ? 'completed' : 'failed',
    exitCode: result.status,
    ...extra
  };
  report.steps.push(entry);
  appendPipelineEvent(runDir, entry);
  return entry;
}

function invoke(name, commandArgs, options = {}) {
  const result = run('node', commandArgs, { check: false, inherit: options.inherit === true });
  recordStep(name, result, options.extra || {});
  if (result.status !== 0 && options.required !== false) {
    const message = `${name} failed with exit code ${result.status}`;
    report.errors.push(message);
    throw new Error(message);
  }
  return result;
}

try {
  ensureDir(path.join(runDir, 'proof-video'));
  ensureDir(path.join(runDir, 'logs'));

  const planArgs = suppliedPlan
    ? [path.join(scriptDir, 'create-proof-walkthrough-plan.mjs'), runDir, '--from', suppliedPlan]
    : [path.join(scriptDir, 'create-proof-walkthrough-plan.mjs'), runDir, '--target-url', targetUrl];
  if (!suppliedPlan && !targetUrl) {
    throw new Error('Provide --target-url or --plan so the recorder does not start at about:blank.');
  }
  const planResult = invoke('create-plan', planArgs);
  const plan = JSON.parse(planResult.stdout || '{}');
  report.artifacts.planPath = plan.planPath;

  const recordArgs = [path.join(scriptDir, 'record-playwright-proof-walkthrough.mjs'), runDir];
  if (headed) recordArgs.push('--headed');
  invoke('record-playwright-walkthrough', recordArgs, { inherit: true });

  const rawValidation = invoke('validate-raw-video', [path.join(scriptDir, 'validate-proof-video.mjs'), runDir, '--kind', 'raw']);
  const rawValidationJson = JSON.parse(rawValidation.stdout || '{}');
  report.artifacts.rawValidation = rawValidationJson.validationPath || null;
  report.artifacts.rawVideo = rawValidationJson.videoPath || null;

  if (!skipNarration) {
    invoke(
      'generate-deepgram-narration',
      [path.join(scriptDir, 'generate-deepgram-narration.mjs'), runDir, '--skip-if-missing-key'],
      { required: false }
    );
  }

  const introArgs = [path.join(scriptDir, 'render-remotion-proof-segment.mjs'), runDir, '--kind', 'intro'];
  if (introTitle) introArgs.push('--title', introTitle);
  if (introSubtitle) introArgs.push('--subtitle', introSubtitle);
  invoke('render-remotion-intro-segment', introArgs, {
    inherit: true
  });

  if (!skipOutro) {
    const outroArgs = [path.join(scriptDir, 'render-remotion-proof-segment.mjs'), runDir, '--kind', 'outro'];
    if (outroTitle) outroArgs.push('--title', outroTitle);
    if (outroSubtitle) outroArgs.push('--subtitle', outroSubtitle);
    invoke('render-remotion-outro-segment', outroArgs, {
      inherit: true
    });
  }

  const assembleArgs = [
    path.join(scriptDir, 'assemble-proof-video-segments.mjs'),
    runDir,
    '--intro',
    'proof-video/remotion/intro.mp4',
    '--walkthrough',
    'proof-video/raw/browser-walkthrough.webm',
    '--audio',
    'proof-video/audio/narration.mp3'
  ];
  if (!skipOutro) assembleArgs.push('--outro', 'proof-video/remotion/outro.mp4');
  invoke('assemble-proof-video-segments', assembleArgs, {
    inherit: true
  });

  const finalValidation = invoke('validate-final-video', [path.join(scriptDir, 'validate-proof-video.mjs'), runDir, '--kind', 'final']);
  const finalValidationJson = JSON.parse(finalValidation.stdout || '{}');
  report.artifacts.finalValidation = finalValidationJson.validationPath || null;
  report.artifacts.finalVideo = finalValidationJson.videoPath || null;

  report.pipelineStatus = 'completed';
  report.completedAt = new Date().toISOString();
  const reportPath = writeProofReport(runDir, report);
  console.log(JSON.stringify({ ok: true, reportPath, ...report }, null, 2));
} catch (error) {
  report.pipelineStatus = report.steps.some(step => step.name === 'validate-raw-video' && step.status === 'failed')
    ? 'stopped-after-raw-validation'
    : 'failed';
  report.completedAt = new Date().toISOString();
  report.errors.push(error instanceof Error ? error.message : String(error));
  const reportPath = writeProofReport(runDir, report);
  console.error(JSON.stringify({ ok: false, reportPath, ...report }, null, 2));
  process.exit(1);
}
