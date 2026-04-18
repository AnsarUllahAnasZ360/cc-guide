#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const AVAILABLE_SKILLS = {
  'prd': {
    description: 'Create self-verifying PRDs for autonomous execution',
    folder: 'prd'
  },
  'setup-claude': {
    description: 'Initialize or audit repositories for Claude Code',
    folder: 'setup-claude'
  },
  'agent-browser': {
    description: 'Headless browser automation and E2E testing',
    folder: 'agent-browser'
  }
};

const AVAILABLE_PLUGINS = {
  'proof-driven-verification': {
    description: 'ProofOps verification with code review, browser proof, and narrated videos',
    folder: 'proof-driven-verification'
  }
};

function printUsage() {
  console.log(`
cc-add-skill - Add Claude Code skills to your project

Usage:
  npx cc-guide add-skill <skill-name>
  npx cc-guide add-plugin <plugin-name> [--setup] [--force]
  npx cc-guide add-skill --list

Available skills:
${Object.entries(AVAILABLE_SKILLS).map(([name, info]) =>
  `  ${name.padEnd(15)} - ${info.description}`
).join('\n')}

Available plugins:
${Object.entries(AVAILABLE_PLUGINS).map(([name, info]) =>
  `  ${name.padEnd(27)} - ${info.description}`
).join('\n')}

Examples:
  npx cc-guide add-skill prd
  npx cc-guide add-skill setup-claude
  npx cc-guide add-skill --all
  npx cc-guide add-plugin proof-driven-verification
  npx cc-guide add-plugin proof-driven-verification --setup
  npx cc-guide proofops --task "Verify this branch"
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
    console.log(`Run 'npx cc-guide add-skill --list' to see available skills`);
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
    console.log(`Run 'npx cc-guide add-plugin --list' to see available plugins`);
    process.exit(1);
  }

  const packageRoot = path.dirname(__dirname);
  const pluginSrc = path.join(packageRoot, 'plugins', plugin.folder);
  const pluginDest = path.join(targetDir, 'plugins', plugin.folder);

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

  if (fs.existsSync(pluginDest)) {
    fs.rmSync(pluginDest, { recursive: true, force: true });
  }
  copyDir(pluginSrc, pluginDest);

  const marketplacePath = path.join(targetDir, '.agents', 'plugins', 'marketplace.json');
  const marketplace = readJson(marketplacePath, {
    name: 'local',
    interface: {
      displayName: 'Local Plugins'
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
    category: 'Developer Tools'
  };
  const existingIndex = marketplace.plugins.findIndex(item => item.name === pluginName);
  if (existingIndex >= 0) {
    marketplace.plugins[existingIndex] = entry;
  } else {
    marketplace.plugins.push(entry);
  }
  writeJson(marketplacePath, marketplace);
  ensureArtifactsIgnored(targetDir);

  console.log(`Updated marketplace: ${marketplacePath}`);
  console.log('Ensured artifacts/ is ignored by git.');

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
  console.log('\nUse it with: "Use ProofOps with subagents to verify this branch."');
  console.log('\nOptional secure Deepgram key storage:');
  console.log('  DEEPGRAM_API_KEY=... node plugins/proof-driven-verification/scripts/deepgram-key.mjs set');
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
      setup: args.includes('--setup')
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
`);
}

main();
