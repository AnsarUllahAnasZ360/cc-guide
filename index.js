/**
 * cc-guide - Claude Code and Codex skills, plugins, and guides
 *
 * This package provides skills and plugins:
 * - prd: Create self-verifying PRDs for autonomous execution
 * - setup-claude: Initialize or audit repositories for Claude Code
 * - proof-driven-verification: ProofOps verification plugin
 * - sprint-protocol: Codex-native sprint lifecycle plugin
 *
 * Usage via npx:
 *   npx cc-guide add-skill prd
 *   npx cc-guide add-skill setup-claude
 *   npx cc-guide add-plugin sprint-protocol
 *   npx cc-guide add-skill --all
 */

const path = require('path');

module.exports = {
  skillsPath: path.join(__dirname, 'skills'),
  pluginsPath: path.join(__dirname, 'plugins'),
  templatesPath: path.join(__dirname, 'templates'),
  availableSkills: ['prd', 'setup-claude', 'agent-browser'],
  availablePlugins: ['proof-driven-verification', 'sprint-protocol']
};
