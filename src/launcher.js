import { existsSync } from 'fs';
import { joinGame as joinWithChrome } from './chrome-joiner.js';
import { joinGame as joinWithEdge } from './edge-joiner.js';

const BROWSER_PATHS = {
  chrome: '/usr/bin/google-chrome-stable',
  edge: '/usr/bin/microsoft-edge-stable'
};

function verifyBrowsers() {
  for (const [browser, path] of Object.entries(BROWSER_PATHS)) {
    if (!existsSync(path)) {
      console.error(`❌ Error: ${browser} not found at ${path}`);
      console.error('Please install the browser or update the path in launcher.js');
      process.exit(1);
    }
  }
}

function showUsage() {
  console.log('\n🚀 FastLoadBlooket Bot - Usage:');
  console.log('node src/launcher.js <gameCode> <iterations> <delay> [browser]');
  console.log('\nArguments:');
  console.log('  gameCode    - The 6 or 7-digit Blooket game code (e.g., 298346 or 2711641)');
  console.log('  iterations  - Number of times to join (e.g., 5)');
  console.log('  delay       - Delay between joins in seconds (minimum 1)');
  console.log('  browser     - Optional: "chrome" or "edge" (defaults to chrome)');
  console.log('\nExamples:');
  console.log('  node src/launcher.js 298346 5 2');
  console.log('  node src/launcher.js 2711641 5 2 edge');
  console.log('');
}

async function main() {
  // Verify arguments
  if (process.argv.length < 5 || process.argv.length > 6) {
    showUsage();
    process.exit(1);
  }

  const [,, gameCode, iterations, delay, browserType = 'chrome'] = process.argv;

  // Validate arguments - now accepts both 6 and 7 digit codes
  if (!/^\d{6,7}$/.test(gameCode)) {
    console.error('❌ Invalid game code. Must be 6 or 7 digits (e.g., 298346 or 2711641)');
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

  // Verify browsers
  verifyBrowsers();

  // Validate browser type
  if (!['chrome', 'edge'].includes(browserType)) {
    console.error('❌ Invalid browser type. Must be "chrome" or "edge"');
    showUsage();
    process.exit(1);
  }

  console.log(`🎯 Starting ${browserType} bot for game ${gameCode}`);
  console.log(`🔢 Joining ${iterationsNum} times with ${delayNum}s delay between joins\n`);

  try {
    // Run the selected browser's joiner
    if (browserType === 'chrome') {
      for (let i = 0; i < iterationsNum; i++) {
        await joinWithChrome(gameCode, delayNum);
      }
    } else {
      for (let i = 0; i < iterationsNum; i++) {
        await joinWithEdge(gameCode, delayNum);
      }
    }

    console.log('\n✅ All joins completed successfully!');
  } catch (err) {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  }
}

main();
