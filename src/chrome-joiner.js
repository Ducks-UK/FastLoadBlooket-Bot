// src/chrome-joiner.js
import puppeteer from 'puppeteer-core';
import { generateRandomName } from './utils/randomNames.js';

export async function joinGameWithChrome(gameCode, delayMs) {
    const chromePath = '/usr/bin/google-chrome-stable';

    const launchArgs = [
        `--no-sandbox`,
        `--disable-setuid-sandbox`,
        `--disable-dev-shm-usage`,
        `--disable-gpu`,
        `--single-process`,
        `--disable-dev-tools`,
        `--disable-accelerated-2d-canvas`,
        `--disable-features=VizDisplayCompositor`,
        `--disable-blink-features=AutomationControlled`
    ];

    let browser;
    let page;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            console.log('🟢 Launching Chrome browser...');
            browser = await puppeteer.launch({
                executablePath: chromePath,
                headless: false,
                args: launchArgs,
                ignoreHTTPSErrors: true,
                defaultViewport: null
            });

            console.log('🟢 Creating new page...');
            page = await browser.newPage();

            await page.setViewport({ width: 1366, height: 768 });

            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const resourceType = req.resourceType();
                if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            console.log('🟢 Navigating to Blooket...');
            await page.goto('https://blooket.com/login', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            const { name, blook } = generateRandomName();
            console.log(`🟢 Using name: ${name} and blook: ${blook}`);

            await page.waitForSelector('input[placeholder="Enter your name"]', { timeout: 10000 });
            await page.type('input[placeholder="Enter your name"]', name, { delay: Math.random() * 100 + 50 });

            await page.waitForSelector(`[data-testid="blook-${blook}"]`, { timeout: 10000 });
            await page.click(`[data-testid="blook-${blook}"]`);

            await page.waitForSelector('button:has-text("Join Game")', { timeout: 10000 });
            await page.click('button:has-text("Join Game")');

            await page.waitForSelector('input[placeholder="Game Code"]', { timeout: 10000 });
            await page.type('input[placeholder="Game Code"]', gameCode, { delay: Math.random() * 100 + 50 });

            await page.waitForSelector('button:has-text("Join")', { timeout: 10000 });
            await page.click('button:has-text("Join")');

            console.log(`✅ Successfully joined game ${gameCode} with ${name} (${blook})`);
            await new Promise(resolve => setTimeout(resolve, delayMs * 1000));
            await browser.close();
            return true;

        } catch (error) {
            attempts++;
            console.log(`⚠️ Join attempt ${attempts} failed, retrying...`);

            if (page) await page.close().catch(() => {});
            if (browser) await browser.close().catch(() => {});

            if (attempts >= maxAttempts) {
                console.error(`❌ Fatal error after ${maxAttempts} attempts:`, error.message);
                return false;
            }

            await new Promise(resolve => setTimeout(resolve, delayMs * 1000 * attempts));
        }
    }
}
