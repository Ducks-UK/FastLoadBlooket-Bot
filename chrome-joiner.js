import puppeteer from 'puppeteer-core';
import fs from 'fs';

export async function joinGame(gameCode, name, blook, delay) {
    // Try multiple possible Edge paths
    const edgePaths = [
        '/usr/bin/microsoft-edge-stable',
        '/opt/microsoft/msedge/microsoft-edge',
        '/usr/bin/microsoft-edge'
    ];

    // Find first existing path
    const executablePath = edgePaths.find(path => fs.existsSync(path)) ||
                          '/usr/bin/google-chrome-stable';

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
            '--disable-blink-features=AutomationControlled'
        ],
        ignoreHTTPSErrors: true
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0');

        await page.goto(`https://blooket.com/play/${gameCode}`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await page.waitForSelector('input[name="name"]', { timeout: 10000 });
        await page.type('input[name="name"]', name);
        await page.click(`button[data-testid="blook-${blook.toLowerCase()}"]`);
        await page.click('button[type="submit"]');

        await new Promise(resolve => setTimeout(resolve, delay * 1000));
    } finally {
        await browser.close();
    }
}
