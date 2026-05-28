import { createHash } from 'crypto';

/**
 * MerkleTree — Binary Merkle Tree for tamper-evident log verification
 *
 * Construction: SHA-256 based binary tree
 * - Leaf nodes:     SHA-256(data)
 * - Internal nodes: SHA-256(left_hash + right_hash)
 * - Odd leaf count: last leaf is duplicated (standard Bitcoin approach)
 *
 * Provides:
 *   - Root hash (anchor for bulk verification)
 *   - Inclusion proof (verify single entry without revealing all entries)
 *   - Proof verification (stateless — can verify without the full tree)
 */
export class MerkleTree {
  private leaves: string[] = [];
  private tree: string[][] = [];

  /** Build tree from an array of leaf hashes (entry_hash values) */
  build(hashes: string[]): void {
    if (hashes.length === 0) {
      this.leaves = [];
      this.tree   = [];
      return;
    }

    this.leaves = [...hashes];
    this.tree   = [this.leaves];

    let currentLevel = this.leaves;

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left  = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left; // Duplicate last if odd
        nextLevel.push(this.hash(left + right));
      }

      this.tree.push(nextLevel);
      currentLevel = nextLevel;
    }
  }

  /** Get the Merkle root hash */
  getRoot(): string {
    if (this.tree.length === 0) return '0'.repeat(64);
    return this.tree[this.tree.length - 1][0];
  }

  /**
   * Get inclusion proof for leaf at index.
   * Proof is an array of sibling hashes from leaf to root.
   * Format: ['left:hash' | 'right:hash', ...]
   */
  getProof(index: number): string[] {
    if (this.tree.length === 0 || index >= this.leaves.length) return [];

    const proof: string[] = [];
    let currentIndex = index;

    for (let level = 0; level < this.tree.length - 1; level++) {
      const levelHashes = this.tree[level];
      const isLeft      = currentIndex % 2 === 0;
      const siblingIdx  = isLeft ? currentIndex + 1 : currentIndex - 1;

      if (siblingIdx < levelHashes.length) {
        proof.push(`${isLeft ? 'right' : 'left'}:${levelHashes[siblingIdx]}`);
      } else {
        // Duplicate — sibling is self (odd node)
        proof.push(`${isLeft ? 'right' : 'left'}:${levelHashes[currentIndex]}`);
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  /**
   * Verify an inclusion proof (stateless — no need for full tree).
   *
   * @param leafHash  SHA-256 hash of the leaf (entry_hash)
   * @param proof     Proof array from getProof()
   * @param root      Expected Merkle root
   */
  static verifyProof(leafHash: string, proof: string[], root: string): boolean {
    let current = leafHash;

    for (const step of proof) {
      const [direction, siblingHash] = step.split(':');
      if (direction === 'left') {
        current = createHash('sha256').update(siblingHash + current).digest('hex');
      } else {
        current = createHash('sha256').update(current + siblingHash).digest('hex');
      }
    }

    return current === root;
  }

  /** Get the total number of leaves */
  get leafCount(): number {
    return this.leaves.length;
  }

  /** Get tree depth */
  get depth(): number {
    return this.tree.length;
  }

  private hash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }
}
