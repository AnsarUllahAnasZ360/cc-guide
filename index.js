/**
 * cc-guide - Claude Code and Codex skills, plugins, and guides
 *
 * This package provides skills and plugins:
 * - launchpad: Decide the mode (interactive/goal/workflow) and author a launch-ready goal for Claude Code, Codex, or Antigravity
 * - prd: Create self-verifying PRDs for autonomous execution
 * - ralph-preflight: Validate Ralph TUI readiness before loops
 * - setup-claude: Initialize or audit repositories for Claude Code
 * - agent-browser: Browser automation and E2E testing workflows
 * - sprint-protocol: Cross-agent sprint operating protocol
 * - proof-driven-verification: ProofOps verification plugin
 * - sprint-protocol: Codex-native sprint lifecycle plugin
 *
 * Usage via npx:
 *   npx @ansarullahanas/cc-guide add-skill prd
 *   npx @ansarullahanas/cc-guide add-skill setup-claude
 *   npx @ansarullahanas/cc-guide add-plugin sprint-protocol
 *   npx @ansarullahanas/cc-guide add-skill --all
 */

const path = require('path');

module.exports = {
  skillsPath: path.join(__dirname, 'skills'),
  pluginsPath: path.join(__dirname, 'plugins'),
  templatesPath: path.join(__dirname, 'templates'),
  availableSkills: ['launchpad', 'prd', 'ralph-preflight', 'setup-claude', 'agent-browser', 'sprint-protocol'],
  availablePlugins: ['proof-driven-verification', 'sprint-protocol']
};
