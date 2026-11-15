import { existsSync } from 'fs';
import { joinGame as joinWithChrome } from './chrome-joiner.js';
import { joinGame as joinWithEdge } from './edge-joiner.js';

const BROWSER_PATHS = {
  chrome: '/usr/bin/google-chrome-stable',
  edge: '/usr/bin/microsoft-edge-stable'
};

function verifyBrowsers() {
  const available = [];
  for (const [browser, path] of Object.entries(BROWSER_PATHS)) {
    if (existsSync(path)) available.push(browser);
  }
  return available;
}

async function main() {
  if (process.argv.length < 4 || process.argv.length > 5) {
    console.log('\n🚀 FastLoadBlooket Bot - Usage:');
    console.log('node src/launcher.js <gameCode> <iterations> <delay> [browser]');
    console.log('\nArguments:');
    console.log('  gameCode    - The 6 or 7-digit Blooket game code (e.g., 2711641)');
    console.log('  iterations  - Number of times to join (e.g., 5)');
    console.log('  delay       - Delay between joins in seconds (minimum 1)');
    console.log('  browser     - Optional: "chrome" or "edge" (defaults to edge)');
    console.log('\nExamples:');
    console.log('  node src/launcher.js 2711641 5 2');
    console.log('  node src/launcher.js 2711641 5 2 chrome');
    console.log('');
    process.exit(1);
  }

  const [,, gameCode, iterations, delay, browserType = 'edge'] = process.argv;

  if (!/^\d{6,7}$/.test(gameCode)) {
    console.error('❌ Invalid game code. Must be 6 or 7 digits (e.g., 2711641)');
    process.exit(1);
  }

  const iterationsNum = parseInt(iterations);
  const delayNum = Math.max(1, parseInt(delay));

  if (isNaN(iterationsNum) || isNaN(delayNum)) {
    console.error('❌ Invalid arguments. Please provide numbers for iterations and delay.');
    process.exit(1);
  }

  const available = verifyBrowsers();
  if (available.length === 0) {
    console.error('❌ No browsers found. Please run: chmod +x setup-browsers.sh && ./setup-browsers.sh');
    process.exit(1);
  }

  const browser = available.includes(browserType) ? browserType : available[0];

  console.log(`\n🎯 Starting ${browser} bot for game ${gameCode}`);
  console.log(`🔢 Joining ${iterationsNum} times with ${delayNum}s delay\n`);

  try {
    if (browser === 'chrome') {
      for (let i = 0; i < iterationsNum; i++) {
        try {
          await joinWithChrome(gameCode, delayNum);
        } catch (err) {
          console.error(`⚠️ Join ${i+1} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          await joinWithChrome(gameCode, delayNum);
        }
      }
    } else {
      for (let i = 0; i < iterationsNum; i++) {
        try {
          await joinWithEdge(gameCode, delayNum);
        } catch (err) {
          console.error(`⚠️ Join ${i+1} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          await joinWithEdge(gameCode, delayNum);
        }
      }
    }
    console.log('\n✅ All joins completed successfully!');
  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
  }
}

main();
