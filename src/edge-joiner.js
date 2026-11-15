import puppeteer from 'puppeteer-core';
import { getRandomName } from './utils/randomNames.js';

export async function joinGame(gameCode, delay) {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/microsoft-edge-stable',
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
      '--disable-blink-features=AutomationControlled',
      '--user-data-dir=/tmp/edge-profile'  // Edge-specific
    ]
  });

  try {
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    // Anti-detection measures
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59');
    await page.setViewport({ width: 1366, height: 768 });

    // Block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate to game
    await page.goto(`https://blooket.com/play/${gameCode}`, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    // Random delay to appear human-like
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate random name and join
    const name = getRandomName();
    await page.type('#name-input', name, { delay: 50 + Math.random() * 100 });
    await page.click('#join-button');

    console.log(`✅ Edge: Joined ${gameCode} as ${name}`);
    await new Promise(resolve => setTimeout(resolve, delay * 1000));
    await context.close();
  } finally {
    await browser.close();
  }
}
