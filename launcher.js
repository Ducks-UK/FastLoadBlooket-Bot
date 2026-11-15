import { readFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('Select browser:');
console.log('1. Microsoft Edge');
console.log('2. Google Chrome');
const choice = process.argv[2] || '1';

if (choice === '1') {
  console.log('Launching with Microsoft Edge...');
  execSync('node edge-joiner.js', { stdio: 'inherit' });
} else if (choice === '2') {
  console.log('Launching with Google Chrome...');
  execSync('node chrome-joiner.js', { stdio: 'inherit' });
} else {
  console.log('Invalid choice. Please use 1 for Edge or 2 for Chrome.');
  process.exit(1);
}
