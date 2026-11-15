import puppeteer from 'puppeteer-core';
import fs from 'fs';

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

export async function joinGame(gameCode, name, blook, delay) {
    // Try multiple browser paths
    const possiblePaths = [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/microsoft-edge-stable',
        '/opt/microsoft/msedge/microsoft-edge',
        '/usr/bin/chromium-browser'
    ];

    const executablePath = possiblePaths.find(p => fs.existsSync(p));

    if (!executablePath) {
        throw new Error('No browser executable found. Please install Chrome or Edge.');
    }

    const browser = await puppeteer.launch({
        executablePath,
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
            '--disable-ipc-flooding-protection',
            '--disable-notifications'
        ],
        ignoreHTTPSErrors: true
    });

    try {
        const page = await browser.newPage();

        // Advanced anti-detection measures
        await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
        await page.setViewport({ width: 1366, height: 768 });

        // Block unnecessary resources
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (['image', 'stylesheet', 'font'].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto(`https://blooket.com/play/${gameCode}`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for and fill the join form
        await page.waitForSelector('input[name="name"]', { timeout: 15000 });
        await page.type('input[name="name"]', name, { delay: 50 });

        // Select random blook
        const blookButtons = await page.$$('button[data-testid^="blook-"]');
        if (blookButtons.length > 0) {
            const randomIndex = Math.floor(Math.random() * blookButtons.length);
            await blookButtons[randomIndex].click();
        }

        // Click join button
        await page.waitForSelector('button[type="submit"]', { timeout: 10000 });
        await page.click('button[type="submit"]');

        // Wait for join to complete
        await page.waitForTimeout(delay * 1000);

    } catch (error) {
        console.error(`Join failed: ${error.message}`);
        throw error;
    } finally {
        await browser.close();
    }
}
