#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  boolFlag,
  ensureDir,
  fileOk,
  readJson,
  readTextIfExists,
  relativeTo,
  run,
  scriptPaths,
  updateManifestEvidence,
  valueFor,
  writeJson
} from './proof-video-utils.mjs';

const args = process.argv.slice(2);
const { pluginRoot } = scriptPaths(import.meta.url);

function usage() {
  console.log(`Generate Deepgram narration audio and captions for a proof video.

Usage:
  node plugins/qa/scripts/generate-deepgram-narration.mjs <run-dir> [--script narration.txt] [--model aura-2-thalia-en] [--skip-if-missing-key]

Reads DEEPGRAM_API_KEY first, then the existing deepgram-key helper. Writes proof-video/audio/narration.mp3 and proof-video/audio/narration.vtt when a key is available.`);
}

const runArg = args.find(arg => !arg.startsWith('--'));
if (!runArg || boolFlag(args, '--help') || boolFlag(args, '-h')) {
  usage();
  process.exit(runArg ? 0 : 1);
}

const runDir = path.resolve(runArg);
const outputDir = path.resolve(valueFor(args, '--output-dir', path.join(runDir, 'proof-video', 'audio')));
const audioPath = path.resolve(valueFor(args, '--audio', path.join(outputDir, 'narration.mp3')));
const captionsPath = path.resolve(valueFor(args, '--captions', path.join(outputDir, 'narration.vtt')));
const metadataPath = path.resolve(valueFor(args, '--metadata', path.join(outputDir, 'narration.json')));
const model = valueFor(args, '--model', process.env.DEEPGRAM_MODEL || 'aura-2-thalia-en');
const skipIfMissingKey = boolFlag(args, '--skip-if-missing-key') || boolFlag(args, '--optional');

function deepgramKey() {
  if (process.env.DEEPGRAM_API_KEY) return { source: 'env', value: process.env.DEEPGRAM_API_KEY };
  const result = run('node', [path.join(pluginRoot, 'scripts/deepgram-key.mjs'), 'get'], { check: false });
  if (result.status === 0 && String(result.stdout || '').trim()) {
    return { source: 'deepgram-key helper', value: String(result.stdout).trim() };
  }
  return { source: null, value: '' };
}

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function textFromInputs() {
  const scriptArg = valueFor(args, '--script', '') || valueFor(args, '--text-file', '');
  if (scriptArg) return readTextIfExists(path.resolve(scriptArg));
  const inline = valueFor(args, '--text', '');
  if (inline) return inline;
  const narrationText = path.join(runDir, 'narration.txt');
  if (fs.existsSync(narrationText)) return readTextIfExists(narrationText);
  const manifest = readJson(path.join(runDir, 'manifest.json'), {});
  const report = readTextIfExists(path.join(runDir, 'verification-report.md')).replace(/\s+/g, ' ').slice(0, 900);
  return [
    manifest.taskSummary || 'This proof video summarizes the QA evidence for the requested work.',
    report || 'The verification report and manifest contain the detailed evidence trail.'
  ].join(' ');
}

function chunkText(text, maxLength = 1900) {
  const normalized = normalizeText(text);
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

function secondsToVttTime(seconds) {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const ms = totalMs % 1000;
  const totalSeconds = Math.floor(totalMs / 1000);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function writeCaptions(chunks) {
  let cursor = 0;
  const cues = ['WEBVTT', ''];
  for (const [index, chunk] of chunks.entries()) {
    const duration = Math.max(4, Math.min(16, chunk.length / 16));
    const start = cursor;
    const end = cursor + duration;
    cues.push(String(index + 1));
    cues.push(`${secondsToVttTime(start)} --> ${secondsToVttTime(end)}`);
    cues.push(chunk);
    cues.push('');
    cursor = end;
  }
  fs.writeFileSync(captionsPath, cues.join('\n'));
}

async function synthesize(text, key) {
  const response = await fetch(`https://api.deepgram.com/v1/speak?model=${encodeURIComponent(model)}`, {
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
  return Buffer.from(await response.arrayBuffer());
}

try {
  ensureDir(outputDir);
  const text = normalizeText(textFromInputs());
  if (!text) throw new Error('No narration text was available.');
  const chunks = chunkText(text);
  const key = deepgramKey();
  const status = {
    status: 'pending',
    model,
    keySource: key.source,
    textCharacters: text.length,
    chunks: chunks.length,
    audioPath: relativeTo(runDir, audioPath),
    captionsPath: relativeTo(runDir, captionsPath),
    generatedAt: new Date().toISOString()
  };

  writeCaptions(chunks);

  if (!key.value) {
    status.status = 'skipped-missing-key';
    status.reason = 'DEEPGRAM_API_KEY was not set and the deepgram-key helper had no stored key.';
    writeJson(metadataPath, status);
    updateManifestEvidence(runDir, manifest => {
      manifest.artifacts = manifest.artifacts || {};
      manifest.proofVideoPipeline = manifest.proofVideoPipeline || {};
      manifest.artifacts.narrationCaptions = relativeTo(runDir, captionsPath);
      manifest.artifacts.narrationMetadata = relativeTo(runDir, metadataPath);
      manifest.proofVideoPipeline.narration = status;
      return manifest;
    });
    console.log(JSON.stringify(status, null, 2));
    process.exit(skipIfMissingKey ? 0 : 1);
  }

  const audioBuffer = await synthesize(chunks.join('\n\n'), key.value);
  fs.writeFileSync(audioPath, audioBuffer);
  if (!fileOk(audioPath, 1000)) throw new Error('Deepgram returned an empty or invalid audio file.');
  status.status = 'generated';
  status.sizeBytes = fs.statSync(audioPath).size;
  writeJson(metadataPath, status);
  updateManifestEvidence(runDir, manifest => {
    manifest.artifacts = manifest.artifacts || {};
    manifest.proofVideoPipeline = manifest.proofVideoPipeline || {};
    manifest.artifacts.narration = relativeTo(runDir, audioPath);
    manifest.artifacts.narrationCaptions = relativeTo(runDir, captionsPath);
    manifest.artifacts.narrationMetadata = relativeTo(runDir, metadataPath);
    manifest.proofVideoPipeline.narration = status;
    return manifest;
  });
  console.log(JSON.stringify(status, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

