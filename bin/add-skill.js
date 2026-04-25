#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');

const AVAILABLE_SKILLS = {
  'prd': {
    description: 'Create self-verifying PRDs for autonomous execution',
    folder: 'prd'
  },
  'ralph-preflight': {
    description: 'Validate Ralph TUI config, templates, PRDs, and launch readiness',
    folder: 'ralph-preflight'
  },
  'setup-claude': {
    description: 'Initialize or audit repositories for Claude Code',
    folder: 'setup-claude'
  },
  'agent-browser': {
    description: 'Headless browser automation and E2E testing',
    folder: 'agent-browser'
  },
  'sprint-protocol': {
    description: 'Cross-agent sprint protocol for Claude, Codex, and Cloud Code',
    folder: 'sprint-protocol'
  }
};

const AVAILABLE_PLUGINS = {
  'proof-driven-verification': {
    description: 'ProofOps verification with code review, browser proof, and narrated videos',
    folder: 'proof-driven-verification',
    category: 'Developer Tools',
    ignoreArtifacts: true,
    afterInstall: [
      'Use it with: "Use ProofOps with subagents to verify this branch."',
      '',
      'Optional secure Deepgram key storage:',
      '  DEEPGRAM_API_KEY=... node plugins/proof-driven-verification/scripts/deepgram-key.mjs set'
    ]
  },
  'sprint-protocol': {
    description: 'Codex-native sprint planning, story writing, execution, optional QA, and PR handoff',
    folder: 'sprint-protocol',
    category: 'Developer Tools',
    afterInstall: [
      'Use it with: "Use Sprint Protocol to research and plan this work."',
      'Phase prompts: sprint-research, sprint-stories, sprint-review, sprint-execute, sprint-verify.',
      'Use sprint-verify only when you want the dedicated QA/evidence pass.'
    ]
  }
};

function printUsage() {
  console.log(`
cc-add-skill - Add Claude Code skills to your project

Usage:
  npx @ansarullahanas/cc-guide add-skill <skill-name>
  npx @ansarullahanas/cc-guide add-plugin <plugin-name> [--setup] [--force] [--global]
  npx @ansarullahanas/cc-guide add-skill --list

Available skills:
${Object.entries(AVAILABLE_SKILLS).map(([name, info]) =>
  `  ${name.padEnd(15)} - ${info.description}`
).join('\n')}

Available plugins:
${Object.entries(AVAILABLE_PLUGINS).map(([name, info]) =>
  `  ${name.padEnd(27)} - ${info.description}`
).join('\n')}

Examples:
  npx @ansarullahanas/cc-guide add-skill prd
  npx @ansarullahanas/cc-guide add-skill ralph-preflight
  npx @ansarullahanas/cc-guide add-skill setup-claude
  npx @ansarullahanas/cc-guide add-skill --all
  npx @ansarullahanas/cc-guide add-plugin proof-driven-verification
  npx @ansarullahanas/cc-guide add-plugin sprint-protocol
  npx @ansarullahanas/cc-guide add-plugin proof-driven-verification --global
  npx @ansarullahanas/cc-guide add-plugin sprint-protocol --global
  npx @ansarullahanas/cc-guide add-plugin proof-driven-verification --setup
  npx @ansarullahanas/cc-guide proofops --task "Verify this branch"
`);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function ensureArtifactsIgnored(targetDir) {
  const gitignorePath = path.join(targetDir, '.gitignore');
  const marker = 'artifacts/';
  const line = '\n# ProofOps generated local artifacts\nartifacts/\n';
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, line.trimStart());
    return;
  }
  const contents = fs.readFileSync(gitignorePath, 'utf8');
  if (!contents.split(/\r?\n/).some(existing => existing.trim() === marker)) {
    fs.appendFileSync(gitignorePath, contents.endsWith('\n') ? line : `\n${line}`);
  }
}

function addSkill(skillName, targetDir) {
  const skill = AVAILABLE_SKILLS[skillName];
  if (!skill) {
    console.error(`Unknown skill: ${skillName}`);
    console.log(`Run 'npx @ansarullahanas/cc-guide add-skill --list' to see available skills`);
    process.exit(1);
  }

  // Find the skills directory relative to this script
  const packageRoot = path.dirname(__dirname);
  const skillSrc = path.join(packageRoot, 'skills', skill.folder);

  if (!fs.existsSync(skillSrc)) {
    console.error(`Skill source not found: ${skillSrc}`);
    process.exit(1);
  }

  // Target is .claude/skills/<skill-name>
  const skillDest = path.join(targetDir, '.claude', 'skills', skill.folder);

  console.log(`Installing ${skillName} skill...`);
  console.log(`  From: ${skillSrc}`);
  console.log(`  To:   ${skillDest}`);

  copyDir(skillSrc, skillDest);

  console.log(`\n${skillName} skill installed.`);
  console.log(`\nUse it with: /${skillName}`);
}

function addPlugin(pluginName, targetDir, options = {}) {
  const plugin = AVAILABLE_PLUGINS[pluginName];
  if (!plugin) {
    console.error(`Unknown plugin: ${pluginName}`);
    console.log(`Run 'npx @ansarullahanas/cc-guide add-plugin --list' to see available plugins`);
    process.exit(1);
  }

  const packageRoot = path.dirname(__dirname);
  const pluginSrc = path.join(packageRoot, 'plugins', plugin.folder);
  const homeDir = os.homedir();
  const installRoot = options.global ? homeDir : targetDir;
  const pluginDest = path.join(installRoot, 'plugins', plugin.folder);
  const marketplacePath = options.global
    ? path.join(homeDir, '.agents', 'plugins', 'marketplace.json')
    : path.join(targetDir, '.agents', 'plugins', 'marketplace.json');

  if (!fs.existsSync(pluginSrc)) {
    console.error(`Plugin source not found: ${pluginSrc}`);
    process.exit(1);
  }

  if (fs.existsSync(pluginDest) && !options.force) {
    console.error(`Plugin already exists: ${pluginDest}`);
    console.error('Use --force to overwrite it.');
    process.exit(1);
  }

  console.log(`Installing ${pluginName} plugin...`);
  console.log(`  From: ${pluginSrc}`);
  console.log(`  To:   ${pluginDest}`);
  if (options.global) {
    console.log(`  Scope: global (${homeDir})`);
  }

  if (fs.existsSync(pluginDest)) {
    fs.rmSync(pluginDest, { recursive: true, force: true });
  }
  copyDir(pluginSrc, pluginDest);

  const marketplace = readJson(marketplacePath, {
    name: options.global ? 'home-local' : 'local',
    interface: {
      displayName: options.global ? 'Home Plugins' : 'Local Plugins'
    },
    plugins: []
  });

  marketplace.plugins = Array.isArray(marketplace.plugins) ? marketplace.plugins : [];
  const entry = {
    name: pluginName,
    source: {
      source: 'local',
      path: `./plugins/${plugin.folder}`
    },
    policy: {
      installation: 'AVAILABLE',
      authentication: 'ON_INSTALL'
    },
    category: plugin.category || 'Developer Tools'
  };
  const existingIndex = marketplace.plugins.findIndex(item => item.name === pluginName);
  if (existingIndex >= 0) {
    marketplace.plugins[existingIndex] = entry;
  } else {
    marketplace.plugins.push(entry);
  }
  writeJson(marketplacePath, marketplace);
  if (plugin.ignoreArtifacts && !options.global) {
    ensureArtifactsIgnored(targetDir);
  }

  console.log(`Updated marketplace: ${marketplacePath}`);
  if (plugin.ignoreArtifacts && !options.global) {
    console.log('Ensured artifacts/ is ignored by git.');
  }

  if (options.setup) {
    const setupScript = path.join(pluginDest, 'scripts', 'setup.mjs');
    if (fs.existsSync(setupScript)) {
      const { spawnSync } = require('child_process');
      const result = spawnSync('node', [setupScript], { cwd: targetDir, stdio: 'inherit' });
      if (result.status !== 0) {
        process.exit(result.status || 1);
      }
    }
  }

  console.log(`\n${pluginName} plugin installed.`);
  if (Array.isArray(plugin.afterInstall) && plugin.afterInstall.length > 0) {
    console.log('');
    plugin.afterInstall.forEach(line => console.log(line));
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  if (args.includes('--list') || args.includes('-l')) {
    console.log('\nAvailable skills:\n');
    Object.entries(AVAILABLE_SKILLS).forEach(([name, info]) => {
      console.log(`  ${name}`);
      console.log(`    ${info.description}\n`);
    });
    console.log('\nAvailable plugins:\n');
    Object.entries(AVAILABLE_PLUGINS).forEach(([name, info]) => {
      console.log(`  ${name}`);
      console.log(`    ${info.description}\n`);
    });
    process.exit(0);
  }

  const targetDir = process.cwd();
  const command = args[0];

  if (command === 'add-plugin') {
    const pluginName = args[1];
    if (!pluginName || pluginName === '--list' || pluginName === '-l') {
      console.log('\nAvailable plugins:\n');
      Object.entries(AVAILABLE_PLUGINS).forEach(([name, info]) => {
        console.log(`  ${name}`);
        console.log(`    ${info.description}\n`);
      });
      process.exit(pluginName ? 0 : 1);
    }

    addPlugin(pluginName, targetDir, {
      force: args.includes('--force'),
      setup: args.includes('--setup'),
      global: args.includes('--global')
    });
    return;
  }

  if (command === 'proofops') {
    const pluginDir = path.join(targetDir, 'plugins', 'proof-driven-verification');
    if (!fs.existsSync(pluginDir)) {
      addPlugin('proof-driven-verification', targetDir, { force: false, setup: false });
    }
    const { spawnSync } = require('child_process');
    const script = path.join(pluginDir, 'scripts', 'proofops.mjs');
    const result = spawnSync('node', [script, 'verify', ...args.slice(1)], {
      cwd: targetDir,
      stdio: 'inherit'
    });
    process.exit(result.status || 0);
  }

  if (args.includes('--all')) {
    Object.keys(AVAILABLE_SKILLS).forEach(skillName => {
      addSkill(skillName, targetDir);
    });
    console.log('\nAll skills installed.');
  } else {
    // Handle 'add-skill' prefix if present
    const skillIndex = args.indexOf('add-skill');
    const skillName = skillIndex >= 0 ? args[skillIndex + 1] : args[0];

    if (!skillName) {
      printUsage();
      process.exit(1);
    }

    addSkill(skillName, targetDir);
  }

  console.log(`
Next steps:
  1. Review the installed skill in .claude/skills/
  2. Run the skill with /<skill-name> in Claude Code
  3. For setup-claude, run: /setup-claude init or /setup-claude audit
  4. For prd, run: /prd
  5. For cross-agent installs, use: npx skills add AnsarUllahAnasZ360/cc-guide --skill <skill-name> -a claude-code -a codex
`);
}

main();
