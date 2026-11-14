const puppeteer = require('puppeteer');
const readline = require('readline');

// Configuration
const config = {
  iterations: 1,
  delay: 1000,
  gameCode: '904219'
};

// Word lists for name generation
const adjectives = ['Quick', 'Fast', 'Lazy', 'Happy', 'Angry', 'Silly', 'Brave', 'Shy'];
const nouns = ['Fox', 'Bear', 'Tiger', 'Lion', 'Panda', 'Wolf', 'Eagle', 'Hawk'];

async function generateRandomName() {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdjective}${randomNoun}`;
}

async function joinBlooketGame() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process'
    ]
  });

  for (let i = 0; i < config.iterations; i++) {
    const page = await browser.newPage();
    const randomName = await generateRandomName();

    try {
      await page.goto(`https://blooket.com/play/${config.gameCode}`, { waitUntil: 'networkidle2' });

      // Wait for the join form to load
      await page.waitForSelector('input[name="name"]', { timeout: 5000 });

      // Fill in the name and select a random blook
      await page.type('input[name="name"]', randomName);
      await page.click('button[type="submit"]');

      console.log(`Joined game as ${randomName} (Attempt ${i + 1}/${config.iterations})`);

      // Close the tab after a delay
      await new Promise(resolve => setTimeout(resolve, config.delay));
      await page.close();
    } catch (error) {
      console.error(`Error during join attempt ${i + 1}:`, error);
      await page.close();
    }
  }

  await browser.close();
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
      joinBlooketGame().catch(console.error);
    });
  });
});
