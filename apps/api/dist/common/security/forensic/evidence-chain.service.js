"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceChainService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const merkle_tree_1 = require("./merkle-tree");
let EvidenceChainService = class EvidenceChainService {
    constructor() {
        this.chain = [];
        this.seq = 0;
        this.SNAPSHOT_INTERVAL = 100;
    }
    onModuleInit() {
        this.merkle = new merkle_tree_1.MerkleTree();
        setInterval(() => this.emitChainStatus(), 5 * 60 * 1000);
    }
    append(event_type, ip, request_id, data) {
        const prevEntry = this.chain[this.chain.length - 1];
        const prevHash = prevEntry ? prevEntry.entry_hash : '0'.repeat(64);
        const entry = {
            seq: ++this.seq,
            timestamp: new Date().toISOString(),
            event_type,
            ip,
            request_id,
            data,
            prev_hash: prevHash,
        };
        const entryHash = (0, crypto_1.createHash)('sha256')
            .update(JSON.stringify(entry))
            .digest('hex');
        const fullEntry = { ...entry, entry_hash: entryHash };
        this.chain.push(fullEntry);
        process.stdout.write(JSON.stringify({ type: 'EVIDENCE_CHAIN', ...fullEntry }) + '\n');
        if (this.seq % this.SNAPSHOT_INTERVAL === 0) {
            this.buildMerkleSnapshot();
        }
        return fullEntry;
    }
    verify() {
        if (this.chain.length === 0)
            return { valid: true, message: 'Empty chain' };
        let prevHash = '0'.repeat(64);
        for (const entry of this.chain) {
            if (entry.prev_hash !== prevHash) {
                return {
                    valid: false,
                    brokenAt: entry.seq,
                    message: `Chain broken at seq ${entry.seq}: prev_hash mismatch`,
                };
            }
            const { entry_hash, ...rest } = entry;
            const recomputed = (0, crypto_1.createHash)('sha256').update(JSON.stringify(rest)).digest('hex');
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
    getMerkleProof(seq) {
        const entry = this.chain.find(e => e.seq === seq);
        if (!entry)
            return null;
        const hashes = this.chain.map(e => e.entry_hash);
        const tree = new merkle_tree_1.MerkleTree();
        tree.build(hashes);
        const idx = this.chain.indexOf(entry);
        const proof = tree.getProof(idx);
        const root = tree.getRoot();
        return { entry, proof, root };
    }
    exportEvidence(fromSeq, toSeq) {
        const entries = this.chain.filter(e => e.seq >= fromSeq && e.seq <= toSeq);
        const hashes = entries.map(e => e.entry_hash);
        const tree = new merkle_tree_1.MerkleTree();
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
    getStats() {
        const latest = this.chain[this.chain.length - 1];
        return {
            entries: this.chain.length,
            seq: this.seq,
            latestHash: latest?.entry_hash || '0'.repeat(64),
            chainValid: this.verify().valid,
        };
    }
    buildMerkleSnapshot() {
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
    emitChainStatus() {
        const stats = this.getStats();
        process.stdout.write(JSON.stringify({
            type: 'CHAIN_STATUS',
            timestamp: new Date().toISOString(),
            ...stats,
        }) + '\n');
    }
};
exports.EvidenceChainService = EvidenceChainService;
exports.EvidenceChainService = EvidenceChainService = __decorate([
    (0, common_1.Injectable)()
], EvidenceChainService);
//# sourceMappingURL=evidence-chain.service.js.map