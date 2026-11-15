export function getRandomName() {
  const FIRST_NAMES = ["Duck", "AI", "Bot", "Chatgpt", "Claude", "Magic", "Unicorn", "Timmy", "NOPE", "owo", "Lol", "Deepseek"];
  const LAST_NUMBERS = ["0482", "8347", "8493", "9849", "8583", "84739", "4774", "8493", "83", "8593", "00647"];
  return `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NUMBERS[Math.floor(Math.random() * LAST_NUMBERS.length)]}`;
}
