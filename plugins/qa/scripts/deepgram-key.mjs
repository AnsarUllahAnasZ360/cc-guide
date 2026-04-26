#!/usr/bin/env node
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const SERVICE = 'cc-guide-qa';
const ACCOUNT = 'DEEPGRAM_API_KEY';
const command = process.argv[2] || 'status';

function runSecurity(args, input) {
  return spawnSync('security', args, {
    input,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function isMacKeychainAvailable() {
  return process.platform === 'darwin' && spawnSync('security', ['-h'], { stdio: 'ignore' }).status === 0;
}

function readStdin() {
  return new Promise(resolve => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data.trim()));
    if (process.stdin.isTTY) resolve('');
  });
}

function getKey() {
  if (process.env.DEEPGRAM_API_KEY) {
    return { source: 'env', value: process.env.DEEPGRAM_API_KEY };
  }
  if (!isMacKeychainAvailable()) {
    return { source: null, value: '' };
  }
  const result = runSecurity(['find-generic-password', '-s', SERVICE, '-a', ACCOUNT, '-w']);
  if (result.status !== 0) {
    return { source: null, value: '' };
  }
  return { source: 'macOS Keychain', value: result.stdout.trim() };
}

async function setKey() {
  if (!isMacKeychainAvailable()) {
    console.error('Secure storage is currently implemented with macOS Keychain. Use DEEPGRAM_API_KEY on this platform.');
    process.exit(1);
  }
  const fromEnv = process.env.DEEPGRAM_API_KEY || '';
  const fromStdin = await readStdin();
  const value = (fromEnv || fromStdin).trim();
  if (!value) {
    console.error('Provide the key via DEEPGRAM_API_KEY or stdin.');
    process.exit(1);
  }
  runSecurity(['delete-generic-password', '-s', SERVICE, '-a', ACCOUNT]);
  const result = runSecurity(['add-generic-password', '-s', SERVICE, '-a', ACCOUNT, '-w', value, '-U']);
  if (result.status !== 0) {
    console.error(result.stderr.trim() || 'Failed to store Deepgram key.');
    process.exit(1);
  }
  console.log('Stored Deepgram key in macOS Keychain.');
}

function deleteKey() {
  if (!isMacKeychainAvailable()) {
    console.error('macOS Keychain is unavailable on this platform.');
    process.exit(1);
  }
  const result = runSecurity(['delete-generic-password', '-s', SERVICE, '-a', ACCOUNT]);
  if (result.status !== 0) {
    console.error(result.stderr.trim() || 'No Deepgram key found in macOS Keychain.');
    process.exit(1);
  }
  console.log('Deleted Deepgram key from macOS Keychain.');
}

function status() {
  const key = getKey();
  if (!key.value) {
    console.log('Deepgram key: not configured');
    process.exit(1);
  }
  console.log(`Deepgram key: configured via ${key.source}`);
}

if (command === 'set') {
  await setKey();
} else if (command === 'get') {
  const key = getKey();
  if (!key.value) process.exit(1);
  process.stdout.write(key.value);
} else if (command === 'delete') {
  deleteKey();
} else if (command === 'status') {
  status();
} else {
  console.log('Usage: deepgram-key.mjs <status|get|set|delete>');
  console.log('Set examples:');
  console.log('  DEEPGRAM_API_KEY=... node plugins/qa/scripts/deepgram-key.mjs set');
  console.log('  printf %s "$DEEPGRAM_API_KEY" | node plugins/qa/scripts/deepgram-key.mjs set');
  process.exit(1);
}
