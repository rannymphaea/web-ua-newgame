import { Injectable, OnModuleInit } from '@nestjs/common';
import { createHash } from 'crypto';
import { MerkleTree } from './merkle-tree';

export interface ForensicEntry {
  seq: number;             // monotonic sequence number
  timestamp: string;       // RFC3339
  event_type: string;
  ip: string;
  request_id: string;
  data: Record<string, unknown>;
  prev_hash: string;       // hash of previous entry (chain link)
  entry_hash: string;      // SHA-256 of this entry (excluding entry_hash itself)
}

/**
 * EvidenceChainService — Tamper-Evident Legal Forensic Suite
 *
 * Architecture:
 *   - Hash chain: each entry includes SHA-256 of previous entry
 *   - Merkle tree: periodic tree snapshots for bulk verification
 *   - Export format: JSON + Merkle root for third-party verification
 *
 * Legal purpose:
 *   - Provide court-admissible evidence chain
 *   - ISP reporting (with Merkle proof per entry)
 *   - CERT/CSIRT reporting
 *   - Law enforcement cooperation
 *
 * All data collected is:
 *   - Publicly visible (IP, headers, request metadata)
 *   - Passively observed (no active probing)
 *   - Legally defensible under Indonesian UU ITE & GDPR Article 6(1)(f)
 */
@Injectable()
export class EvidenceChainService implements OnModuleInit {
  private chain: ForensicEntry[] = [];
  private seq = 0;
  private merkle!: MerkleTree;
  private readonly SNAPSHOT_INTERVAL = 100; // Build Merkle snapshot every 100 entries

  onModuleInit(): void {
    this.merkle = new MerkleTree();
    // Emit chain root periodically for external anchoring
    setInterval(() => this.emitChainStatus(), 5 * 60 * 1000);
  }

  /**
   * Append a new entry to the evidence chain.
   * Returns the entry with computed hashes.
   */
  append(event_type: string, ip: string, request_id: string, data: Record<string, unknown>): ForensicEntry {
    const prevEntry = this.chain[this.chain.length - 1];
    const prevHash  = prevEntry ? prevEntry.entry_hash : '0'.repeat(64); // Genesis hash

    const entry: Omit<ForensicEntry, 'entry_hash'> = {
      seq: ++this.seq,
      timestamp: new Date().toISOString(),
      event_type,
      ip,
      request_id,
      data,
      prev_hash: prevHash,
    };

    // Compute entry hash (SHA-256 of all fields except entry_hash itself)
    const entryHash = createHash('sha256')
      .update(JSON.stringify(entry))
      .digest('hex');

    const fullEntry: ForensicEntry = { ...entry, entry_hash: entryHash };
    this.chain.push(fullEntry);

    // Emit to stdout for log aggregator + archiver
    process.stdout.write(JSON.stringify({ type: 'EVIDENCE_CHAIN', ...fullEntry }) + '\n');

    // Build Merkle snapshot at intervals
    if (this.seq % this.SNAPSHOT_INTERVAL === 0) {
      this.buildMerkleSnapshot();
    }

    return fullEntry;
  }

  /**
   * Verify integrity of the entire chain.
   * Returns true only if all hash links are unbroken.
   */
  verify(): { valid: boolean; brokenAt?: number; message: string } {
    if (this.chain.length === 0) return { valid: true, message: 'Empty chain' };

    let prevHash = '0'.repeat(64);

    for (const entry of this.chain) {
      // Verify prev_hash link
      if (entry.prev_hash !== prevHash) {
        return {
          valid: false,
          brokenAt: entry.seq,
          message: `Chain broken at seq ${entry.seq}: prev_hash mismatch`,
        };
      }

      // Recompute entry_hash and verify
      const { entry_hash, ...rest } = entry;
      const recomputed = createHash('sha256').update(JSON.stringify(rest)).digest('hex');
      if (recomputed !== entry_hash) {
        return {
          valid: false,
          brokenAt: entry.seq,
          message: `Entry tampered at seq ${entry.seq}: hash mismatch`,
        };
      }

      prevHash = entry_hash;
    }

    return { valid: true, message: `Chain valid: ${this.chain.length} entries` };
  }

  /**
   * Generate Merkle proof for a single entry (for ISP/CERT reporting).
   * The proof lets the recipient verify the entry is part of the chain
   * without revealing all entries.
   */
  getMerkleProof(seq: number): { entry: ForensicEntry; proof: string[]; root: string } | null {
    const entry = this.chain.find(e => e.seq === seq);
    if (!entry) return null;

    const hashes = this.chain.map(e => e.entry_hash);
    const tree   = new MerkleTree();
    tree.build(hashes);

    const idx   = this.chain.indexOf(entry);
    const proof = tree.getProof(idx);
    const root  = tree.getRoot();

    return { entry, proof, root };
  }

  /**
   * Export evidence package for external reporting.
   * Format: JSON with chain, Merkle root, and verification instructions.
   */
  exportEvidence(fromSeq: number, toSeq: number): string {
    const entries = this.chain.filter(e => e.seq >= fromSeq && e.seq <= toSeq);
    const hashes  = entries.map(e => e.entry_hash);
    const tree    = new MerkleTree();
    tree.build(hashes);

    const pkg = {
      export_timestamp: new Date().toISOString(),
      source_system: 'NEWGAME-Security-v1',
      chain_verification: this.verify(),
      merkle_root: tree.getRoot(),
      entry_count: entries.length,
      seq_range: { from: fromSeq, to: toSeq },
      entries,
      verification_instructions: [
        '1. For each entry, recompute SHA-256(JSON without entry_hash field)',
        '2. Verify result equals entry.entry_hash',
        '3. Verify entry.prev_hash equals previous entry.entry_hash',
        '4. Rebuild Merkle tree from all entry_hash values',
        '5. Verify computed Merkle root equals merkle_root field',
      ],
    };

    return JSON.stringify(pkg, null, 2);
  }

  /** Get current chain statistics */
  getStats(): { entries: number; seq: number; latestHash: string; chainValid: boolean } {
    const latest = this.chain[this.chain.length - 1];
    return {
      entries: this.chain.length,
      seq: this.seq,
      latestHash: latest?.entry_hash || '0'.repeat(64),
      chainValid: this.verify().valid,
    };
  }

  private buildMerkleSnapshot(): void {
    const hashes = this.chain.map(e => e.entry_hash);
    this.merkle.build(hashes);
    const root = this.merkle.getRoot();

    process.stdout.write(JSON.stringify({
      type: 'MERKLE_SNAPSHOT',
      timestamp: new Date().toISOString(),
      seq_count: this.seq,
      merkle_root: root,
      entry_count: hashes.length,
    }) + '\n');
  }

  private emitChainStatus(): void {
    const stats = this.getStats();
    process.stdout.write(JSON.stringify({
      type: 'CHAIN_STATUS',
      timestamp: new Date().toISOString(),
      ...stats,
    }) + '\n');
  }
}
