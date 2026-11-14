const puppeteer = require('puppeteer');
const readline = require('readline');

// Configuration
const config = {
  iterations: 1,
  delay: 1000,
  gameCode: '904219'
};

// Word lists
const firstWords = ['Duck', 'AI', 'Bot', 'Chatgpt', 'Claude', 'Magic', 'Unicorn', 'Timmy', 'NOPE', 'owo', 'Lol', 'Deepseek'];
const secondWords = ['0482', '8347', '8493', '9849', '8583', '84739', '4774', '8493', '83', '8593', '00647'];

async function generateRandomName() {
  return `${firstWords[Math.floor(Math.random() * firstWords.length)]}${secondWords[Math.floor(Math.random() * secondWords.length)]}`;
}

async function joinBlooketGame() {
  try {
    // Kill any existing Chrome processes
    require('child_process').execSync('pkill -f chrome || true', { stdio: 'ignore' });

    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: '/usr/bin/google-chrome-stable',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--disable-dev-tools',
        '--disable-accelerated-2d-canvas',
        '--disable-software-rasterizer'
      ],
      timeout: 30000
    });

    for (let i = 0; i < config.iterations; i++) {
      const page = await browser.newPage();
      const name = await generateRandomName();

      try {
        await page.goto(`https://blooket.com/play/${config.gameCode}`, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        await page.waitForSelector('input[name="name"]', { timeout: 10000 });
        await page.type('input[name="name"]', name);
        await page.click('button[type="submit"]');

        console.log(`Joined as ${name} (${i+1}/${config.iterations})`);
        await new Promise(r => setTimeout(r, config.delay));
        await page.close();
      } catch (e) {
        console.error(`Attempt ${i+1} failed:`, e.message);
        await page.close();
      }
    }

    await browser.close();
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
