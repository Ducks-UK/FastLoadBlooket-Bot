const puppeteer = require('puppeteer');
const readline = require('readline');

// Configuration
const config = {
  iterations: 1,
  delay: 1000,
  gameCode: '649681'
};

// Word lists
const firstWords = ['Duck', 'AI', 'Bot', 'Chatgpt', 'Claude', 'Magic', 'Unicorn', 'Timmy', 'NOPE', 'owo', 'Lol', 'Deepseek'];
const secondWords = ['0482', '8347', '8493', '9849', '8583', '84739', '4774', '8493', '83', '8593', '00647'];

async function generateRandomName() {
  return `${firstWords[Math.floor(Math.random() * firstWords.length)]}${secondWords[Math.floor(Math.random() * secondWords.length)]}`;
}

async function joinBlooketGame() {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: false, // Run in non-headless mode first for debugging
      executablePath: '/usr/bin/google-chrome-stable',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--disable-dev-tools',
        '--window-size=1920,1080',
        '--disable-features=IsolateOrigins,site-per-process'
      ],
      timeout: 30000
    });

    console.log('Browser launched successfully');

    for (let i = 0; i < config.iterations; i++) {
      console.log(`Starting join attempt ${i+1}/${config.iterations}`);
      const page = await browser.newPage();
      const name = await generateRandomName();
      console.log(`Generated name: ${name}`);

      try {
        console.log(`Navigating to https://blooket.com/play/${config.gameCode}`);
        await page.goto(`https://blooket.com/play/${config.gameCode}`, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        console.log('Waiting for page to load...');
        await page.waitForTimeout(3000); // Added delay to ensure page loads

        console.log('Looking for join form...');
        await page.waitForSelector('input[name="name"]', { timeout: 10000 });

        console.log('Typing name and submitting...');
        await page.type('input[name="name"]', name);
        await page.click('button[type="submit"]');

        console.log(`Successfully joined as ${name} (${i+1}/${config.iterations})`);
        await new Promise(r => setTimeout(r, config.delay));
        await page.close();
      } catch (e) {
        console.error(`Attempt ${i+1} failed:`, e.message);
        console.log('Current page URL:', page.url());
        console.log('Page title:', await page.title());
        await page.screenshot({ path: `error-${i}.png` });
        await page.close();
      }
    }

    await browser.close();
    console.log('All joins completed successfully');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Get user input
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Game code: ', code => {
  config.gameCode = code;
  rl.question('Joins (1): ', num => {
    config.iterations = parseInt(num) || 1;
    rl.question('Delay ms (1000): ', delay => {
      config.delay = parseInt(delay) || 1000;
      rl.close();
      joinBlooketGame();
    });
  });
});
