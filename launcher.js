import readline from 'readline';
import { joinGame } from './edge-joiner.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function getRandomName() {
    const firstNames = ["Duck", "AI", "Bot", "Chatgpt", "Claude", "Magic", "Unicorn", "Timmy", "NOPE", "owo", "Lol", "Deepseek"];
    const secondNames = ["0482", "8347", "8493", "9849", "8583", "84739", "4774", "8493", "83", "8593", "00647"];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]}${secondNames[Math.floor(Math.random() * secondNames.length)]}`;
}

function getRandomBlook() {
    const blooks = ["pink", "blue", "green", "yellow", "red", "purple", "orange", "black", "white", "rainbow"];
    return blooks[Math.floor(Math.random() * blooks.length)];
}

async function main() {
    console.log("Select browser:");
    console.log("1. Microsoft Edge");
    console.log("2. Google Chrome");

    const answer = await new Promise(resolve => {
        rl.question("Enter your choice (1 or 2): ", resolve);
    });

    const gameCode = process.argv[2];
    if (!gameCode) {
        console.error("❌ Please provide a game code as an argument");
        console.log("Example: node launcher.js 123456 5 2");
        process.exit(1);
    }

    const iterations = parseInt(process.argv[3]) || 1;
    const delay = parseInt(process.argv[4]) || 1;

    if (iterations < 1 || delay < 1) {
        console.error("❌ Iterations and delay must be at least 1");
        process.exit(1);
    }

    console.log(`\n🎮 Starting FastLoadBlooket v1.0`);
    console.log(`📋 Game Code: ${gameCode}`);
    console.log(`🔁 Joins: ${iterations}`);
    console.log(`⏱️ Delay: ${delay}s between joins\n`);

    for (let i = 0; i < iterations; i++) {
        try {
            const name = getRandomName();
            const blook = getRandomBlook();

            console.log(`🚀 Join ${i+1}/${iterations}: ${name} (${blook})`);

            await joinGame(gameCode, name, blook, delay);

            if (i < iterations - 1) {
                console.log(`⏳ Waiting ${delay}s...\n`);
                await new Promise(resolve => setTimeout(resolve, delay * 1000));
            }
        } catch (error) {
            console.error(`⚠️ Join ${i+1} failed: ${error.message}\n`);
            // Continue with next join even if one fails
        }
    }

    console.log("✅ All joins completed!");
    rl.close();
    process.exit(0);
}

main().catch(err => {
    console.error("💥 Fatal error:", err);
    process.exit(1);
});
