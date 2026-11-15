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
      console.error(`❌ ${browser} not found at ${path}`);
      process.exit(1);
    }
  }
}

function showUsage() {
  console.log('Usage: node src/launcher.js <gameCode> <iterations> <delay>');
  console.log('Example: node src/launcher.js 298346 5 2');
}

async function main() {
  if (process.argv.length < 5) {
    showUsage();
    process.exit(1);
  }

  const [,, gameCode, iterations, delay] = process.argv;
  const iterationsNum = parseInt(iterations);
  const delayNum = Math.max(1, parseInt(delay));

  if (isNaN(iterationsNum) || isNaN(delayNum)) {
    console.error('❌ Invalid arguments. Please provide numbers for iterations and delay.');
    showUsage();
    process.exit(1);
  }

  verifyBrowsers();
  const browserType = 'chrome'; // or 'edge'

  for (let i = 0; i < iterationsNum; i++) {
    try {
      if (browserType === 'chrome') {
        await joinWithChrome(gameCode, delayNum);
      } else {
        await joinWithEdge(gameCode, delayNum);
      }
    } catch (err) {
      console.error('❌ Error:', err);
    }
  }
}

main();
