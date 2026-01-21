/**
 * cc-guide - Claude Code skills and guides
 *
 * This package provides skills for Claude Code:
 * - prd: Create self-verifying PRDs for autonomous execution
 * - setup-claude: Initialize or audit repositories for Claude Code
 *
 * Usage via npx:
 *   npx cc-guide add-skill prd
 *   npx cc-guide add-skill setup-claude
 *   npx cc-guide add-skill --all
 */

const path = require('path');

module.exports = {
  skillsPath: path.join(__dirname, 'skills'),
  templatesPath: path.join(__dirname, 'templates'),
  availableSkills: ['prd', 'setup-claude']
};
