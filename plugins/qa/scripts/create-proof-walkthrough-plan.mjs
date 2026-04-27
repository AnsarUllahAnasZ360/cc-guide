#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  boolFlag,
  ensureDir,
  numberFor,
  readJson,
  relativeTo,
  updateManifestEvidence,
  valueFor,
  writeJson
} from './proof-video-utils.mjs';

const args = process.argv.slice(2);

function usage() {
  console.log(`Create a generic proof walkthrough plan.

Usage:
  node plugins/qa/scripts/create-proof-walkthrough-plan.mjs <run-dir> --target-url <url> [--title "Workflow"] [--final-url-includes "/done"] [--expect-text "Saved"]
  node plugins/qa/scripts/create-proof-walkthrough-plan.mjs <run-dir> --from <plan.json>

The plan is intentionally generic. It describes browser actions for Playwright recording and does not set QA verdicts or gates.`);
}

const runArg = args.find(arg => !arg.startsWith('--'));
if (!runArg || boolFlag(args, '--help') || boolFlag(args, '-h')) {
  usage();
  process.exit(runArg ? 0 : 1);
}

const runDir = path.resolve(runArg);
const manifest = readJson(path.join(runDir, 'manifest.json'), {});
const fromPath = valueFor(args, '--from', '');
const outputPath = path.resolve(
  valueFor(args, '--output', path.join(runDir, 'proof-video', 'plans', 'proof-walkthrough.plan.json'))
);

function normalizeImportedPlan(plan) {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    source: fromPath ? 'imported' : 'generated',
    viewport: { width: 1440, height: 900 },
    browserName: 'chromium',
    timeoutMs: 15000,
    ...plan,
    steps: Array.isArray(plan.steps) ? plan.steps : []
  };
}

function candidateTargetUrl() {
  const explicit = valueFor(args, '--target-url', '') || valueFor(args, '--url', '');
  if (explicit) return explicit;
  if (process.env.QA_TARGET_URL) return process.env.QA_TARGET_URL;
  const routes = Array.isArray(manifest.routesTested) ? manifest.routesTested : [];
  return routes.find(route => /^https?:\/\//i.test(String(route))) || '';
}

function defaultPlan() {
  const targetUrl = candidateTargetUrl();
  if (!targetUrl) {
    throw new Error('Provide --target-url or set QA_TARGET_URL. The proof recorder will not create an about:blank plan.');
  }
  const title = valueFor(args, '--title', '') || manifest.taskSummary || 'Proof walkthrough';
  const waitForSelector = valueFor(args, '--wait-for-selector', '');
  const expectText = valueFor(args, '--expect-text', '');
  const finalUrlIncludes = valueFor(args, '--final-url-includes', '');
  const finalTitleIncludes = valueFor(args, '--final-title-includes', '');
  const settleMs = Math.max(0, numberFor(args, '--settle-ms', 1200) || 0);
  const steps = [
    {
      id: 'open-target',
      action: 'goto',
      url: targetUrl,
      waitUntil: 'domcontentloaded',
      description: 'Open the browser workflow under review.'
    }
  ];
  if (waitForSelector) {
    steps.push({
      id: 'wait-for-ready-selector',
      action: 'waitForSelector',
      selector: waitForSelector,
      state: 'visible',
      description: 'Wait for the workflow-ready UI state.'
    });
  }
  if (settleMs > 0) {
    steps.push({
      id: 'settle-after-load',
      action: 'wait',
      ms: settleMs,
      description: 'Allow client-side loading and transitions to settle.'
    });
  }
  steps.push({
    id: 'capture-start-state',
    action: 'screenshot',
    label: 'start-state',
    description: 'Capture the first visible state of the walkthrough.'
  });
  if (expectText) {
    steps.push({
      id: 'verify-visible-text',
      action: 'expectText',
      text: expectText,
      description: 'Confirm the expected user-visible text appears.'
    });
  }
  steps.push({
    id: 'capture-final-state',
    action: 'screenshot',
    label: 'final-state',
    description: 'Capture the final state reached by the default walkthrough.'
  });

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    source: 'generated',
    title,
    targetUrl,
    browserName: 'chromium',
    viewport: { width: 1440, height: 900 },
    timeoutMs: Math.max(1000, numberFor(args, '--timeout-ms', 15000) || 15000),
    video: {
      enabled: true,
      size: { width: 1440, height: 900 }
    },
    steps,
    expected: {
      notAboutBlank: true,
      finalUrlIncludes: finalUrlIncludes || null,
      finalTitleIncludes: finalTitleIncludes || null,
      text: expectText || null
    },
    fallbackPolicy: {
      primaryTruth: 'Browser Use verification',
      defaultRecorder: 'Playwright context video',
      computerUse: 'fallback-only'
    }
  };
}

try {
  const imported = fromPath ? readJson(path.resolve(fromPath), null) : null;
  const plan = normalizeImportedPlan(imported || defaultPlan());
  if (!plan.steps.length) throw new Error('Walkthrough plan must contain at least one step.');
  if (plan.targetUrl && /^about:blank$/i.test(plan.targetUrl)) {
    throw new Error('Walkthrough plan targetUrl must not be about:blank.');
  }
  ensureDir(path.dirname(outputPath));
  writeJson(outputPath, plan);
  updateManifestEvidence(runDir, manifestValue => {
    manifestValue.artifacts = manifestValue.artifacts || {};
    manifestValue.proofVideoPipeline = manifestValue.proofVideoPipeline || {};
    manifestValue.artifacts.proofWalkthroughPlan = relativeTo(runDir, outputPath);
    manifestValue.proofVideoPipeline.walkthroughPlan = relativeTo(runDir, outputPath);
    manifestValue.proofVideoPipeline.planStatus = 'created';
    return manifestValue;
  });
  console.log(JSON.stringify({ ok: true, planPath: outputPath, steps: plan.steps.length }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
