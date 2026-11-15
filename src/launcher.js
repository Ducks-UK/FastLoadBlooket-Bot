import { existsSync } from 'fs';
import { createInterface } from 'readline';
import { joinGame as joinWithChrome } from './chrome-joiner.js';
import { joinGame as joinWithEdge } from './edge-joiner.js';

const BROWSER_PATHS = {
  chrome: '/usr/bin/google-chrome-stable',
  edge: '/usr/bin/microsoft-edge-stable'
};

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function verifyBrowsers() {
  const available = [];
  for (const [browser, path] of Object.entries(BROWSER_PATHS)) {
    if (existsSync(path)) available.push(browser);
  }
  return available;
}

function showUsage() {
  console.log('\n🚀 FastLoadBlooket Bot - Usage:');
  console.log('node src/launcher.js <gameCode> <iterations> <delay> [browser]');
  console.log('\nArguments:');
  console.log('  gameCode    - The 6 or 7-digit Blooket game code (e.g., 298346)');
  console.log('  iterations  - Number of times to join (e.g., 5)');
  console.log('  delay       - Delay between joins in seconds (minimum 1)');
  console.log('  browser     - Optional: "chrome" or "edge"');
  console.log('\nExamples:');
  console.log('  node src/launcher.js 298346 5 2');
  console.log('  node src/launcher.js 2711641 5 2 edge');
  console.log('');
}

async function askBrowser(available) {
  return new Promise(resolve => {
    console.log('\nAvailable browsers:', available.join(', '));
    rl.question('Which browser would you like to use? (chrome/edge): ', answer => {
      const browser = answer.trim().toLowerCase();
      if (available.includes(browser)) {
        resolve(browser);
      } else {
        console.log('❌ Invalid selection. Please try again.');
        resolve(askBrowser(available));
      }
    });
  });
}

async function main() {
  if (process.argv.length < 4 || process.argv.length > 5) {
    showUsage();
    process.exit(1);
  }

  const [,, gameCode, iterations, delay] = process.argv;

  if (!/^\d{6,7}$/.test(gameCode)) {
    console.error('❌ Invalid game code. Must be 6 or 7 digits (e.g., 298346)');
    showUsage();
    process.exit(1);
  }

  const iterationsNum = parseInt(iterations);
  const delayNum = Math.max(1, parseInt(delay));

  if (isNaN(iterationsNum) || isNaN(delayNum)) {
    console.error('❌ Invalid arguments. Please provide numbers for iterations and delay.');
    showUsage();
    process.exit(1);
  }

  const available = verifyBrowsers();
  if (available.length === 0) {
    console.error('❌ No browsers found. Please install Chrome or Edge.');
    console.log('Run: chmod +x setup-browsers.sh && ./setup-browsers.sh');
    process.exit(1);
  }

  const browser = process.argv[5] || await askBrowser(available);

  console.log(`\n🎯 Starting ${browser} bot for game ${gameCode}`);
  console.log(`🔢 Joining ${iterationsNum} times with ${delayNum}s delay\n`);

  try {
    if (browser === 'chrome') {
      for (let i = 0; i < iterationsNum; i++) await joinWithChrome(gameCode, delayNum);
    } else {
      for (let i = 0; i < iterationsNum; i++) await joinWithEdge(gameCode, delayNum);
    }
    console.log('\n✅ All joins completed successfully!');
  } catch (err) {
    console.error('\n❌ Error:', err.message);
  } finally {
    rl.close();
  }
}

main();
