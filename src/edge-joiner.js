import puppeteer from 'puppeteer-core';
import fs from 'fs';

export async function joinGame(gameCode, name, blook, delay) {
    // Define all possible browser paths in Codespaces
    const possiblePaths = [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/microsoft-edge-stable',
        '/opt/microsoft/msedge/microsoft-edge',
        '/usr/bin/chromium-browser',
        '/usr/bin/chrome-browser',
        '/snap/bin/chromium'
    ];

    // Find first existing path
    const executablePath = possiblePaths.find(p => {
        try {
            return fs.existsSync(p) && fs.accessSync(p, fs.constants.X_OK);
        } catch {
            return false;
        }
    });

    if (!executablePath) {
        throw new Error(`No browser executable found. Tried: ${possiblePaths.join(', ')}`);
    }

    console.log(`Using browser at: ${executablePath}`);

    const browser = await puppeteer.launch({
        executablePath,
        headless: true,
        protocolTimeout: 0,
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
        ],
        ignoreHTTPSErrors: true
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1366, height: 768 });

        console.log(`Navigating to: https://blooket.com/play/${gameCode}`);
        await page.goto(`https://blooket.com/play/${gameCode}`, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        await page.waitForSelector('input[name="name"]', { timeout: 15000 });
        await page.type('input[name="name"]', name, { delay: 50 });

        const blookButtons = await page.$$('button[data-testid^="blook-"]');
        if (blookButtons.length > 0) {
            const randomIndex = Math.floor(Math.random() * blookButtons.length);
            await blookButtons[randomIndex].click();
        }

        await page.waitForSelector('button[type="submit"]', { timeout: 10000 });
        await page.click('button[type="submit"]');

        await page.waitForTimeout(delay * 1000);
    } finally {
        await browser.close();
    }
}
