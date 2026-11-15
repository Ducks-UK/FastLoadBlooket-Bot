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

function showUsage() {
  console.log('\n🚀 FastLoadBlooket Bot - Usage:');
  console.log('node src/launcher.js <gameCode> <iterations> <delay> [browser]');
  console.log('\nArguments:');
  console.log('  gameCode    - The 6 or 7-digit Blooket game code (e.g., 2711641)');
  console.log('  iterations  - Number of times to join (e.g., 5)');
  console.log('  delay       - Delay between joins in seconds (minimum 1)');
  console.log('  browser     - Optional: "chrome" or "edge"');
  console.log('\nExamples:');
  console.log('  node src/launcher.js 2711641 5 2');
  console.log('  node src/launcher.js 2711641 5 2 edge');
  console.log('\nIf no browser is specified, you will be prompted to choose one.');
  console.log('');
}

async function main() {
  if (process.argv.length < 4 || process.argv.length > 5) {
    showUsage();
    process.exit(1);
  }

  const [,, gameCode, iterations, delay] = process.argv;

  if (!/^\d{6,7}$/.test(gameCode)) {
    console.error('❌ Invalid game code. Must be 6 or 7 digits (e.g., 2711641)');
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
    console.error('❌ No browsers found. Installing browsers now...');
    try {
      // Try installing Chrome first
      await new Promise((resolve, reject) => {
        require('child_process').exec('wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && sudo apt install -y ./google-chrome-stable_current_amd64.deb', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Then try Edge
      await new Promise((resolve, reject) => {
        require('child_process').exec(`
          curl -s https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg &&
          sudo install -o root -g root -m 644 microsoft.gpg /usr/share/keyrings/microsoft-archive-keyring.gpg &&
          sudo sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft-archive-keyring.gpg] https://packages.microsoft.com/repos/edge stable main" > /etc/apt/sources.list.d/microsoft-edge.list' &&
          sudo apt update -y &&
          sudo apt install -y microsoft-edge-stable
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      console.log('✅ Browsers installed successfully!');
      const available = verifyBrowsers();
      console.log('Available browsers:', available.join(', '));
    } catch (err) {
      console.error('❌ Failed to install browsers automatically:', err.message);
      console.log('\nPlease install manually by running:');
      console.log('wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb');
      console.log('sudo apt install -y ./google-chrome-stable_current_amd64.deb');
      console.log('OR');
      console.log('curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg');
      console.log('sudo install -o root -g root -m 644 microsoft.gpg /usr/share/keyrings/microsoft-archive-keyring.gpg');
      console.log('sudo sh -c \'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft-archive-keyring.gpg] https://packages.microsoft.com/repos/edge stable main" > /etc/apt/sources.list.d/microsoft-edge.list\'');
      console.log('sudo apt update && sudo apt install -y microsoft-edge-stable');
      process.exit(1);
    }
  }

  const browser = process.argv[5] || available[0];
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
    process.exit(1);
  }
}

main();
