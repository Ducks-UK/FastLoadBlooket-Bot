// src/utils/randomNames.js
const names = ["Duck", "AI", "Bot", "Chatgpt", "Claude", "Magic", "Unicorn", "Timmy", "NOPE", "owo", "Lol", "Deepseek"];
const numbers = ["0482", "8347", "8493", "9849", "8583", "84739", "4774", "8493", "83", "8593", "00647"];
const blooks = ["happy", "sad", "angry", "cool", "shy", "cute", "evil", "robot", "alien", "ghost", "pumpkin", "santa"];

export function generateRandomName() {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
    const randomBlook = blooks[Math.floor(Math.random() * blooks.length)];

    return {
        name: `${randomName}${randomNumber}`,
        blook: randomBlook
    };
}

// Backward compatibility alias
export const getRandomName = generateRandomName;
