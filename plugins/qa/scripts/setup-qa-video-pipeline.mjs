#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  boolFlag,
  commandStatus,
  ensureDir,
  fileOk,
  readJson,
  relativeTo,
  run,
  scriptPaths,
  updateManifestEvidence,
  valueFor,
  writeJson
} from './proof-video-utils.mjs';

const args = process.argv.slice(2);
const { remotionTemplateDir, scriptDir, pluginRoot } = scriptPaths(import.meta.url);

function usage() {
  console.log(`Check and bootstrap the QA proof-video pipeline.

Usage:
  node plugins/qa/scripts/setup-qa-video-pipeline.mjs [run-dir] [--install] [--smoke]

Checks Node/npm/pnpm/bun, Playwright CLI/module/browser availability, ffmpeg/ffprobe, Remotion template install, Deepgram key status, artifact directories, and optional tiny smoke-video rendering.`);
}

if (boolFlag(args, '--help') || boolFlag(args, '-h')) {
  usage();
  process.exit(0);
}

const runArg = args.find(arg => !arg.startsWith('--'));
const runDir = path.resolve(runArg || path.join(process.cwd(), 'qa-artifacts'));
const install = boolFlag(args, '--install');
const installTemplate = install || boolFlag(args, '--install-template');
const installPlaywright = install || boolFlag(args, '--install-playwright');
const smoke = boolFlag(args, '--smoke');
const playwrightRuntimeDir = path.join(runDir, 'tmp', 'playwright-runtime');

function checkNodeImport(packageName) {
  const result = run('node', ['-e', `import(${JSON.stringify(packageName)}).then(()=>process.exit(0)).catch(()=>process.exit(1))`], {
    check: false
  });
  return result.status === 0;
}

function checkRuntimeImport(packageName) {
  const packageJson = path.join(playwrightRuntimeDir, 'package.json');
  if (!fs.existsSync(packageJson)) return false;
  const script = [
    "import { createRequire } from 'node:module';",
    `const require = createRequire(${JSON.stringify(packageJson)});`,
    `await import(require.resolve(${JSON.stringify(packageName)}));`
  ].join('\n');
  const result = run('node', ['--input-type=module', '-e', script], { check: false });
  return result.status === 0;
}

function installPlaywrightRuntime() {
  ensureDir(playwrightRuntimeDir);
  const packageJson = path.join(playwrightRuntimeDir, 'package.json');
  if (!fs.existsSync(packageJson)) {
    writeJson(packageJson, {
      private: true,
      type: 'module',
      dependencies: {}
    });
  }
  const installResult = run('npm', ['install', '--silent', 'playwright'], {
    cwd: playwrightRuntimeDir,
    check: false,
    inherit: true
  });
  const browserResult =
    installResult.status === 0
      ? run('npx', ['playwright', 'install', 'chromium'], {
          cwd: playwrightRuntimeDir,
          check: false,
          inherit: true
        })
      : { status: 1 };
  return {
    attempted: true,
    runtimeDir: playwrightRuntimeDir,
    npmInstallStatus: installResult.status,
    chromiumInstallStatus: browserResult.status,
    moduleAvailable: checkRuntimeImport('playwright')
  };
}

function deepgramStatus() {
  if (process.env.DEEPGRAM_API_KEY) return { configured: true, source: 'env' };
  const result = run('node', [path.join(pluginRoot, 'scripts/deepgram-key.mjs'), 'status'], { check: false });
  return {
    configured: result.status === 0,
    source: result.status === 0 ? 'deepgram-key helper' : null
  };
}

function playwrightBrowserSmoke() {
  const script = [
    "import { chromium } from 'playwright';",
    "const browser = await chromium.launch({ headless: true });",
    "const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });",
    "await page.goto('data:text/html,<title>qa-smoke</title><main>ok</main>');",
    "const title = await page.title();",
    "await browser.close();",
    "if (title !== 'qa-smoke') process.exit(2);"
  ].join('\n');
  const result = run('node', ['--input-type=module', '-e', script], { check: false });
  return {
    ok: result.status === 0,
    error: result.status === 0 ? null : String(result.stderr || result.stdout || '').trim()
  };
}

function playwrightRuntimeBrowserSmoke() {
  const packageJson = path.join(playwrightRuntimeDir, 'package.json');
  if (!fs.existsSync(packageJson)) return { ok: false, error: 'Playwright runtime is not installed.' };
  const script = [
    "import { createRequire } from 'node:module';",
    `const require = createRequire(${JSON.stringify(packageJson)});`,
    "const mod = await import(require.resolve('playwright'));",
    "const chromium = mod.chromium || mod.default?.chromium;",
    "if (!chromium) throw new Error('Playwright chromium export was not found.');",
    "const browser = await chromium.launch({ headless: true });",
    "const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });",
    "await page.goto('data:text/html,<title>qa-smoke</title><main>ok</main>');",
    "const title = await page.title();",
    "await browser.close();",
    "if (title !== 'qa-smoke') process.exit(2);"
  ].join('\n');
  const result = run('node', ['--input-type=module', '-e', script], { check: false });
  return {
    ok: result.status === 0,
    error: result.status === 0 ? null : String(result.stderr || result.stdout || '').trim()
  };
}

function remotionTemplateStatus() {
  const packageJson = path.join(remotionTemplateDir, 'package.json');
  const nodeModules = path.join(remotionTemplateDir, 'node_modules');
  const status = {
    exists: fs.existsSync(packageJson),
    installed: fs.existsSync(nodeModules),
    packageJson: packageJson,
    nodeModules: nodeModules
  };
  if (installTemplate && status.exists && !status.installed) {
    const result = run('npm', ['install', '--silent'], { cwd: remotionTemplateDir, check: false, inherit: true });
    status.installAttempted = true;
    status.installed = result.status === 0 && fs.existsSync(nodeModules);
    status.installStatus = result.status;
  }
  return status;
}

function createTinyRawVideo(smokeRunDir) {
  const rawDir = ensureDir(path.join(smokeRunDir, 'proof-video', 'raw'));
  const rawPath = path.join(rawDir, 'browser-walkthrough.webm');
  run(
    'ffmpeg',
    [
      '-y',
      '-f',
      'lavfi',
      '-i',
      'testsrc=size=1440x900:rate=30',
      '-t',
      '3',
      '-pix_fmt',
      'yuv420p',
      rawPath
    ],
    { check: true }
  );
  return rawPath;
}

function runSmokeVideo() {
  const smokeRunDir = ensureDir(path.join(runDir, 'smoke-run'));
  ensureDir(path.join(smokeRunDir, 'logs'));
  ensureDir(path.join(smokeRunDir, 'proof-video'));
	writeJson(path.join(smokeRunDir, 'manifest.json'), {
		taskSummary: 'QA proof video smoke test',
		runId: 'qa-video-smoke',
		createdAt: new Date().toISOString(),
		cwd: process.cwd(),
		verdict: null,
		finalVerdict: null,
		commandsRun: [],
		routesTested: ['data:text/html,qa-smoke'],
    checks: [],
    artifacts: {},
    recordings: {},
    blockers: [],
    commitHash: null,
    sprintFolder: null,
    mode: 'smoke',
    gitBranch: null,
    gitHead: null
  });
  fs.writeFileSync(path.join(smokeRunDir, 'verification-report.md'), '# QA Proof Video Smoke Test\n\nThis is a generic smoke artifact.\n');
  const rawPath = createTinyRawVideo(smokeRunDir);
  const smokeLogPath = path.join(smokeRunDir, 'proof-video', 'logs', 'playwright-proof-walkthrough.json');
  writeJson(smokeLogPath, {
    status: 'completed',
    finalUrl: 'data:text/html,qa-smoke',
    finalTitle: 'qa-smoke',
    steps: [{ id: 'open-target', action: 'goto', status: 'passed' }]
  });
	updateManifestEvidence(smokeRunDir, manifest => {
    manifest.artifacts = manifest.artifacts || {};
    manifest.proofVideoPipeline = manifest.proofVideoPipeline || {};
    manifest.artifacts.rawProofVideo = relativeTo(smokeRunDir, rawPath);
    manifest.artifacts.playwrightExecutionLog = relativeTo(smokeRunDir, smokeLogPath);
    manifest.proofVideoPipeline.recording = {
      path: relativeTo(smokeRunDir, rawPath),
      executionLog: relativeTo(smokeRunDir, smokeLogPath)
    };
		return manifest;
	});
	const rawValidation = run('node', [path.join(scriptDir, 'validate-proof-video.mjs'), smokeRunDir, '--kind', 'raw'], {
		check: false,
		inherit: true
	});
	if (rawValidation.status !== 0) {
		return {
			ok: false,
			runDir: smokeRunDir,
			videoPath: null,
			status: rawValidation.status,
			failedStep: 'validate-raw-video'
		};
	}
	const intro = run(
		'node',
		[
			path.join(scriptDir, 'render-remotion-proof-segment.mjs'),
			smokeRunDir,
			'--kind',
			'intro',
			'--duration-seconds',
			'3',
			'--title',
			'QA Pipeline Smoke Test',
			'--subtitle',
			'Setup verified Remotion bookends, a raw recording, ffmpeg stitching, and final validation.'
		],
		{ check: false, inherit: true }
	);
	if (intro.status !== 0) {
		return {
			ok: false,
			runDir: smokeRunDir,
			videoPath: null,
			status: intro.status,
			failedStep: 'render-intro-segment'
		};
	}
	const result = run(
		'node',
		[
			path.join(scriptDir, 'assemble-proof-video-segments.mjs'),
			smokeRunDir,
			'--intro',
			'proof-video/remotion/intro.mp4',
			'--walkthrough',
			'proof-video/raw/browser-walkthrough.webm'
		],
		{ check: false, inherit: true }
	);
	const finalPath = path.join(smokeRunDir, 'proof-video', 'final', 'qa-proof-video-polished.mp4');
	return {
		ok: result.status === 0 && fileOk(finalPath, 100000),
		runDir: smokeRunDir,
		videoPath: finalPath,
		status: result.status
	};
}

try {
  ensureDir(path.join(runDir, 'proof-video'));
  ensureDir(path.join(runDir, 'manifests'));
  ensureDir(path.join(runDir, 'evidence'));
  ensureDir(path.join(runDir, 'proof-video', 'plans'));
  ensureDir(path.join(runDir, 'proof-video', 'raw'));
  ensureDir(path.join(runDir, 'proof-video', 'audio'));
  ensureDir(path.join(runDir, 'proof-video', 'remotion'));
  ensureDir(path.join(runDir, 'proof-video', 'final'));
  ensureDir(path.join(runDir, 'proof-video', 'frames'));
  ensureDir(path.join(runDir, 'proof-video', 'logs'));
  ensureDir(path.join(runDir, 'tmp'));
  ensureDir(path.join(runDir, 'logs'));
  ensureDir(path.join(runDir, 'recordings'));
  const playwrightInstall = installPlaywright ? installPlaywrightRuntime() : null;
  const checks = {
    runDir,
    runtimes: {
      node: commandStatus('node', ['--version']),
      npm: commandStatus('npm', ['--version']),
      pnpm: commandStatus('pnpm', ['--version']),
      bun: commandStatus('bun', ['--version'])
    },
    playwright: {
      moduleAvailable: checkNodeImport('playwright'),
      testModuleAvailable: checkNodeImport('@playwright/test'),
      cli: commandStatus('npx', ['--no-install', 'playwright', '--version']),
      install: playwrightInstall,
      runtimeModuleAvailable: checkRuntimeImport('playwright')
    },
    media: {
      ffmpeg: commandStatus('ffmpeg', ['-version']),
      ffprobe: commandStatus('ffprobe', ['-version'])
    },
	    remotionTemplate: remotionTemplateStatus(),
	    deepgram: deepgramStatus(),
	    deepgramSetupHint:
	      'Set DEEPGRAM_API_KEY in your shell or store it locally with: printf %s \"$DEEPGRAM_API_KEY\" | node plugins/qa/scripts/deepgram-key.mjs set. Never commit the key.',
	    companionPlugins: {
	      browserUse: {
	        requiredFor: 'web QA verification',
	        status: 'verify in Codex plugin/session context',
	        setupHint: 'Install or enable Browser Use in Codex. Invoke it explicitly for browser-facing QA.'
	      },
	      computerUse: {
	        requiredFor: 'native/system/real-profile/desktop/multi-app fallback workflows',
	        status: 'verify in Codex plugin/session context',
	        setupHint: 'Install or enable Computer Use only when fallback workflows require it.'
	      },
	      agentBrowserCli: {
	        requiredFor: 'last fallback only',
	        status: 'not required for the primary pipeline',
	        setupHint: 'Do not use as the default proof-video recorder.'
	      }
	    },
	    artifactDirs: {
      proofVideo: fs.existsSync(path.join(runDir, 'proof-video')),
      manifests: fs.existsSync(path.join(runDir, 'manifests')),
      evidence: fs.existsSync(path.join(runDir, 'evidence')),
      plans: fs.existsSync(path.join(runDir, 'proof-video', 'plans')),
      raw: fs.existsSync(path.join(runDir, 'proof-video', 'raw')),
      audio: fs.existsSync(path.join(runDir, 'proof-video', 'audio')),
      remotion: fs.existsSync(path.join(runDir, 'proof-video', 'remotion')),
      final: fs.existsSync(path.join(runDir, 'proof-video', 'final')),
      frames: fs.existsSync(path.join(runDir, 'proof-video', 'frames')),
      logs: fs.existsSync(path.join(runDir, 'logs')),
      recordings: fs.existsSync(path.join(runDir, 'recordings')),
      tmp: fs.existsSync(path.join(runDir, 'tmp'))
    },
    smoke: null
  };
  if (checks.playwright.moduleAvailable) {
    checks.playwright.browserSmoke = playwrightBrowserSmoke();
  } else if (checks.playwright.runtimeModuleAvailable) {
    checks.playwright.browserSmoke = playwrightRuntimeBrowserSmoke();
  }
  if (smoke) {
    checks.smoke = runSmokeVideo();
  }
  const requiredOk =
    checks.runtimes.node.ok &&
    checks.runtimes.npm.ok &&
    checks.media.ffmpeg.ok &&
    checks.media.ffprobe.ok &&
    (checks.playwright.moduleAvailable || checks.playwright.runtimeModuleAvailable || checks.playwright.cli.ok) &&
    checks.remotionTemplate.exists &&
    (!installTemplate || checks.remotionTemplate.installed) &&
    (!smoke || checks.smoke?.ok);
  const report = {
    ok: requiredOk,
    checkedAt: new Date().toISOString(),
    checks
  };
  const reportPath = path.join(runDir, 'proof-video', 'setup-check.json');
  writeJson(reportPath, report);
  console.log(JSON.stringify(report, null, 2));
  process.exit(requiredOk ? 0 : 1);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
