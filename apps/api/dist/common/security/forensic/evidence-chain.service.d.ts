import { OnModuleInit } from '@nestjs/common';
export interface ForensicEntry {
    seq: number;
    timestamp: string;
    event_type: string;
    ip: string;
    request_id: string;
    data: Record<string, unknown>;
    prev_hash: string;
    entry_hash: string;
}
export declare class EvidenceChainService implements OnModuleInit {
    private chain;
    private seq;
    private merkle;
    private readonly SNAPSHOT_INTERVAL;
    onModuleInit(): void;
    append(event_type: string, ip: string, request_id: string, data: Record<string, unknown>): ForensicEntry;
    verify(): {
        valid: boolean;
        brokenAt?: number;
        message: string;
    };
    getMerkleProof(seq: number): {
        entry: ForensicEntry;
        proof: string[];
        root: string;
    } | null;
    exportEvidence(fromSeq: number, toSeq: number): string;
    getStats(): {
        entries: number;
        seq: number;
        latestHash: string;
        chainValid: boolean;
    };
    private buildMerkleSnapshot;
    private emitChainStatus;
}
