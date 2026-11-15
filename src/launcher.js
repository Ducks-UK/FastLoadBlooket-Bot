// src/launcher.js
import { joinGameWithChrome } from './chrome-joiner.js';
import { joinGameWithEdge } from './edge-joiner.js';
import { validateGameCode } from './utils/gameCodeValidator.js';

const BROWSER_TYPES = ['chrome', 'edge'];
const DEFAULT_ITERATIONS = 1;
const DEFAULT_DELAY = 1;

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 1 || args.length > 3) {
        console.error('❌ Usage: node src/launcher.js <gameCode> [iterations] [delaySeconds]');
        console.error('Example: node src/launcher.js 2711641 5 2');
        process.exit(1);
    }

    const gameCode = args[0];
    const iterations = args[1] ? parseInt(args[1]) : DEFAULT_ITERATIONS;
    const delayMs = args[2] ? parseInt(args[2]) : DEFAULT_DELAY;

    if (!validateGameCode(gameCode)) {
        console.error('❌ Invalid game code. Must be 6 or 7 digits.');
        process.exit(1);
    }

    if (iterations < 1) {
        console.error('❌ Iterations must be at least 1');
        process.exit(1);
    }

    if (delayMs < 1) {
        console.error('❌ Delay must be at least 1 second');
        process.exit(1);
    }

    console.log(`🎯 Starting bot for game ${gameCode}`);
    console.log(`🔢 Joining ${iterations} times with ${delayMs}s delay`);

    // Try Chrome first
    if (await joinGameWithChrome(gameCode, delayMs)) {
        console.log('\n✅ All joins completed successfully with Chrome');
        process.exit(0);
    }

    // Fall back to Edge
    if (await joinGameWithEdge(gameCode, delayMs)) {
        console.log('\n✅ All joins completed successfully with Edge');
        process.exit(0);
    }

    console.error('\n❌ Failed to join game with both Chrome and Edge');
    process.exit(1);
}

main().catch(error => {
    console.error('❌ Fatal error in launcher:', error);
    process.exit(1);
});
