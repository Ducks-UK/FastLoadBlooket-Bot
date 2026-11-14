// src/utils/randomNames.js
const adjectives = [
  "bot", "robot", "ai", "chatgpt", "fake", "lol", "clever", "dont",
  "cheater", "bruh", "money", "IwantCheese", "itchy", "tom", "claude", "deepseek"
];

const animals = [
  "11", "23", "42", "26", "73", "63", "73", "152",
  "842", "748", "24", "90", "4000", "V4", "16", "84"
];

export function generateRandomName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${adj}${animal}`;
}
