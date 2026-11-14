const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

// Lists of possible browser paths (Linux/Windows)
const chromePaths = [
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

const edgePaths = [
  '/usr/bin/microsoft-edge-stable',
  '/usr/bin/microsoft-edge',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

// Detect installed browser
function getBrowserPath() {
  for (const path of chromePaths) {
    try {
      execSync(`test -f "${path}" || exit 1`);
      return path;
    } catch (e) { /* Not Chrome */ }
  }

  for (const path of edgePaths) {
    try {
      execSync(`test -f "${path}" || exit 1`);
      return path;
    } catch (e) { /* Not Edge */ }
  }

  throw new Error("Neither Chrome nor Edge is installed.");
}

// Name generation lists
const firstNames = ["Duck", "AI", "Bot", "Chatgpt", "Claude", "Magic", "Unicorn", "Timmy", "NOPE", "owo", "Lol", "Deepseek"];
const lastNames = ["0482", "8347", "8493", "9849", "8583", "84739", "4774", "8493", "83", "8593", "00647"];

// Main function
async function joinBlooketGame(gameCode, iterations, delayMs) {
  const browserPath = getBrowserPath();
  const isChrome = browserPath.includes('chrome');
  const isEdge = browserPath.includes('edge');

  console.log(`Using ${isChrome ? 'Chrome' : 'Edge'} at: ${browserPath}`);

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
      '--disable-dev-tools',
      '--disable-accelerated-2d-canvas'
    ]
  });

  for (let i = 0; i < iterations; i++) {
    const page = await browser.newPage();
    const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]}${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

    try {
      await page.goto(`https://play.blooket.com/play?gameID=${gameCode}`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[name="name"]', { visible: true });
      await page.type('input[name="name"]', randomName);
      await page.click('button[type="submit"]');
      console.log(`✅ Joined game ${gameCode} as ${randomName} (${i + 1}/${iterations})`);
    } catch (err) {
      console.error(`❌ Failed to join game: ${err.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));
    await page.close();
  }

  await browser.close();
}

// Example usage (modify as needed)
const gameCode = process.argv[2] || "649681"; // Read from CLI or default
const iterations = parseInt(process.argv[3]) || 1;
const delayMs = parseInt(process.argv[4]) || 2000;

joinBlooketGame(gameCode, iterations, delayMs).catch(console.error);
