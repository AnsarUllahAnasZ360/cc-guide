import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const DEFAULT_FPS = 6;

function nowIso() {
  return new Date().toISOString();
}

function safeName(value) {
  return String(value || 'browser-walkthrough')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'browser-walkthrough';
}

function decodeImagePayload(image) {
  if (!image) throw new Error('Recorder capture returned no image.');

  if (Buffer.isBuffer(image)) return image;
  if (image instanceof Uint8Array) return Buffer.from(image);

  let base64 = '';
  if (typeof image === 'string') {
    base64 = image;
  } else if (typeof image.toBase64 === 'function') {
    base64 = image.toBase64();
  } else {
    throw new Error('Recorder capture must return a Buffer, base64 string, or Browser Use Image with toBase64().');
  }

  const normalized = base64.includes(',') ? base64.split(',').pop() : base64;
  return Buffer.from(normalized || '', 'base64');
}

function readManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    return {};
  }
}

function writeManifest(manifestPath, manifest) {
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function tryEncodeVideo({ framesDir, outputPath, fps }) {
  const ffmpeg = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  if (ffmpeg.status !== 0) return false;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const result = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-framerate',
      String(fps),
      '-pattern_type',
      'glob',
      '-i',
      path.join(framesDir, 'frame-*.png'),
      '-vf',
      'scale=1280:-2:flags=lanczos,pad=1280:720:(ow-iw)/2:(oh-ih)/2',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      outputPath
    ],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  );

  return result.status === 0 && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0;
}

export function createBrowserUseFrameRecorder(options = {}) {
  const runDir = path.resolve(options.runDir || process.cwd());
  const fps = Number.isFinite(Number(options.fps)) && Number(options.fps) > 0 ? Number(options.fps) : DEFAULT_FPS;
  const label = safeName(options.label);
  const capture = options.capture;
  const encodeVideo = options.encodeVideo === true;

  if (typeof capture !== 'function') {
    throw new Error('createBrowserUseFrameRecorder requires a capture function, such as () => tab.cua.get_visible_screenshot().');
  }

  const recordingDir = path.join(runDir, 'recordings', label);
  const framesDir = path.join(recordingDir, 'frames');
  const metadataPath = path.join(recordingDir, 'metadata.json');
  const videoPath = path.join(recordingDir, 'walkthrough.mp4');
  const manifestPath = path.join(runDir, 'manifest.json');

  let interval = null;
  let startedAtMs = 0;
  let frameIndex = 0;
  let capturing = false;
  let stopped = false;
  const marks = [];
  const errors = [];

  const metadata = {
    kind: 'browser-use-frame-recording',
    label,
    fps,
    startedAt: null,
    stoppedAt: null,
    durationSeconds: 0,
    frameCount: 0,
    framesDirectory: path.relative(runDir, framesDir),
    framePattern: 'frame-*.png',
    videoPath: null,
    errors,
    marks
  };

  function persistMetadata() {
    fs.mkdirSync(recordingDir, { recursive: true });
    fs.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
  }

  function updateManifest() {
    const manifest = readManifest(manifestPath);
    manifest.recordings = manifest.recordings || {};
    manifest.artifacts = manifest.artifacts || {};
    manifest.recordings.walkthrough = {
      kind: metadata.kind,
      path: path.relative(runDir, metadataPath),
      framesDirectory: metadata.framesDirectory,
      frameCount: metadata.frameCount,
      fps: metadata.fps,
      durationSeconds: metadata.durationSeconds,
      videoPath: metadata.videoPath
    };
    manifest.artifacts.walkthroughRecording = manifest.recordings.walkthrough.path;
    manifest.walkthroughDurationSeconds = metadata.durationSeconds;
    writeManifest(manifestPath, manifest);
  }

  async function captureFrame(reason = 'interval') {
    if (capturing || stopped) return null;
    capturing = true;
    try {
      fs.mkdirSync(framesDir, { recursive: true });
      const payload = await capture();
      const buffer = decodeImagePayload(payload);
      if (buffer.length === 0) throw new Error('Captured frame was empty.');
      frameIndex += 1;
      const frameName = `frame-${String(frameIndex).padStart(6, '0')}.png`;
      const framePath = path.join(framesDir, frameName);
      fs.writeFileSync(framePath, buffer);
      metadata.frameCount = frameIndex;
      metadata.durationSeconds = startedAtMs ? Math.max(0, (Date.now() - startedAtMs) / 1000) : 0;
      metadata.lastFrameReason = reason;
      persistMetadata();
      updateManifest();
      return framePath;
    } catch (error) {
      errors.push({
        at: nowIso(),
        reason,
        message: error instanceof Error ? error.message : String(error)
      });
      persistMetadata();
      return null;
    } finally {
      capturing = false;
    }
  }

  return {
    metadataPath,
    framesDir,
    videoPath,
    async start() {
      if (interval) return metadata;
      stopped = false;
      startedAtMs = Date.now();
      metadata.startedAt = nowIso();
      fs.mkdirSync(framesDir, { recursive: true });
      persistMetadata();
      updateManifest();
      await captureFrame('start');
      interval = setInterval(() => {
        void captureFrame('interval');
      }, Math.max(100, Math.round(1000 / fps)));
      return metadata;
    },
    async mark(name) {
      marks.push({ at: nowIso(), name: String(name || 'mark'), frame: frameIndex });
      persistMetadata();
      updateManifest();
      await captureFrame(`mark:${name || 'mark'}`);
      return metadata;
    },
    async captureFrame(reason) {
      return captureFrame(reason || 'manual');
    },
    async stop() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      await captureFrame('stop');
      stopped = true;
      metadata.stoppedAt = nowIso();
      metadata.durationSeconds = startedAtMs ? Math.max(0, (Date.now() - startedAtMs) / 1000) : 0;
      metadata.frameCount = frameIndex;
      if (encodeVideo && frameIndex > 0 && tryEncodeVideo({ framesDir, outputPath: videoPath, fps })) {
        metadata.videoPath = path.relative(runDir, videoPath);
      }
      persistMetadata();
      updateManifest();
      return metadata;
    }
  };
}
