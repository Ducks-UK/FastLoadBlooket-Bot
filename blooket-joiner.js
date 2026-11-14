// blooket-joiner.js
import puppeteer from 'puppeteer';

const firstNames = ["Duck", "AI", "Bot", "Chatgpt", "Claude", "Magic", "Unicorn", "Timmy", "NOPE", "owo", "Lol", "Deepseek"];
const lastNames = ["0482", "8347", "8493", "9849", "8583", "84739", "4774", "8493", "83", "8593", "00647"];

async function joinBlooketGame(gameCode, iterations, delayMs) {
  const browser = await puppeteer.launch({
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

// CLI arguments
const gameCode = process.argv[2] || "649681";
const iterations = parseInt(process.argv[3]) || 1;
const delayMs = parseInt(process.argv[4]) || 2000;

joinBlooketGame(gameCode, iterations, delayMs).catch(console.error);
