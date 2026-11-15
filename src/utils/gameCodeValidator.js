// src/utils/gameCodeValidator.js
export function validateGameCode(code) {
    // Accept both 6 and 7 digit codes
    return /^\d{6,7}$/.test(code);
}
