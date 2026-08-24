#!/usr/bin/env node
import fs from 'node:fs';

/**
 * CI Node.js Deprecation Detection & Compatibility Helper
 * 
 * GitHub Actions runners deprecate older Node.js runtimes (Node <= 20).
 * If a legacy/deprecated Node version (<= 20) is detected in CI, this script
 * sets `ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true` into $GITHUB_ENV
 * to allow workflows to proceed without deprecation failures.
 */

const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.replace(/^v/, '').split('.')[0], 10);
const isCI = Boolean(process.env.CI || process.env.GITHUB_ACTIONS);
const githubEnvFile = process.env.GITHUB_ENV;

console.log('============================================================');
console.log(' Node Version & CI Compatibility Check');
console.log('============================================================');
console.log(`Current Node Version: ${nodeVersion} (Major: ${majorVersion})`);
console.log(`CI Environment: ${isCI ? 'Active (GitHub Actions)' : 'Local / Non-CI'}`);

const DEPRECATED_NODE_THRESHOLD = 20;

if (majorVersion <= DEPRECATED_NODE_THRESHOLD) {
  console.warn(`⚠️ Warning: Node ${majorVersion} is deprecated on GitHub Actions runners.`);
  console.log(`Enabling ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true for compatibility.`);

  if (githubEnvFile) {
    try {
      fs.appendFileSync(githubEnvFile, `ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true\n`, 'utf8');
      console.log(`✅ Successfully appended ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true to $GITHUB_ENV`);
    } catch (err) {
      console.error(`Failed to write to $GITHUB_ENV:`, err);
    }
  } else {
    process.env.ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION = 'true';
    console.log(`✅ Set process.env.ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true`);
  }
} else {
  console.log(`✅ Active Node version (v${majorVersion}) is modern and supported. No legacy flags needed.`);
}

console.log('============================================================\n');
