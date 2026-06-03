"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256 = sha256;
exports.hashChain = hashChain;
exports.diffKeys = diffKeys;
const crypto_1 = require("crypto");
function sha256(input) {
    return (0, crypto_1.createHash)('sha256').update(input).digest('hex');
}
function hashChain(prevHash, currentData) {
    return sha256(prevHash + JSON.stringify(currentData));
}
function diffKeys(before, after) {
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
    return [...allKeys].filter(k => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
}
//# sourceMappingURL=hash.util.js.map