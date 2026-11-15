// src/edge-joiner.js
import puppeteer from 'puppeteer-core';
import { generateRandomName } from './utils/randomNames.js';

export async function joinGameWithEdge(gameCode, delayMs) {
    const edgePath = '/usr/bin/microsoft-edge-stable';
    const userDataDir = '/tmp/edge-profile-' + Math.random().toString(36).substring(2, 9);

    const launchArgs = [
        `--no-sandbox`,
        `--disable-setuid-sandbox`,
        `--disable-dev-shm-usage`,
        `--disable-gpu`,
        `--single-process`,
        `--disable-dev-tools`,
        `--disable-accelerated-2d-canvas`,
        `--disable-features=VizDisplayCompositor`,
        `--disable-blink-features=AutomationControlled`,
        `--user-data-dir=${userDataDir}`,
        `--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0`
    ];

    let browser;
    let page;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            browser = await puppeteer.launch({
                executablePath: edgePath,
                headless: true,
                args: launchArgs,
                ignoreHTTPSErrors: true
            });

            page = await browser.newPage();

            // Set viewport
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

            // Navigate to Blooket
            await page.goto('https://blooket.com/login', { waitUntil: 'networkidle2', timeout: 30000 });

            // Generate random name and select blook
            const { name, blook } = generateRandomName();

            // Type name
            await page.waitForSelector('input[placeholder="Enter your name"]', { timeout: 10000 });
            await page.type('input[placeholder="Enter your name"]', name, { delay: Math.random() * 100 + 50 });

            // Select blook
            await page.waitForSelector(`[data-testid="blook-${blook}"]`, { timeout: 10000 });
            await page.click(`[data-testid="blook-${blook}"]`);

            // Join game
            await page.waitForSelector('button:has-text("Join Game")', { timeout: 10000 });
            await page.click('button:has-text("Join Game")');

            // Enter game code
            await page.waitForSelector('input[placeholder="Game Code"]', { timeout: 10000 });
            await page.type('input[placeholder="Game Code"]', gameCode, { delay: Math.random() * 100 + 50 });

            // Final join
            await page.waitForSelector('button:has-text("Join")', { timeout: 10000 });
            await page.click('button:has-text("Join")');

            console.log(`✅ Successfully joined game ${gameCode} with ${name} (${blook})`);
            await browser.close();
            return true;

        } catch (error) {
            attempts++;
            console.log(`⚠️ Join attempt ${attempts} failed, retrying...`);

            if (page) await page.close();
            if (browser) await browser.close();

            if (attempts >= maxAttempts) {
                console.error(`❌ Fatal error after ${maxAttempts} attempts:`, error.message);
                return false;
            }

            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delayMs * 1000 * attempts));
        }
    }
}
