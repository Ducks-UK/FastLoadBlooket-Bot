const puppeteer = require('puppeteer');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Word lists for random name generation
const adjectives = ["Quick", "Swift", "Mighty", "Happy", "Brave", "Fierce", "Cool", "Silly", "Glowing", "Zesty"];
const nouns = ["Fox", "Dragon", "Panda", "Tiger", "Lion", "Bear", "Wolf", "Eagle", "Shark", "Phoenix"];

// Random name generator
function generateRandomName() {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj}${noun}`;
}

// Random blook selection
function selectRandomBlook() {
    const blooks = ["Red", "Blue", "Green", "Yellow", "Purple", "Pink", "Orange", "Black", "White", "Rainbow"];
    return blooks[Math.floor(Math.random() * blooks.length)];
}

// Check if a file exists and is executable
function isExecutable(filePath) {
    try {
        fs.accessSync(filePath, fs.constants.X_OK);
        return true;
    } catch {
        return false;
    }
}

// Find available browser
async function getBrowserPath() {
    const possiblePaths = [
        // Chrome paths
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/opt/google/chrome/chrome',

        // Edge paths
        '/usr/bin/microsoft-edge-stable',
        '/usr/bin/microsoft-edge',
        '/usr/bin/edge',

        // Fallback to Puppeteer's Chromium
        path.join(require('puppeteer').executablePath())
    ];

    for (const path of possiblePaths) {
        if (isExecutable(path)) {
            console.log(`🔍 Found browser at: ${path}`);
            return path;
        }
    }

    // If no browser found, try installing Puppeteer's Chromium
    try {
        console.log('⚠️ No browser found, using Puppeteer\'s Chromium...');
        return puppeteer.executablePath();
    } catch (e) {
        throw new Error('No browser found and failed to use Puppeteer\'s Chromium. Please install Chrome or Edge.');
    }
}

// Main function to join Blooket game
async function joinBlooketGame(gameCode, iterations = 5, delay = 1000) {
    try {
        const browserPath = await getBrowserPath();
        console.log(`🚀 Using browser: ${browserPath}`);

        const browser = await puppeteer.launch({
            headless: false,
            executablePath: browserPath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--window-size=1920,1080'
            ]
        });

        for (let i = 0; i < iterations; i++) {
            try {
                const page = await browser.newPage();
                await page.setViewport({ width: 1920, height: 1080 });

                // Navigate to the Blooket game
                await page.goto(`https://blooket.com/play/${gameCode}`, {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                });

                // Generate random name and blook
                const randomName = generateRandomName();
                const randomBlook = selectRandomBlook();

                // Fill in the name
                await page.type('input[placeholder="Enter your name"]', randomName, { delay: 50 });

                // Select a random blook (if dropdown exists)
                await page.select('select', randomBlook);

                // Click the join button
                await page.click('button:has-text("Join")');

                console.log(`✅ Joined game as ${randomName} with blook ${randomBlook} (${i+1}/${iterations})`);

                // Close the tab after a delay
                await new Promise(resolve => setTimeout(resolve, delay));
                await page.close();
            } catch (tabError) {
                console.error(`❌ Error in tab ${i+1}:`, tabError.message);
            }
        }

        await browser.close();
        console.log('🎉 All joins completed successfully!');
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        console.log('💡 Tips:');
        console.log('1. Make sure Chrome or Edge is installed');
        console.log('2. Run: sudo apt-get install -y google-chrome-stable microsoft-edge-stable');
        console.log('3. If using Puppeteer, run: npm install puppeteer');
    }
}

// Read input from command line
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter Blooket game code: ', (gameCode) => {
    rl.question('Number of joins (default: 5): ', (iterations) => {
        rl.question('Delay between joins (ms, default: 1000): ', (delay) => {
            joinBlooketGame(
                gameCode.trim(),
                parseInt(iterations) || 5,
                parseInt(delay) || 1000
            );
            rl.close();
        });
    });
});
