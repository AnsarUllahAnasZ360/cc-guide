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

function printUsage() {
  console.log(`
cc-add-skill - Add Claude Code skills to your project

Usage:
  npx cc-guide add-skill <skill-name>
  npx cc-guide add-skill --list

Available skills:
${Object.entries(AVAILABLE_SKILLS).map(([name, info]) =>
  `  ${name.padEnd(15)} - ${info.description}`
).join('\n')}

Examples:
  npx cc-guide add-skill prd
  npx cc-guide add-skill setup-claude
  npx cc-guide add-skill --all
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
    process.exit(0);
  }

  const targetDir = process.cwd();

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
