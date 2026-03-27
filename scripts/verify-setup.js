#!/usr/bin/env node

/**
 * Verification script for developer environment setup
 * Run this after installing dependencies: node scripts/verify-setup.js
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
let allChecksPassed = true;

const checks = [
  {
    name: 'tsconfig.json',
    file: 'tsconfig.json',
    required: true,
  },
  {
    name: '.eslintrc.json',
    file: '.eslintrc.json',
    required: true,
  },
  {
    name: '.prettierrc.json',
    file: '.prettierrc.json',
    required: true,
  },
  {
    name: '.editorconfig',
    file: '.editorconfig',
    required: true,
  },
  {
    name: '.husky/pre-commit',
    file: '.husky/pre-commit',
    required: true,
  },
  {
    name: '.lintstagedrc.json',
    file: '.lintstagedrc.json',
    required: true,
  },
];

const packageDeps = [
  'typescript',
  'eslint',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  'prettier',
  'husky',
  'lint-staged',
];

console.log('\n=== Studio Framer Developer Experience Setup Verification ===\n');

console.log('Checking configuration files...\n');

checks.forEach((check) => {
  const filePath = path.join(projectRoot, check.file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✓' : check.required ? '✗' : '○';
  const icon = exists ? '✓' : check.required ? '✗' : '○';

  console.log(
    `  ${icon} ${check.name.padEnd(25)} ${exists ? 'Found' : check.required ? 'MISSING' : 'Optional'}`,
  );

  if (check.required && !exists) {
    allChecksPassed = false;
  }
});

console.log('\nChecking package.json dependencies...\n');

let packageJsonPath = path.join(projectRoot, 'package.json');
let packageJson = {};

try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
} catch (e) {
  console.error('✗ Failed to read package.json');
  allChecksPassed = false;
}

const allDeps = {
  ...(packageJson.dependencies || {}),
  ...(packageJson.devDependencies || {}),
};

packageDeps.forEach((dep) => {
  const exists = !!allDeps[dep];
  const status = exists ? '✓' : '✗';

  console.log(`  ${status} ${dep.padEnd(35)} ${exists ? 'Installed' : 'MISSING'}`);

  if (!exists) {
    allChecksPassed = false;
  }
});

console.log('\nChecking npm scripts...\n');

const requiredScripts = [
  'lint',
  'lint:fix',
  'format',
  'format:check',
  'type-check',
  'prepare',
];

const scripts = packageJson.scripts || {};

requiredScripts.forEach((script) => {
  const exists = !!scripts[script];
  const status = exists ? '✓' : '✗';

  console.log(`  ${status} npm run ${script.padEnd(28)} ${exists ? 'Defined' : 'MISSING'}`);

  if (!exists) {
    allChecksPassed = false;
  }
});

console.log('\n=== Summary ===\n');

if (allChecksPassed) {
  console.log('✓ All checks passed! Your development environment is properly configured.');
  console.log('\nNext steps:');
  console.log('  1. Run: npm run lint          (check for code quality issues)');
  console.log('  2. Run: npm run type-check    (verify TypeScript types)');
  console.log('  3. Run: npm run format        (format all code)');
  console.log('\nFor more information, see DEVELOPER_EXPERIENCE.md');
  process.exit(0);
} else {
  console.log(
    '✗ Some checks failed. Please run "npm install" to install missing dependencies.',
  );
  console.log('\nFailing checks:');
  console.log(
    '  • Configuration files may be missing (run v0 setup again if needed)',
  );
  console.log('  • Run: npm install');
  console.log('  • Run: npm run prepare (to set up Git hooks)');
  process.exit(1);
}
