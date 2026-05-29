"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerkleTree = void 0;
const crypto_1 = require("crypto");
class MerkleTree {
    constructor() {
        this.leaves = [];
        this.tree = [];
    }
    build(hashes) {
        if (hashes.length === 0) {
            this.leaves = [];
            this.tree = [];
            return;
        }
        this.leaves = [...hashes];
        this.tree = [this.leaves];
        let currentLevel = this.leaves;
        while (currentLevel.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
                nextLevel.push(this.hash(left + right));
            }
            this.tree.push(nextLevel);
            currentLevel = nextLevel;
        }
    }
    getRoot() {
        if (this.tree.length === 0)
            return '0'.repeat(64);
        return this.tree[this.tree.length - 1][0];
    }
    getProof(index) {
        if (this.tree.length === 0 || index >= this.leaves.length)
            return [];
        const proof = [];
        let currentIndex = index;
        for (let level = 0; level < this.tree.length - 1; level++) {
            const levelHashes = this.tree[level];
            const isLeft = currentIndex % 2 === 0;
            const siblingIdx = isLeft ? currentIndex + 1 : currentIndex - 1;
            if (siblingIdx < levelHashes.length) {
                proof.push(`${isLeft ? 'right' : 'left'}:${levelHashes[siblingIdx]}`);
            }
            else {
                proof.push(`${isLeft ? 'right' : 'left'}:${levelHashes[currentIndex]}`);
            }
            currentIndex = Math.floor(currentIndex / 2);
        }
        return proof;
    }
    static verifyProof(leafHash, proof, root) {
        let current = leafHash;
        for (const step of proof) {
            const [direction, siblingHash] = step.split(':');
            if (direction === 'left') {
                current = (0, crypto_1.createHash)('sha256').update(siblingHash + current).digest('hex');
            }
            else {
                current = (0, crypto_1.createHash)('sha256').update(current + siblingHash).digest('hex');
            }
        }
        return current === root;
    }
    get leafCount() {
        return this.leaves.length;
    }
    get depth() {
        return this.tree.length;
    }
    hash(data) {
        return (0, crypto_1.createHash)('sha256').update(data).digest('hex');
    }
}
exports.MerkleTree = MerkleTree;
//# sourceMappingURL=merkle-tree.js.map