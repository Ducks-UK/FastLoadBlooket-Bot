const puppeteer = require('puppeteer');
const readline = require('readline');

// Configuration
const config = {
  iterations: 1,
  delay: 1000,
  gameCode: '904219'
};

// Word lists for name generation
const firstWords = ['Duck', 'AI', 'Bot', 'Chatgpt', 'Claude', 'Magic', 'Unicorn', 'Timmy', 'NOPE', 'owo', 'Lol', 'Deepseek'];
const secondWords = ['0482', '8347', '8493', '9849', '8583', '84739', '4774', '8493', '83', '8593', '00647'];

async function generateRandomName() {
  const randomFirst = firstWords[Math.floor(Math.random() * firstWords.length)];
  const randomSecond = secondWords[Math.floor(Math.random() * secondWords.length)];
  return `${randomFirst}${randomSecond}`;
}

async function joinBlooketGame() {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--disable-dev-tools',
        '--no-zygote',
        '--disable-accelerated-2d-canvas',
        '--disable-software-rasterizer',
        '--disable-gl-drawing-for-tests'
      ]
    });

    for (let i = 0; i < config.iterations; i++) {
      const page = await browser.newPage();
      const randomName = await generateRandomName();

      try {
        await page.goto(`https://blooket.com/play/${config.gameCode}`, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        await page.waitForSelector('input[name="name"]', { timeout: 10000 });
        await page.type('input[name="name"]', randomName);
        await page.click('button[type="submit"]');

        console.log(`Joined game as ${randomName} (Attempt ${i + 1}/${config.iterations})`);
        await new Promise(resolve => setTimeout(resolve, config.delay));
        await page.close();
      } catch (pageError) {
        console.error(`Error during join attempt ${i + 1}:`, pageError);
        await page.close();
      }
    }

    await browser.close();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Read user input for configuration
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter Blooket game code: ', (gameCode) => {
  config.gameCode = gameCode;
  rl.question('Number of joins (default: 5): ', (iterations) => {
    config.iterations = parseInt(iterations) || 5;
    rl.question('Delay between joins (ms, default: 1000): ', (delay) => {
      config.delay = parseInt(delay) || 1000;
      rl.close();
      joinBlooketGame();
    });
  });
});
