const puppeteer = require('puppeteer');
const readline = require('readline');

// Word lists for random name generation
const adjectives = ["AI", "BOT", "CHATGPT", "Timmy", "NoTaAIbOT", "Idontlikeu", "Claude", "Deepseek", "wow", "owo"];
const nouns = ["21", "53", "843", "056", "517", "528", "906", "484", "363", "075"];

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

// Main function to join Blooket game
async function joinBlooketGame(gameCode, iterations = 5, delay = 1000) {
    const browser = await puppeteer.launch({ headless: false }); // Run in non-headless mode for visibility

    for (let i = 0; i < iterations; i++) {
        const page = await browser.newPage();

        // Navigate to the Blooket game
        await page.goto(`https://blooket.com/play/${gameCode}`, { waitUntil: 'networkidle2' });

        // Generate random name and blook
        const randomName = generateRandomName();
        const randomBlook = selectRandomBlook();

        // Fill in the name
        await page.type('input[placeholder="Enter your name"]', randomName);

        // Select a random blook (if dropdown exists)
        await page.select('select', randomBlook);

        // Click the join button
        await page.click('button:has-text("Join")');

        console.log(`Joined game as ${randomName} with blook ${randomBlook}`);

        // Close the tab after a delay
        await new Promise(resolve => setTimeout(resolve, delay));
        await page.close();
    }

    await browser.close();
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
                gameCode,
                parseInt(iterations) || 5,
                parseInt(delay) || 1000
            );
            rl.close();
        });
    });
});
