#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const rawArgs = process.argv.slice(2);
const runArg = rawArgs.find(arg => !arg.startsWith('--'));
const skipTts = rawArgs.includes('--skip-tts');
const dryRun = rawArgs.includes('--dry-run');
const smoke = rawArgs.includes('--smoke');
const legacy = rawArgs.includes('--legacy');
const allowNonPassingReport = rawArgs.includes('--allow-non-passing-report');
const allowFrameRecording = rawArgs.includes('--allow-frame-recording');
const voiceModel =
  rawArgs.find(arg => arg.startsWith('--voice-model='))?.split('=', 2)[1] ||
  process.env.DEEPGRAM_MODEL ||
  'aura-2-thalia-en';
const durationOverrideSeconds = numberArg('--duration-seconds');
const walkthroughDurationOverrideSeconds = numberArg('--walkthrough-duration-seconds');
const fpsOverride = numberArg('--fps');

if (!runArg || rawArgs.includes('--help')) {
  console.log('Usage: node plugins/qa/scripts/render-qa-video.mjs <run-dir> --legacy [--skip-tts] [--voice-model=aura-2-thalia-en] [--dry-run] [--smoke] [--duration-seconds=60] [--walkthrough-duration-seconds=45] [--fps=15] [--allow-non-passing-report] [--allow-frame-recording]');
  process.exit(runArg ? 0 : 1);
}

if (!legacy) {
  console.error(
    'render-qa-video.mjs is a legacy renderer. Use run-proof-video-pipeline.mjs for the default Playwright + validation + Deepgram + Remotion pipeline, or pass --legacy only for old QA artifact runs.'
  );
  process.exit(1);
}

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const pluginRoot = path.resolve(scriptDir, '..');
const templateDir = path.join(pluginRoot, 'assets/remotion-template');
const runDir = path.resolve(runArg);
const workDir = path.join(runDir, '.qa-video-remotion');
const outputPath = path.join(runDir, 'qa-proof-video.mp4');

function valueFor(flag) {
  const eq = rawArgs.find(arg => arg.startsWith(`${flag}=`));
  if (eq) return eq.split('=', 2)[1];
  const index = rawArgs.indexOf(flag);
  return index >= 0 ? rawArgs[index + 1] : '';
}

function numberArg(flag) {
  const raw = valueFor(flag);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function run(command, args = [], options = {}) {
  const rendered = [command, ...args].join(' ');
  if (dryRun) {
    console.log(`[dry-run] ${rendered}`);
    return { status: 0, stdout: '', stderr: '' };
  }
  console.log(`[run] ${rendered}`);
  const result = spawnSync(command, args, {
    cwd: options.cwd || runDir,
    encoding: 'utf8',
    stdio: options.inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${rendered}\n${result.stderr || ''}`);
  }
  return result;
}

function copyRecursive(source, target) {
  const base = path.basename(source);
  if (base === 'node_modules' || base === '.git' || base === '.turbo' || base === 'dist') return;
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

function listFilesRecursive(dir, pattern) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFilesRecursive(fullPath, pattern));
    } else if (entry.isFile() && pattern.test(entry.name) && fs.statSync(fullPath).size > 0) {
      results.push(fullPath);
    }
  }
  return results;
}

function chunkText(text, maxLength = 1900) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  const chunks = [];
  let remaining = normalized;
  while (remaining.length > maxLength) {
    let index = remaining.lastIndexOf('. ', maxLength);
    if (index < maxLength * 0.45) index = remaining.lastIndexOf(' ', maxLength);
    if (index < 1) index = maxLength;
    chunks.push(remaining.slice(0, index + 1).trim());
    remaining = remaining.slice(index + 1).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

function readManifest() {
  const filePath = path.join(runDir, 'manifest.json');
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
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

function normalizedVerdict(manifest) {
  return fieldText(manifest?.verdict || manifest?.finalVerdict || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function isPassingVerdict(manifest) {
  const verdict = normalizedVerdict(manifest);
  return ['pass', 'passed', 'merge', 'merged', 'merge ready', 'ready to merge', 'clean pass', 'clean merge'].includes(verdict);
}

function gateEntries(gates) {
  if (!gates) return [];
  if (Array.isArray(gates)) {
    return gates.map((gate, index) => [String(gate?.name || gate?.id || index), gate]);
  }
  if (typeof gates === 'object') {
    return Object.entries(gates);
  }
  return [['gates', gates]];
}

function gateStatus(value) {
  return fieldText(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function hasCleanGates(manifest) {
  const entries = gateEntries(manifest?.gates);
  if (entries.length === 0) return true;
  const failing = new Set(['fail', 'failed', 'blocked', 'blocker', 'partial', 'partial pass', 'pending', 'unknown', 'error']);
  return entries.every(([, value]) => {
    const status = gateStatus(value);
    if (!status) return false;
    if (failing.has(status)) return false;
    if (status.includes('fail') || status.includes('block') || status.includes('partial') || status.includes('pending')) {
      return false;
    }
    return true;
  });
}

function resolveRunPath(relativeOrAbsolute) {
  if (!relativeOrAbsolute || typeof relativeOrAbsolute !== 'string') return null;
  return path.isAbsolute(relativeOrAbsolute) ? relativeOrAbsolute : path.join(runDir, relativeOrAbsolute);
}

function fileOk(filePath) {
  return Boolean(filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile() && fs.statSync(filePath).size > 0);
}

function readRecordingMetadata(filePath) {
  if (!fileOk(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function recordingCandidateFromValue(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    const filePath = resolveRunPath(value);
    if (!filePath) return null;
    if (/\.(mp4|webm|mov|m4v)$/i.test(filePath)) {
      return { kind: 'video', sourcePath: filePath, manifestPath: null, durationSeconds: null };
    }
    if (/\.json$/i.test(filePath)) {
      const metadata = readRecordingMetadata(filePath);
      return metadata ? recordingCandidateFromMetadata(filePath, metadata) : null;
    }
    return null;
  }
  if (typeof value !== 'object') return null;
  const directVideoPath = resolveRunPath(value.videoPath || value.video || value.file || value.src);
  if (fileOk(directVideoPath) && /\.(mp4|webm|mov|m4v)$/i.test(directVideoPath)) {
    return {
      kind: 'video',
      sourcePath: directVideoPath,
      manifestPath: resolveRunPath(value.path) || null,
      durationSeconds: Number(value.durationSeconds) || null
    };
  }
  const manifestPath = resolveRunPath(value.path || value.metadataPath || value.manifestPath);
  if (manifestPath && /\.json$/i.test(manifestPath)) {
    const metadata = readRecordingMetadata(manifestPath);
    return metadata ? recordingCandidateFromMetadata(manifestPath, metadata) : null;
  }
  return null;
}

function recordingCandidateFromMetadata(manifestPath, metadata) {
  const videoPath = resolveRunPath(metadata.videoPath || metadata.path);
  if (fileOk(videoPath)) {
    return {
      kind: 'video',
      sourcePath: videoPath,
      manifestPath,
      durationSeconds: Number(metadata.durationSeconds || metadata.requestedDurationSeconds) || null,
      captureMethod: metadata.captureMethod || null
    };
  }
  const framesDir = resolveRunPath(metadata.framesDirectory);
  const frames = framesDir ? listFiles(framesDir, /\.(png|jpe?g)$/i) : [];
  if (frames.length > 0) {
    return {
      kind: 'frame-recording',
      sourcePath: null,
      manifestPath,
      framesDir,
      frameCount: frames.length,
      fps: Number(metadata.fps) || 6,
      durationSeconds: Number(metadata.durationSeconds) || (Number(metadata.fps) ? frames.length / Number(metadata.fps) : null)
    };
  }
  return null;
}

function findWalkthroughRecording(manifest) {
  const candidates = [
    manifest?.recordings?.walkthrough,
    manifest?.recordings?.browserWalkthrough,
    manifest?.recordings?.primary,
    manifest?.artifacts?.walkthroughRecording,
    manifest?.artifacts?.recording,
  ];

  if (Array.isArray(manifest?.recordings)) {
    candidates.push(
      ...manifest.recordings.filter(recording => {
        const role = `${recording?.role || ''} ${recording?.kind || ''} ${recording?.label || ''}`.toLowerCase();
        return role.includes('walkthrough') || role.includes('browser');
      })
    );
  }

  for (const candidate of candidates) {
    const normalized = recordingCandidateFromValue(candidate);
    if (normalized) return normalized;
  }

  const recordingDir = path.join(runDir, 'recordings');
  const video = listFilesRecursive(recordingDir, /\.(mp4|webm|mov|m4v)$/i)[0];
  if (video) return { kind: 'video', sourcePath: video, manifestPath: null, durationSeconds: null };

  for (const metadataPath of listFilesRecursive(recordingDir, /\.json$/i)) {
    const metadata = readRecordingMetadata(metadataPath);
    const normalized = metadata ? recordingCandidateFromMetadata(metadataPath, metadata) : null;
    if (normalized) return normalized;
  }

  return null;
}

function ffprobeDuration(filePath) {
  if (!fileOk(filePath)) return null;
  const result = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', filePath],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
  );
  if (result.status !== 0) return null;
  const value = Number(result.stdout.trim());
  return Number.isFinite(value) && value > 0 ? value : null;
}

function ensureRenderableWalkthrough(recording) {
  if (!recording) return null;
  if (recording.kind === 'video' && fileOk(recording.sourcePath)) return recording;
  if (recording.kind === 'frame-recording' && recording.framesDir) {
    const frames = listFiles(recording.framesDir, /\.(png|jpe?g)$/i);
    if (frames.length > 0) return { ...recording, frames };
  }
  return null;
}

function assertRenderPolicy(manifest, recording) {
  if (allowNonPassingReport) {
    console.warn('[warn] --allow-non-passing-report enabled; rendering report-only/internal proof video without enforcing pass gates.');
    return;
  }
  const failures = [];
  if (!isPassingVerdict(manifest)) {
    failures.push(`manifest verdict is not PASS/MERGE (found "${manifest?.verdict || manifest?.finalVerdict || 'missing'}")`);
  }
  if (!hasCleanGates(manifest)) {
    failures.push('manifest gates are not clean');
  }
  if (!recording) {
    failures.push('no valid browser walkthrough recording was found');
  } else if (recording.kind === 'frame-recording' && !allowFrameRecording) {
    failures.push('walkthrough recording is only a frame sequence; produce a real video recording or pass --allow-frame-recording for internal diagnostics only');
  }
  if (failures.length) {
    throw new Error(`Refusing to render founder proof video:\n- ${failures.join('\n- ')}\nUse --allow-non-passing-report or --allow-frame-recording only for internal diagnostics.`);
  }
}

function summarizeReport() {
  const report = path.join(runDir, 'verification-report.md');
  if (!fs.existsSync(report)) return '';
  return fs.readFileSync(report, 'utf8').replace(/\s+/g, ' ').slice(0, 1200);
}

function deepgramKey() {
  if (process.env.DEEPGRAM_API_KEY) return process.env.DEEPGRAM_API_KEY;
  const result = spawnSync('node', [path.join(pluginRoot, 'scripts/deepgram-key.mjs'), 'get'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return result.status === 0 ? result.stdout.trim() : '';
}

function ensureNarrationText() {
  const narrationText = path.join(runDir, 'narration.txt');
  if (fs.existsSync(narrationText) && fs.statSync(narrationText).size > 0) {
    return narrationText;
  }
  const manifest = readManifest();
  const fallback = [
    manifest?.taskSummary || 'This QA proof video summarizes a verification run.',
    `Final verdict: ${manifest?.finalVerdict || 'pending'}.`,
    summarizeReport() || 'Review the verification report and Browser Use evidence for details.'
  ].join('\n\n');
  fs.writeFileSync(narrationText, fallback);
  return narrationText;
}

async function synthesizeNarration() {
  const narrationAudio = path.join(runDir, 'narration.mp3');
  if (fs.existsSync(narrationAudio) && fs.statSync(narrationAudio).size > 0) return true;
  if (skipTts) return false;
  const key = deepgramKey();
  if (!key) {
    console.warn('[warn] Deepgram key not configured; rendering silent proof video.');
    return false;
  }
  const narrationText = ensureNarrationText();
  const text = fs.readFileSync(narrationText, 'utf8').replace(/\s+/g, ' ').trim().slice(0, 1900);
  if (!text) return false;
  if (dryRun) {
    console.log(`[dry-run] Deepgram TTS request model=${voiceModel}`);
    return false;
  }
  const response = await fetch(`https://api.deepgram.com/v1/speak?model=${encodeURIComponent(voiceModel)}`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Deepgram TTS failed with ${response.status}: ${errorText.slice(0, 500)}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(narrationAudio, buffer);
  return buffer.length > 0;
}

async function synthesizeNarrationSegments() {
  const segmentsPath = path.join(runDir, 'narration-segments.json');
  if (!fs.existsSync(segmentsPath)) return [];
  let segments = [];
  try {
    segments = JSON.parse(fs.readFileSync(segmentsPath, 'utf8'));
  } catch {
    throw new Error('narration-segments.json is not valid JSON.');
  }
  if (!Array.isArray(segments) || segments.length === 0) return [];

  const key = deepgramKey();
  const outputDir = path.join(runDir, 'narration-segments');
  fs.mkdirSync(outputDir, { recursive: true });
  const rendered = [];

  for (const [index, segment] of segments.entries()) {
    const text = String(segment.text || '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const parts = chunkText(text);
    for (const [partIndex, part] of parts.entries()) {
      const fileName =
        parts.length === 1
          ? `segment-${String(index + 1).padStart(3, '0')}.mp3`
          : `segment-${String(index + 1).padStart(3, '0')}-${String(partIndex + 1).padStart(2, '0')}.mp3`;
      const audioPath = path.join(outputDir, fileName);
      if (!fs.existsSync(audioPath) || fs.statSync(audioPath).size === 0) {
        if (!key || skipTts) continue;
        if (dryRun) {
          console.log(`[dry-run] Deepgram TTS segment request model=${voiceModel} file=${fileName}`);
        } else {
          const response = await fetch(`https://api.deepgram.com/v1/speak?model=${encodeURIComponent(voiceModel)}`, {
            method: 'POST',
            headers: {
              Authorization: `Token ${key}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: part })
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Deepgram TTS segment failed with ${response.status}: ${errorText.slice(0, 500)}`);
          }
          fs.writeFileSync(audioPath, Buffer.from(await response.arrayBuffer()));
        }
      }
      if (fs.existsSync(audioPath) && fs.statSync(audioPath).size > 0) {
        rendered.push({
          startSeconds: Number(segment.startSeconds) || 0,
          chapter: segment.chapter || segment.label || '',
          text: part,
          file: path.relative(runDir, audioPath)
        });
      }
    }
  }
  return rendered;
}

function updateManifest(proofVideoPath, hasAudio, recording, walkthroughSeconds, narrationSegments = []) {
  const manifestPath = path.join(runDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return;
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.artifacts = manifest.artifacts || {};
    manifest.recordings = manifest.recordings || {};
    manifest.artifacts.narration = hasAudio ? 'narration.mp3' : null;
    manifest.artifacts.narrationSegments = narrationSegments.length ? 'narration-segments/' : null;
    manifest.artifacts.proofVideo = path.relative(runDir, proofVideoPath);
    manifest.proofVideo = path.relative(runDir, proofVideoPath);
    manifest.videoDecision = allowNonPassingReport ? 'internal-report-video-rendered' : 'founder-proof-video-rendered';
    manifest.videoDecisionReason = 'All required render gates passed and a Browser Use walkthrough recording was available.';
    manifest.walkthroughDurationSeconds = walkthroughSeconds || manifest.walkthroughDurationSeconds || null;
    if (recording?.sourcePath) {
      manifest.recordings.walkthrough = {
        ...(manifest.recordings.walkthrough && typeof manifest.recordings.walkthrough === 'object'
          ? manifest.recordings.walkthrough
          : {}),
        kind: recording.assembledFromFrames ? 'browser-use-frame-recording-video' : 'browser-walkthrough-video',
        path: path.relative(runDir, recording.sourcePath),
        metadataPath: recording.manifestPath ? path.relative(runDir, recording.manifestPath) : null,
        durationSeconds: walkthroughSeconds || recording.durationSeconds || null,
        assembledFromFrames: Boolean(recording.assembledFromFrames),
        captureMethod: recording.captureMethod || null
      };
      manifest.artifacts.walkthroughRecording = manifest.recordings.walkthrough.path;
    } else if (recording?.framesDir) {
      manifest.recordings.walkthrough = {
        ...(manifest.recordings.walkthrough && typeof manifest.recordings.walkthrough === 'object'
          ? manifest.recordings.walkthrough
          : {}),
        kind: 'browser-use-frame-recording',
        path: recording.manifestPath ? path.relative(runDir, recording.manifestPath) : null,
        framesDirectory: path.relative(runDir, recording.framesDir),
        frameCount: recording.frameCount || recording.frames?.length || null,
        fps: recording.fps || null,
        durationSeconds: walkthroughSeconds || recording.durationSeconds || null,
        assembledFromFrames: false
      };
      manifest.artifacts.walkthroughRecording =
        manifest.recordings.walkthrough.path || manifest.recordings.walkthrough.framesDirectory;
    }
      manifest.proofVideoPolicy = {
      ...(manifest.proofVideoPolicy && typeof manifest.proofVideoPolicy === 'object' ? manifest.proofVideoPolicy : {}),
      primaryEvidence: 'browser-walkthrough-recording',
      screenshotRole: 'supporting-chapter-evidence',
      requiresPassingVerdict: !allowNonPassingReport,
      requiresWalkthroughRecording: !allowNonPassingReport,
      allowNonPassingReport,
      allowFrameRecording,
      renderedAt: new Date().toISOString()
    };
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  } catch {
    console.warn('[warn] Could not update manifest.json with proof video path.');
  }
}

if (!fs.existsSync(runDir)) {
  console.error(`QA run directory not found: ${runDir}`);
  process.exit(1);
}
if (!fs.existsSync(templateDir)) {
  console.error(`QA Remotion template not found: ${templateDir}`);
  process.exit(1);
}

try {
  const manifest = readManifest() || {};
  const discoveredRecording = findWalkthroughRecording(manifest);
  assertRenderPolicy(manifest, discoveredRecording);
  const renderableRecording = ensureRenderableWalkthrough(discoveredRecording);
  assertRenderPolicy(manifest, renderableRecording);

  const screenshotFiles = listFiles(path.join(runDir, 'screenshots'), /\.(png|jpe?g)$/i).slice(0, 12);
  const narrationSegments = await synthesizeNarrationSegments();
  const hasAudio = narrationSegments.length > 0 ? false : await synthesizeNarration();

  fs.rmSync(workDir, { recursive: true, force: true });
  copyRecursive(templateDir, workDir);

  const publicAssetDir = path.join(workDir, 'public/assets');
  fs.mkdirSync(publicAssetDir, { recursive: true });

  const screenshots = [];
  for (const [index, file] of screenshotFiles.entries()) {
    const targetName = `screenshot-${index + 1}${path.extname(file).toLowerCase()}`;
    copyRecursive(file, path.join(publicAssetDir, targetName));
    screenshots.push(`assets/${targetName}`);
  }
  if (hasAudio) {
    copyRecursive(path.join(runDir, 'narration.mp3'), path.join(publicAssetDir, 'narration.mp3'));
  }
  const renderedNarrationSegments = [];
  for (const [index, segment] of narrationSegments.entries()) {
    const source = resolveRunPath(segment.file);
    if (!fileOk(source)) continue;
    const targetName = `narration-segment-${String(index + 1).padStart(3, '0')}${path.extname(source).toLowerCase() || '.mp3'}`;
    copyRecursive(source, path.join(publicAssetDir, targetName));
    renderedNarrationSegments.push({
      ...segment,
      file: `assets/${targetName}`
    });
  }

  let walkthroughAsset = null;
  let walkthroughFrames = [];
  let detectedWalkthroughSeconds = null;
  if (renderableRecording?.sourcePath && !dryRun) {
    const extension = path.extname(renderableRecording.sourcePath).toLowerCase() || '.mp4';
    const targetName = `walkthrough${extension}`;
    copyRecursive(renderableRecording.sourcePath, path.join(publicAssetDir, targetName));
    walkthroughAsset = `assets/${targetName}`;
    detectedWalkthroughSeconds =
      walkthroughDurationOverrideSeconds ||
      renderableRecording.durationSeconds ||
      manifest.walkthroughDurationSeconds ||
      ffprobeDuration(renderableRecording.sourcePath);
  } else if (renderableRecording?.sourcePath) {
    walkthroughAsset = `assets/walkthrough${path.extname(renderableRecording.sourcePath).toLowerCase() || '.mp4'}`;
    detectedWalkthroughSeconds =
      walkthroughDurationOverrideSeconds ||
      renderableRecording.durationSeconds ||
      manifest.walkthroughDurationSeconds ||
      null;
  } else if (renderableRecording?.framesDir) {
    const frameFiles = listFiles(renderableRecording.framesDir, /\.(png|jpe?g)$/i);
    if (!dryRun) {
      const frameAssetDir = path.join(publicAssetDir, 'walkthrough-frames');
      fs.mkdirSync(frameAssetDir, { recursive: true });
      for (const [index, file] of frameFiles.entries()) {
        const targetName = `frame-${String(index + 1).padStart(6, '0')}${path.extname(file).toLowerCase()}`;
        copyRecursive(file, path.join(frameAssetDir, targetName));
        walkthroughFrames.push(`assets/walkthrough-frames/${targetName}`);
      }
    } else {
      walkthroughFrames = frameFiles.map((file, index) => `assets/walkthrough-frames/frame-${String(index + 1).padStart(6, '0')}${path.extname(file).toLowerCase()}`);
    }
    detectedWalkthroughSeconds =
      walkthroughDurationOverrideSeconds ||
      renderableRecording.durationSeconds ||
      manifest.walkthroughDurationSeconds ||
      (renderableRecording.fps ? frameFiles.length / renderableRecording.fps : null);
  }

  const reportSummary = summarizeReport();
  const fps = fpsOverride || (renderableRecording?.sourcePath ? 15 : 30);
  const introSeconds = smoke ? 4 : 14;
  const outroSeconds = smoke ? 5 : 14;
  const fallbackWalkthroughSeconds = smoke ? 12 : 300;
  const availableWalkthroughSeconds =
    (renderableRecording?.kind === 'frame-recording' ? walkthroughDurationOverrideSeconds : null) ||
    detectedWalkthroughSeconds ||
    fallbackWalkthroughSeconds;
  const totalOverride = durationOverrideSeconds;
  const maxWalkthroughSeconds = totalOverride
    ? Math.max(1, totalOverride - introSeconds - outroSeconds)
    : availableWalkthroughSeconds;
  const walkthroughSeconds = Math.max(1, Math.min(availableWalkthroughSeconds, maxWalkthroughSeconds));
  const durationSeconds = introSeconds + walkthroughSeconds + outroSeconds;
  const proofData = {
    title: manifest.taskSummary || 'QA verification',
    verdict: manifest.verdict || manifest.finalVerdict || 'pending',
    durationInFrames: Math.ceil(durationSeconds * fps),
    fps,
    screenshots,
    walkthrough: walkthroughAsset
      ? {
          src: walkthroughAsset,
          durationSeconds: walkthroughSeconds,
          sourceDurationSeconds: detectedWalkthroughSeconds,
          assembledFromFrames: Boolean(renderableRecording?.assembledFromFrames)
        }
      : walkthroughFrames.length
        ? {
            src: null,
            durationSeconds: walkthroughSeconds,
            sourceDurationSeconds: detectedWalkthroughSeconds,
            assembledFromFrames: false,
            frameRecording: true
          }
      : null,
    walkthroughVideo: walkthroughAsset,
    walkthroughFrames,
    walkthroughFrameFps: renderableRecording?.fps || 6,
    recordingSource: renderableRecording
      ? {
          kind: renderableRecording.sourcePath
            ? renderableRecording.assembledFromFrames
              ? 'browser-use-frame-recording-video'
              : 'browser-walkthrough-video'
            : 'browser-use-frame-recording',
          path: renderableRecording.sourcePath ? path.relative(runDir, renderableRecording.sourcePath) : null,
          metadataPath: renderableRecording.manifestPath ? path.relative(runDir, renderableRecording.manifestPath) : null,
          framesDirectory: renderableRecording.framesDir ? path.relative(runDir, renderableRecording.framesDir) : null,
          frameCount: renderableRecording.frames?.length || renderableRecording.frameCount || null,
          fps: renderableRecording.fps || null,
          assembledFromFrames: Boolean(renderableRecording.assembledFromFrames),
          durationSeconds: detectedWalkthroughSeconds || renderableRecording.durationSeconds || null
        }
      : null,
    walkthroughDurationSeconds: walkthroughSeconds,
    timing: {
      introSeconds,
      walkthroughSeconds,
      outroSeconds,
      targetProofVideoSeconds: {
        min: 300,
        max: 600
      },
      smokeMode: smoke,
      durationOverrideSeconds: durationOverrideSeconds || null
    },
    proofVideoPolicy: {
      primaryEvidence: 'browser-walkthrough-recording',
      screenshotRole: 'supporting-chapter-evidence',
      requiresPassingVerdict: !allowNonPassingReport,
      requiresWalkthroughRecording: !allowNonPassingReport,
      allowNonPassingReport,
      allowFrameRecording,
      cleanGates: hasCleanGates(manifest),
      passingVerdict: isPassingVerdict(manifest)
    },
    gates: manifest.gates || {},
    hasAudio,
    narrationSegments: renderedNarrationSegments,
    routesTested: manifest.routesTested || [],
    commandsRun: manifest.commandsRun || [],
    checks: manifest.checks || [],
    blockers: manifest.blockers || [],
    reportSummary
  };

  fs.writeFileSync(
    path.join(workDir, 'src/proof-data.ts'),
    `export const proofData = ${JSON.stringify(proofData, null, 2)} as const;\n`
  );

  if (!fs.existsSync(path.join(workDir, 'node_modules'))) {
    run('npm', ['install', '--silent'], { cwd: workDir, inherit: true });
  }

  run('npx', ['remotion', 'render', 'QAVideo', outputPath, '--codec=h264', '--audio-codec=aac', '--overwrite', '--log=warn'], {
    cwd: workDir,
    inherit: true,
  });

  if (dryRun) {
    console.log(`QA proof video dry-run completed: ${outputPath}`);
    process.exit(0);
  }

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
    throw new Error('Remotion finished but qa-proof-video.mp4 was not created.');
  }
  updateManifest(outputPath, hasAudio || renderedNarrationSegments.length > 0, renderableRecording, walkthroughSeconds, renderedNarrationSegments);
  console.log(`QA proof video written: ${outputPath}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
