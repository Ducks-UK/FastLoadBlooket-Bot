import puppeteer from 'puppeteer-core';
import { getRandomName } from './utils/randomNames.js';

export async function joinGame(gameCode, delay) {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
      '--disable-dev-tools',
      '--disable-accelerated-2d-canvas',
      '--disable-features=VizDisplayCompositor',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  try {
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    // Anti-detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.setViewport({ width: 1366, height: 768 });

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(`https://blooket.com/play/${gameCode}`, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const name = getRandomName();
    await page.type('#name-input', name, { delay: 50 + Math.random() * 100 });
    await page.click('#join-button');

    console.log(`✅ Joined ${gameCode} as ${name}`);
    await new Promise(resolve => setTimeout(resolve, delay * 1000));
    await context.close();
  } finally {
    await browser.close();
  }
}
