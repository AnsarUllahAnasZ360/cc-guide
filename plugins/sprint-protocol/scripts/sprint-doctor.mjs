#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const jsonMode = args.includes("--json");
const sprintName = args.find((arg) => !arg.startsWith("--"));
const cwd = process.cwd();

function exists(relativePath) {
  return fs.existsSync(path.join(cwd, relativePath));
}

function listStories(relativePath) {
  const absolute = path.join(cwd, relativePath);
  if (!fs.existsSync(absolute)) return [];
  return fs
    .readdirSync(absolute)
    .filter((file) => /^STORY-\d+\.md$/.test(file))
    .sort();
}

function git(args) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return {
    ok: result.status === 0,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

function readPackageScripts() {
  const packagePath = path.join(cwd, "package.json");
  if (!fs.existsSync(packagePath)) return {};
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    return pkg.scripts || {};
  } catch {
    return {};
  }
}

function inferPhase(artifacts) {
  if (!artifacts.exists) return "not-started";
  if (!artifacts.research || !artifacts.plan) return "phase-1";
  if (!artifacts.readme || artifacts.storyCount === 0) return "phase-2";
  if (!artifacts.verificationChecklist) return "phase-3";
  if (!artifacts.sprintCompletion) return "phase-4";
  if (!artifacts.verificationReport) return "phase-5";
  return "complete";
}

const branch = git(["branch", "--show-current"]);
const status = git(["status", "--short", "--branch"]);
const scripts = readPackageScripts();
const sprintDir = sprintName ? `sprints/${sprintName}` : null;
const storiesDir = sprintDir ? `${sprintDir}/stories` : null;
const stories = storiesDir ? listStories(storiesDir) : [];

const artifacts = sprintDir
  ? {
      exists: exists(sprintDir),
      state: exists(`${sprintDir}/state.md`),
      research: exists(`${sprintDir}/research.md`),
      plan: exists(`${sprintDir}/plan.md`),
      readme: exists(`${sprintDir}/README.md`),
      storiesDir: exists(storiesDir),
      storyCount: stories.length,
      stories,
      verificationChecklist: exists(`${sprintDir}/verification-checklist.md`),
      progress: exists(`${sprintDir}/progress.md`),
      sprintCompletion: exists(`${sprintDir}/sprint-completion.md`),
      verificationReport: exists(`${sprintDir}/verification-report.md`),
      evidenceDir: exists(`${sprintDir}/evidence`),
    }
  : null;

const warnings = [];
if (!sprintName) warnings.push("No sprint name supplied.");
if (artifacts && artifacts.storyCount > 15) {
  warnings.push(`Story count is ${artifacts.storyCount}; consider splitting into waves.`);
}
if (artifacts && artifacts.exists && !artifacts.state) {
  warnings.push("state.md is missing; create it before long-running orchestration.");
}
if (sprintName && branch.ok && branch.stdout && branch.stdout !== `sprint/${sprintName}`) {
  warnings.push(`Current branch is ${branch.stdout}, not sprint/${sprintName}.`);
}

const recommendedCommands = {
  typecheck: scripts.typecheck || scripts["check:types"] || null,
  lint: scripts.lint || null,
  test: scripts["test:all"] || scripts.test || null,
  build: scripts.build || null,
};

const report = {
  cwd,
  sprintName: sprintName || null,
  currentBranch: branch.ok ? branch.stdout : null,
  gitStatus: status.ok ? status.stdout.split("\n") : [],
  artifacts,
  inferredPhase: artifacts ? inferPhase(artifacts) : null,
  packageScripts: recommendedCommands,
  warnings,
};

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("Sprint Doctor");
  console.log(`cwd: ${report.cwd}`);
  console.log(`sprint: ${report.sprintName || "(none)"}`);
  console.log(`branch: ${report.currentBranch || "(unknown)"}`);
  if (artifacts) {
    console.log(`phase: ${report.inferredPhase}`);
    console.log(`stories: ${artifacts.storyCount}`);
    console.log(`state.md: ${artifacts.state ? "yes" : "no"}`);
    console.log(`research.md: ${artifacts.research ? "yes" : "no"}`);
    console.log(`plan.md: ${artifacts.plan ? "yes" : "no"}`);
    console.log(`README.md: ${artifacts.readme ? "yes" : "no"}`);
    console.log(`verification-checklist.md: ${artifacts.verificationChecklist ? "yes" : "no"}`);
    console.log(`progress.md: ${artifacts.progress ? "yes" : "no"}`);
    console.log(`sprint-completion.md: ${artifacts.sprintCompletion ? "yes" : "no"}`);
    console.log(`verification-report.md: ${artifacts.verificationReport ? "yes" : "no"}`);
  }
  console.log("commands:");
  for (const [name, command] of Object.entries(recommendedCommands)) {
    console.log(`  ${name}: ${command || "(not found)"}`);
  }
  if (warnings.length) {
    console.log("warnings:");
    for (const warning of warnings) console.log(`  - ${warning}`);
  }
}
