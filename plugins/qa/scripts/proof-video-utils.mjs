import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

export const FORBIDDEN_MANIFEST_FIELDS = [
  'finalVerdict',
  'verdict',
  'gates',
  'requiredGates',
  'required_gates',
  'testGates',
  'test_gates',
  'runtimeGates',
  'runtime_gates',
  'mergeStatus',
  'merge_status',
  'passStatus',
  'pass_status',
  'status',
  'outcome',
  'finalOutcome',
  'reportOutcome'
];

export function nowIso() {
  return new Date().toISOString();
}

export function scriptPaths(importMetaUrl) {
  const scriptDir = path.dirname(new URL(importMetaUrl).pathname);
  const pluginRoot = path.resolve(scriptDir, '..');
  return {
    scriptDir,
    pluginRoot,
    remotionTemplateDir: path.join(pluginRoot, 'assets/remotion-template')
  };
}

export function valueFor(args, flag, fallback = '') {
  const eq = args.find(arg => arg.startsWith(`${flag}=`));
  if (eq) return eq.slice(flag.length + 1);
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : fallback;
}

export function boolFlag(args, flag) {
  return args.includes(flag);
}

export function numberFor(args, flag, fallback = null) {
  const raw = valueFor(args, flag, '');
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

export function readJson(filePath, fallback = null) {
  if (!filePath || !fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

export function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function readTextIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

export function fileOk(filePath, minBytes = 1) {
  return Boolean(
    filePath &&
      fs.existsSync(filePath) &&
      fs.statSync(filePath).isFile() &&
      fs.statSync(filePath).size >= minBytes
  );
}

export function resolveRunPath(runDir, maybePath) {
  if (!maybePath || typeof maybePath !== 'string') return null;
  return path.isAbsolute(maybePath) ? maybePath : path.join(runDir, maybePath);
}

export function relativeTo(runDir, filePath) {
  return path.relative(runDir, filePath).replaceAll(path.sep, '/');
}

export function safeName(value, fallback = 'artifact') {
  return (
    String(value || fallback)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 90) || fallback
  );
}

export function run(command, args = [], options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || process.cwd(),
    encoding: options.encoding === false ? undefined : 'utf8',
    input: options.input,
    maxBuffer: options.maxBuffer || 30 * 1024 * 1024,
    stdio: options.inherit ? 'inherit' : ['pipe', 'pipe', 'pipe']
  });
  if (options.check !== false && result.status !== 0) {
    const rendered = [command, ...args].join(' ');
    const stderr = result.stderr ? String(result.stderr).trim() : '';
    const stdout = result.stdout ? String(result.stdout).trim() : '';
    throw new Error(`Command failed: ${rendered}${stderr ? `\n${stderr}` : ''}${stdout ? `\n${stdout}` : ''}`);
  }
  return result;
}

export function commandStatus(command, args = ['--version']) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  return {
    name: command,
    ok: result.status === 0,
    version: result.status === 0 ? String(result.stdout || result.stderr || '').trim().split('\n')[0] : null,
    error: result.status === 0 ? null : String(result.stderr || result.stdout || '').trim()
  };
}

export function copyRecursive(source, target) {
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    ensureDir(target);
    for (const entry of fs.readdirSync(source)) {
      if (entry === 'node_modules' || entry === '.git' || entry === 'dist') continue;
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
    return;
  }
  ensureDir(path.dirname(target));
  fs.copyFileSync(source, target);
}

function forbiddenSnapshot(manifest) {
  const snapshot = {};
  for (const field of FORBIDDEN_MANIFEST_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(manifest || {}, field)) {
      snapshot[field] = manifest[field];
    }
  }
  return JSON.stringify(snapshot);
}

export function updateManifestEvidence(runDir, updater) {
  const manifestPath = path.join(runDir, 'manifest.json');
  const before = readJson(manifestPath, {});
  const beforeForbidden = forbiddenSnapshot(before);
  const after = updater(structuredClone(before || {})) || before || {};
  const afterForbidden = forbiddenSnapshot(after);
  if (beforeForbidden !== afterForbidden) {
    throw new Error(
      `Refusing to write manifest.json because a proof-video script attempted to mutate a verdict, gate, status, or outcome field. Protected fields: ${FORBIDDEN_MANIFEST_FIELDS.join(', ')}`
    );
  }
  writeJson(manifestPath, after);
  return after;
}

export function appendPipelineEvent(runDir, event) {
  const proofDir = ensureDir(path.join(runDir, 'proof-video'));
  const eventsPath = path.join(proofDir, 'pipeline-events.jsonl');
  fs.appendFileSync(eventsPath, `${JSON.stringify({ at: nowIso(), ...event })}\n`);
  return eventsPath;
}

export function writeProofReport(runDir, report) {
  const proofDir = ensureDir(path.join(runDir, 'proof-video'));
  const reportPath = path.join(proofDir, 'proof-video-report.json');
  writeJson(reportPath, {
    updatedAt: nowIso(),
    ...report
  });
  updateManifestEvidence(runDir, manifest => {
    manifest.artifacts = manifest.artifacts || {};
    manifest.proofVideoPipeline = manifest.proofVideoPipeline || {};
    manifest.artifacts.proofVideoReport = relativeTo(runDir, reportPath);
    manifest.proofVideoPipeline.report = relativeTo(runDir, reportPath);
    manifest.proofVideoPipeline.updatedAt = nowIso();
    return manifest;
  });
  return reportPath;
}

export function findFirstExisting(paths) {
  return paths.find(candidate => candidate && fs.existsSync(candidate)) || null;
}

