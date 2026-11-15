import puppeteer from 'puppeteer-core';

export async function joinGame(browserPath, gameCode, name, blook, delay) {
    const browser = await puppeteer.launch({
        executablePath: browserPath,
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

        // Set user agent to appear more like a regular browser
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0');

        // Navigate to Blooket
        await page.goto(`https://blooket.com/play/${gameCode}`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for the join form to appear
        await page.waitForSelector('input[name="name"]', { timeout: 10000 });

        // Fill in the name and select a blook
        await page.type('input[name="name"]', name);
        await page.click(`button[data-testid="blook-${blook.toLowerCase()}"]`);

        // Click join button
        await page.click('button[type="submit"]');

        // Wait for the delay before closing
        await new Promise(resolve => setTimeout(resolve, delay * 1000));

    } finally {
        await browser.close();
    }
}
