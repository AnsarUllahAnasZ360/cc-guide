#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  boolFlag,
  copyRecursive,
  ensureDir,
  fileOk,
  numberFor,
  readJson,
  relativeTo,
  run,
  scriptPaths,
  updateManifestEvidence,
  valueFor,
  writeJson
} from './proof-video-utils.mjs';

const args = process.argv.slice(2);
const { remotionTemplateDir } = scriptPaths(import.meta.url);

function usage() {
  console.log(`Render a standalone Remotion proof-video bookend segment.

Usage:
  node plugins/qa/scripts/render-remotion-proof-segment.mjs <run-dir> --kind intro --title "..." --subtitle "..."
  node plugins/qa/scripts/render-remotion-proof-segment.mjs <run-dir> --kind outro --from proof-video/plans/segment-intro.json

This renders QASegment only. It does not package the browser walkthrough and never changes QA verdicts or gates.`);
}

const runArg = args.find(arg => !arg.startsWith('--'));
if (!runArg || boolFlag(args, '--help') || boolFlag(args, '-h')) {
  usage();
  process.exit(runArg ? 0 : 1);
}

const runDir = path.resolve(runArg);
const kind = valueFor(args, '--kind', 'intro');
const fps = Math.max(1, numberFor(args, '--fps', 30) || 30);
const durationSeconds = Math.max(1, numberFor(args, '--duration-seconds', kind === 'outro' ? 12 : 16) || 16);
const workDir = path.resolve(valueFor(args, '--work-dir', path.join(runDir, 'proof-video', 'remotion', `${kind}-segment`)));
const outputPath = path.resolve(
  valueFor(args, '--output', path.join(runDir, 'proof-video', 'remotion', `${kind}.mp4`))
);
const fromPath = valueFor(args, '--from', '');

function splitBullets(raw) {
  if (!raw) return [];
  return raw
    .split('|')
    .map(part => part.trim())
    .filter(Boolean);
}

function segmentData() {
  const from = fromPath ? readJson(path.resolve(fromPath), {}) : {};
  const manifest = readJson(path.join(runDir, 'manifest.json'), {});
  return {
    segmentKind: kind,
    title: valueFor(args, '--title', '') || from.title || manifest.taskSummary || 'QA proof walkthrough',
    eyebrow: valueFor(args, '--eyebrow', '') || from.eyebrow || (kind === 'outro' ? 'Closeout' : 'Founder proof'),
    subtitle:
      valueFor(args, '--subtitle', '') ||
      from.subtitle ||
      (kind === 'outro'
        ? 'The walkthrough is backed by the QA report, execution log, raw recording validation, and final video validation.'
        : 'A short context card followed by a full-screen, Playwright-recorded product walkthrough.'),
    bullets: splitBullets(valueFor(args, '--bullets', '')) || from.bullets || [],
    statusLabel: valueFor(args, '--status', '') || from.statusLabel || 'evidence recorded',
    footer: valueFor(args, '--footer', '') || from.footer || 'Generated from QA proof-video artifacts',
    durationInFrames: Math.ceil(durationSeconds * fps),
    fps
  };
}

try {
  if (!fs.existsSync(remotionTemplateDir)) throw new Error(`Remotion template not found: ${remotionTemplateDir}`);
  fs.rmSync(workDir, { recursive: true, force: true });
  copyRecursive(remotionTemplateDir, workDir);
  writeJson(path.join(workDir, 'src', 'proof-data.ts'), segmentData());
  fs.writeFileSync(
    path.join(workDir, 'src', 'proof-data.ts'),
    `export const proofData = ${JSON.stringify(segmentData(), null, 2)} as const;\n`
  );
  if (!fs.existsSync(path.join(workDir, 'node_modules'))) {
    run('npm', ['install', '--silent'], { cwd: workDir, inherit: true });
  }
  ensureDir(path.dirname(outputPath));
  run('npx', ['remotion', 'render', 'QASegment', outputPath, '--codec=h264', '--audio-codec=aac', '--overwrite', '--log=warn'], {
    cwd: workDir,
    inherit: true
  });
  if (!fileOk(outputPath, 50000)) throw new Error(`Segment render failed or is too small: ${outputPath}`);
  const metadata = {
    kind,
    renderer: 'remotion',
    composition: 'QASegment',
    outputPath: relativeTo(runDir, outputPath),
    durationSeconds,
    renderedAt: new Date().toISOString()
  };
  const metadataPath = path.join(runDir, 'proof-video', 'remotion', `${kind}-metadata.json`);
  writeJson(metadataPath, metadata);
  updateManifestEvidence(runDir, manifest => {
    manifest.artifacts = manifest.artifacts || {};
    manifest.proofVideoPipeline = manifest.proofVideoPipeline || {};
    manifest.proofVideoPipeline.segments = manifest.proofVideoPipeline.segments || {};
    manifest.proofVideoPipeline.segments[kind] = metadata;
    manifest.artifacts[`${kind}ProofVideoSegment`] = relativeTo(runDir, outputPath);
    return manifest;
  });
  console.log(JSON.stringify({ ok: true, ...metadata }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
