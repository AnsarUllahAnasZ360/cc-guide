#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import {
  boolFlag,
  ensureDir,
  fileOk,
  numberFor,
  readJson,
  relativeTo,
  run,
  safeName,
  updateManifestEvidence,
  valueFor,
  writeJson
} from './proof-video-utils.mjs';

const args = process.argv.slice(2);

function usage() {
  console.log(`Record a plan-driven Playwright proof walkthrough.

Usage:
  node plugins/qa/scripts/record-playwright-proof-walkthrough.mjs <run-dir> [--plan proof-video/plans/proof-walkthrough.plan.json] [--headed]

The recorder uses one browser context and one page by default, a fixed 1440x900 viewport, and writes a structured execution log. It only appends proof-video evidence metadata.`);
}

const runArg = args.find(arg => !arg.startsWith('--'));
if (!runArg || boolFlag(args, '--help') || boolFlag(args, '-h')) {
  usage();
  process.exit(runArg ? 0 : 1);
}

const runDir = path.resolve(runArg);
const planPath = path.resolve(valueFor(args, '--plan', path.join(runDir, 'proof-video', 'plans', 'proof-walkthrough.plan.json')));
const outputDir = path.resolve(valueFor(args, '--output-dir', path.join(runDir, 'proof-video', 'raw')));
const logPath = path.resolve(
  valueFor(args, '--log', path.join(runDir, 'proof-video', 'logs', 'playwright-proof-walkthrough.json'))
);
const screenshotDir = path.resolve(valueFor(args, '--screenshot-dir', path.join(runDir, 'proof-video', 'screenshots')));
let playwrightInstallCwd = process.cwd();

async function loadPlaywright() {
  const bases = [
    process.cwd(),
    runDir,
    path.join(runDir, 'tmp', 'playwright-runtime'),
    path.dirname(new URL(import.meta.url).pathname)
  ];
  const names = ['playwright', '@playwright/test'];
  for (const base of bases) {
    const requireFromBase = createRequire(path.join(base, 'package.json'));
    for (const name of names) {
      try {
        const resolved = requireFromBase.resolve(name);
        const mod = await import(pathToFileURL(resolved).href);
        if (mod.chromium || mod.default?.chromium) {
          playwrightInstallCwd = base;
          return mod.chromium ? mod : mod.default;
        }
      } catch {
        // Try the next base/package.
      }
    }
  }
  if (!boolFlag(args, '--no-install-playwright')) {
    const runtimeDir = ensureDir(path.join(runDir, 'tmp', 'playwright-runtime'));
    const packageJson = path.join(runtimeDir, 'package.json');
    if (!fs.existsSync(packageJson)) {
      writeJson(packageJson, {
        private: true,
        type: 'module',
        dependencies: {}
      });
    }
    const install = run('npm', ['install', '--silent', 'playwright'], { cwd: runtimeDir, check: false, inherit: true });
    if (install.status === 0) {
      run('npx', ['playwright', 'install', 'chromium'], { cwd: runtimeDir, check: false, inherit: true });
      const requireFromRuntime = createRequire(packageJson);
      const resolved = requireFromRuntime.resolve('playwright');
      const mod = await import(pathToFileURL(resolved).href);
      if (mod.chromium || mod.default?.chromium) {
        playwrightInstallCwd = runtimeDir;
        return mod.chromium ? mod : mod.default;
      }
    }
  }
  throw new Error('Playwright is not available to Node. Install playwright in the target project or run setup after adding it.');
}

async function launchBrowser(browserType, browserName, headed) {
  try {
    return await browserType.launch({ headless: !headed });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (boolFlag(args, '--no-install-playwright') || !/Executable doesn't exist|Please run.*playwright install/i.test(message)) {
      throw error;
    }
    run('npx', ['playwright', 'install', browserName], { cwd: playwrightInstallCwd, check: false, inherit: true });
    return browserType.launch({ headless: !headed });
  }
}

function timeoutFor(plan, step) {
  return Number(step.timeoutMs || plan.timeoutMs || 15000);
}

async function maybeDelay(ms) {
  if (ms > 0) await new Promise(resolve => setTimeout(resolve, ms));
}

async function installVisualOverlay(context, enabled) {
  if (!enabled) return;
  await context.addInitScript(() => {
    const STYLE_ID = 'qa-proof-visual-style';
    const CURSOR_ID = 'qa-proof-cursor';
    const CALLOUT_ID = 'qa-proof-callout';

    function ensureOverlay() {
      if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
          #${CURSOR_ID} {
            position: fixed;
            left: 0;
            top: 0;
            width: 26px;
            height: 26px;
            z-index: 2147483647;
            pointer-events: none;
            opacity: 0;
            transform: translate3d(-80px, -80px, 0);
            transition: transform 420ms cubic-bezier(.2,.9,.2,1), opacity 160ms ease;
          }
          #${CURSOR_ID}::before {
            content: "";
            position: absolute;
            left: 2px;
            top: 2px;
            width: 0;
            height: 0;
            border-left: 0 solid transparent;
            border-right: 18px solid transparent;
            border-top: 25px solid #101828;
            filter: drop-shadow(0 3px 7px rgba(0,0,0,.28));
            transform: rotate(-16deg);
          }
          #${CURSOR_ID}::after {
            content: attr(data-label);
            position: absolute;
            left: 26px;
            top: 18px;
            max-width: 280px;
            padding: 7px 10px;
            border-radius: 999px;
            background: rgba(16, 24, 40, .88);
            color: #fff;
            font: 700 13px/1.15 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            white-space: nowrap;
            opacity: 0;
            transform: translateY(4px);
            transition: opacity 160ms ease, transform 160ms ease;
          }
          #${CURSOR_ID}[data-label]:not([data-label=""])::after {
            opacity: 1;
            transform: translateY(0);
          }
          .qa-proof-click-ripple {
            position: fixed;
            z-index: 2147483646;
            width: 20px;
            height: 20px;
            margin-left: -10px;
            margin-top: -10px;
            border-radius: 50%;
            border: 4px solid rgba(147, 51, 234, .88);
            background: rgba(147, 51, 234, .14);
            pointer-events: none;
            animation: qaProofRipple 720ms ease-out forwards;
          }
          @keyframes qaProofRipple {
            0% { transform: scale(.45); opacity: 1; }
            100% { transform: scale(3.1); opacity: 0; }
          }
          #${CALLOUT_ID} {
            position: fixed;
            left: 28px;
            top: 76px;
            z-index: 2147483645;
            max-width: min(620px, calc(100vw - 56px));
            padding: 14px 17px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, .26);
            background: rgba(16, 24, 40, .88);
            color: #fff;
            box-shadow: 0 22px 70px rgba(16, 24, 40, .28);
            font: 750 18px/1.25 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            pointer-events: none;
            opacity: 0;
            transform: translateY(-8px);
            transition: opacity 180ms ease, transform 180ms ease;
          }
          #${CALLOUT_ID}.visible {
            opacity: 1;
            transform: translateY(0);
          }
        `;
        document.documentElement.appendChild(style);
      }
      let cursor = document.getElementById(CURSOR_ID);
      if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = CURSOR_ID;
        document.documentElement.appendChild(cursor);
      }
      let callout = document.getElementById(CALLOUT_ID);
      if (!callout) {
        callout = document.createElement('div');
        callout.id = CALLOUT_ID;
        document.documentElement.appendChild(callout);
      }
      return { cursor, callout };
    }

    window.__qaProofVisual = {
      move(x, y, label = '') {
        const { cursor } = ensureOverlay();
        cursor.dataset.label = label || '';
        cursor.style.opacity = '1';
        cursor.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
      },
      click(x, y, label = '') {
        this.move(x, y, label);
        const ripple = document.createElement('div');
        ripple.className = 'qa-proof-click-ripple';
        ripple.style.left = `${Math.round(x)}px`;
        ripple.style.top = `${Math.round(y)}px`;
        document.documentElement.appendChild(ripple);
        window.setTimeout(() => ripple.remove(), 760);
      },
      callout(text = '') {
        const { callout } = ensureOverlay();
        callout.textContent = String(text || '');
        callout.classList.toggle('visible', Boolean(text));
      },
      hideCallout() {
        const { callout } = ensureOverlay();
        callout.classList.remove('visible');
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ensureOverlay, { once: true });
    } else {
      ensureOverlay();
    }
  });
}

async function visualCallout(page, text, holdMs = 0) {
  await page.evaluate(
    ([message]) => {
      window.__qaProofVisual?.callout(message);
    },
    [String(text || '')]
  );
  if (holdMs > 0) await maybeDelay(holdMs);
}

async function visualMove(page, x, y, label = '', moveMs = 420) {
  await page.evaluate(
    ([targetX, targetY, message]) => {
      window.__qaProofVisual?.move(targetX, targetY, message);
    },
    [x, y, String(label || '')]
  );
  await page.mouse.move(x, y, { steps: Math.max(2, Math.round(moveMs / 55)) });
  await maybeDelay(moveMs);
}

async function visualClick(page, x, y, label = '') {
  await page.evaluate(
    ([targetX, targetY, message]) => {
      window.__qaProofVisual?.click(targetX, targetY, message);
    },
    [x, y, String(label || '')]
  );
  await maybeDelay(120);
}

async function locatorCenter(locator, timeout) {
  await locator.scrollIntoViewIfNeeded({ timeout }).catch(() => {});
  const box = await locator.boundingBox({ timeout }).catch(() => null);
  if (!box) throw new Error('Target locator did not produce a visible bounding box for cursor animation.');
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2
  };
}

async function actOnLocator({ page, locator, timeout, label, mode, value }) {
  const center = await locatorCenter(locator, timeout);
  await visualMove(page, center.x, center.y, label, 480);
  if (mode === 'hover') {
    await locator.hover({ timeout });
    return;
  }
  await visualClick(page, center.x, center.y, label);
  if (mode === 'fill') {
    await locator.click({ timeout });
    await locator.fill(String(value ?? ''), { timeout });
    return;
  }
  if (mode === 'type') {
    await locator.click({ timeout });
    await locator.pressSequentially(String(value ?? ''), { delay: 45, timeout });
    return;
  }
  await locator.click({ timeout, delay: 90 });
}

async function runStep({ page, plan, step, index, execution }) {
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  const entry = {
    index,
    id: step.id || `step-${String(index + 1).padStart(3, '0')}`,
    action: step.action,
    description: step.description || null,
    startedAt,
    status: 'running',
    durationMs: null,
    screenshot: null,
    error: null
  };
  execution.steps.push(entry);
  const timeout = timeoutFor(plan, step);
  try {
    if (step.beforeWaitMs) await maybeDelay(Math.max(0, Number(step.beforeWaitMs)));
    if (step.callout) await visualCallout(page, step.callout, Number(step.calloutHoldMs || 0));
    switch (step.action) {
      case 'goto': {
        if (!step.url) throw new Error('goto step requires url.');
        if (/^about:blank$/i.test(step.url)) throw new Error('goto step refuses about:blank.');
        await page.goto(step.url, { waitUntil: step.waitUntil || 'domcontentloaded', timeout });
        break;
      }
      case 'click':
        await actOnLocator({
          page,
          locator: page.locator(step.selector).first(),
          timeout,
          label: step.label || step.description || 'Click',
          mode: 'click'
        });
        break;
      case 'clickText':
        await actOnLocator({
          page,
          locator: page.getByText(String(step.text || step.label || ''), { exact: step.exact === true }).first(),
          timeout,
          label: step.label || step.description || String(step.text || 'Click'),
          mode: 'click'
        });
        break;
      case 'fill':
        await actOnLocator({
          page,
          locator: page.locator(step.selector).first(),
          timeout,
          label: step.label || step.description || 'Fill',
          mode: 'fill',
          value: step.value
        });
        break;
      case 'type':
        await actOnLocator({
          page,
          locator: page.locator(step.selector).first(),
          timeout,
          label: step.label || step.description || 'Type',
          mode: 'type',
          value: step.value
        });
        break;
      case 'setLocalStorage':
        await page.evaluate(([key, value]) => {
          window.localStorage.setItem(String(key), String(value));
        }, [step.key, step.value]);
        break;
      case 'press':
        await page.locator(step.selector || 'body').first().press(String(step.key || 'Enter'), { timeout });
        break;
      case 'hover':
        await actOnLocator({
          page,
          locator: page.locator(step.selector).first(),
          timeout,
          label: step.label || step.description || 'Hover',
          mode: 'hover'
        });
        break;
      case 'check':
        await page.locator(step.selector).first().check({ timeout });
        break;
      case 'uncheck':
        await page.locator(step.selector).first().uncheck({ timeout });
        break;
      case 'selectOption':
        await page.locator(step.selector).first().selectOption(step.value, { timeout });
        break;
      case 'waitForSelector':
        await page.locator(step.selector).first().waitFor({ state: step.state || 'visible', timeout });
        break;
      case 'waitForText':
        await page.getByText(String(step.text || ''), { exact: step.exact === true }).first().waitFor({
          state: step.state || 'visible',
          timeout
        });
        break;
      case 'waitForURL':
        await page.waitForURL(step.url || step.pattern, { timeout });
        break;
      case 'wait':
      case 'waitForTimeout':
        await maybeDelay(Math.max(0, Number(step.ms || step.timeoutMs || 1000)));
        break;
      case 'scroll':
        await visualMove(
          page,
          Number(step.cursorX || plan.viewport?.width / 2 || 720),
          Number(step.cursorY || plan.viewport?.height / 2 || 450),
          step.label || step.description || 'Scroll',
          260
        );
        await page.mouse.wheel(Number(step.deltaX || 0), Number(step.deltaY || step.y || 0));
        break;
      case 'moveCursor':
        await visualMove(page, Number(step.x), Number(step.y), step.label || step.description || '', Number(step.moveMs || 480));
        break;
      case 'showCallout':
        await visualCallout(page, step.text || step.label || step.description || '', Number(step.ms || step.holdMs || 1000));
        break;
      case 'clearCallout':
        await page.evaluate(() => {
          window.__qaProofVisual?.hideCallout();
        });
        break;
      case 'expectText': {
        const body = await page.locator('body').innerText({ timeout });
        if (!body.includes(String(step.text || ''))) throw new Error(`Expected text was not visible: ${step.text}`);
        break;
      }
      case 'expectUrl': {
        const current = page.url();
        if (!current.includes(String(step.includes || step.url || ''))) {
          throw new Error(`URL expectation failed. Current URL: ${current}`);
        }
        break;
      }
      case 'screenshot': {
        ensureDir(screenshotDir);
        const label = safeName(step.label || entry.id, 'screenshot');
        const filePath = path.join(screenshotDir, `${String(index + 1).padStart(3, '0')}-${label}.png`);
        await page.screenshot({ path: filePath, fullPage: step.fullPage === true });
        entry.screenshot = relativeTo(runDir, filePath);
        break;
      }
      default:
        throw new Error(`Unsupported walkthrough action: ${step.action}`);
    }
    if (step.afterWaitMs) await maybeDelay(Math.max(0, Number(step.afterWaitMs)));
    entry.status = 'passed';
  } catch (error) {
    entry.status = 'failed';
    entry.error = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    entry.durationMs = Date.now() - startedMs;
    entry.endedAt = new Date().toISOString();
  }
}

async function main() {
  const plan = readJson(planPath, null);
  if (!plan) throw new Error(`Walkthrough plan not found or invalid: ${planPath}`);
  if (!Array.isArray(plan.steps) || plan.steps.length === 0) throw new Error('Walkthrough plan has no steps.');

  ensureDir(outputDir);
  ensureDir(path.dirname(logPath));
  ensureDir(screenshotDir);

  const playwright = await loadPlaywright();
  const browserName = valueFor(args, '--browser', plan.browserName || 'chromium');
  const browserType = playwright[browserName];
  if (!browserType) throw new Error(`Unsupported Playwright browser: ${browserName}`);
  const headed = boolFlag(args, '--headed') || plan.headed === true;
  const viewport = {
    width: 1440,
    height: 900,
    ...(plan.viewport || {})
  };
  const execution = {
    version: 1,
    status: 'running',
    startedAt: new Date().toISOString(),
    runDir,
    planPath: relativeTo(runDir, planPath),
    browserName,
    headless: !headed,
    viewport,
    contextCount: 1,
    pageCount: 1,
    steps: [],
    console: [],
    pageErrors: [],
    popupUrls: [],
    finalUrl: null,
    finalTitle: null,
    videoPath: null,
    error: null
  };

  let browser;
  let context;
  let page;
  try {
    browser = await launchBrowser(browserType, browserName, headed);
    context = await browser.newContext({
      ignoreHTTPSErrors: plan.ignoreHTTPSErrors !== false,
      viewport,
      recordVideo: {
        dir: outputDir,
        size: { width: Number(plan.video?.size?.width || viewport.width), height: Number(plan.video?.size?.height || viewport.height) }
      }
    });
    await installVisualOverlay(context, plan.visuals?.cursor !== false);
    context.on('page', openedPage => {
      if (!page || openedPage === page) return;
      const openedUrl = openedPage.url();
      if (openedUrl && !/^about:blank$/i.test(openedUrl)) execution.popupUrls.push(openedUrl);
    });
    page = await context.newPage();
    page.on('console', message => {
      execution.console.push({ type: message.type(), text: message.text().slice(0, 2000) });
    });
    page.on('pageerror', error => {
      execution.pageErrors.push(error instanceof Error ? error.message : String(error));
    });

    for (const [index, step] of plan.steps.entries()) {
      await runStep({ page, plan, step, index, execution });
    }

    execution.finalUrl = page.url();
    execution.finalTitle = await page.title().catch(() => '');
    if (!execution.finalUrl || /^about:blank$/i.test(execution.finalUrl)) {
      throw new Error(`Recorded walkthrough ended on an invalid URL: ${execution.finalUrl || 'missing'}`);
    }
    const expected = plan.expected || {};
    if (expected.finalUrlIncludes && !execution.finalUrl.includes(expected.finalUrlIncludes)) {
      throw new Error(`Final URL did not include expected value: ${expected.finalUrlIncludes}`);
    }
    if (expected.finalTitleIncludes && !execution.finalTitle.includes(expected.finalTitleIncludes)) {
      throw new Error(`Final title did not include expected value: ${expected.finalTitleIncludes}`);
    }
    execution.status = 'completed';
  } catch (error) {
    execution.status = 'failed';
    execution.error = error instanceof Error ? error.message : String(error);
  } finally {
    if (page) {
      const video = page.video();
      await context?.close().catch(() => {});
      if (video) {
        const generatedPath = await video.path().catch(() => null);
        if (generatedPath && fileOk(generatedPath)) {
          const target = path.join(outputDir, 'browser-walkthrough.webm');
          if (path.resolve(generatedPath) !== path.resolve(target)) fs.copyFileSync(generatedPath, target);
          execution.videoPath = relativeTo(runDir, target);
        }
      }
    } else {
      await context?.close().catch(() => {});
    }
    await browser?.close().catch(() => {});
    execution.endedAt = new Date().toISOString();
    execution.durationMs = Date.parse(execution.endedAt) - Date.parse(execution.startedAt);
    writeJson(logPath, execution);
    updateManifestEvidence(runDir, manifest => {
      manifest.artifacts = manifest.artifacts || {};
      manifest.recordings = manifest.recordings || {};
      manifest.proofVideoPipeline = manifest.proofVideoPipeline || {};
      manifest.recordings.playwrightProofWalkthrough = {
        kind: 'playwright-context-video',
        path: execution.videoPath,
        executionLog: relativeTo(runDir, logPath),
        planPath: relativeTo(runDir, planPath),
        viewport,
        status: execution.status,
        finalUrl: execution.finalUrl,
        finalTitle: execution.finalTitle,
        recordedAt: execution.endedAt
      };
      manifest.artifacts.rawProofVideo = execution.videoPath;
      manifest.artifacts.playwrightExecutionLog = relativeTo(runDir, logPath);
      manifest.proofVideoPipeline.recording = manifest.recordings.playwrightProofWalkthrough;
      return manifest;
    });
  }

  console.log(JSON.stringify({ ok: execution.status === 'completed', ...execution }, null, 2));
  process.exit(execution.status === 'completed' ? 0 : 1);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
