/**
 * PQCrypto — Quantum-Resistant Cryptography Placeholder Interfaces
 *
 * Status: PLACEHOLDER ONLY — Not implemented
 * Algorithms: Kyber (KEM) + Dilithium (Digital Signature)
 * Standard: NIST PQC Round 3 Winners (FIPS 203/204 draft)
 *
 * When NIST FIPS 203/204 are finalized and Node.js/npm libraries
 * mature (e.g., liboqs-node), replace these interfaces with real
 * implementations.
 *
 * Recommended libraries (when stable):
 *   - @noble/post-quantum (JavaScript, no WASM dependency)
 *   - liboqs-node (C binding, production-grade)
 *   - pqclean (via WASM)
 */

// ── Kyber — Key Encapsulation Mechanism (KEM) ────────────────────────────────
// Replaces RSA/ECDH for key exchange
// Kyber-768 = NIST Security Level 3 (recommended)

/** Kyber keypair output */
export interface KyberKeypair {
  publicKey:  Uint8Array; // 1184 bytes (Kyber-768)
  privateKey: Uint8Array; // 2400 bytes (Kyber-768)
}

/** Kyber encapsulation output */
export interface KyberEncapsulation {
  ciphertext:  Uint8Array; // 1088 bytes (Kyber-768)
  sharedSecret: Uint8Array; // 32 bytes
}

/**
 * KyberService — Placeholder
 * TODO: Replace with real implementation using @noble/post-quantum or liboqs-node
 */
export class KyberService {
  /** Generate a Kyber-768 keypair */
  // eslint-disable-next-line @typescript-eslint/require-await
  async generateKeypair(): Promise<KyberKeypair> {
    // TODO: return await kyber768.generateKeypair();
    throw new Error('PQCrypto not implemented: KyberService.generateKeypair()');
  }

  /** Encapsulate a shared secret using recipient's public key */
  // eslint-disable-next-line @typescript-eslint/require-await
  async encapsulate(_publicKey: Uint8Array): Promise<KyberEncapsulation> {
    // TODO: return await kyber768.encapsulate(publicKey);
    throw new Error('PQCrypto not implemented: KyberService.encapsulate()');
  }

  /** Decapsulate shared secret using private key + ciphertext */
  // eslint-disable-next-line @typescript-eslint/require-await
  async decapsulate(_ciphertext: Uint8Array, _privateKey: Uint8Array): Promise<Uint8Array> {
    // TODO: return await kyber768.decapsulate(ciphertext, privateKey);
    throw new Error('PQCrypto not implemented: KyberService.decapsulate()');
  }
}

// ── Dilithium — Digital Signature Algorithm ───────────────────────────────────
// Replaces RSA/ECDSA for signing
// Dilithium3 = NIST Security Level 3 (recommended)

/** Dilithium keypair output */
export interface DilithiumKeypair {
  publicKey:  Uint8Array; // 1952 bytes (Dilithium3)
  privateKey: Uint8Array; // 4000 bytes (Dilithium3)
}

/** Dilithium signature output */
export interface DilithiumSignature {
  signature: Uint8Array;  // 3293 bytes (Dilithium3)
  message:   Uint8Array;
}

/**
 * DilithiumService — Placeholder
 * TODO: Replace with real implementation using @noble/post-quantum or liboqs-node
 */
export class DilithiumService {
  /** Generate a Dilithium3 keypair */
  // eslint-disable-next-line @typescript-eslint/require-await
  async generateKeypair(): Promise<DilithiumKeypair> {
    // TODO: return await dilithium3.generateKeypair();
    throw new Error('PQCrypto not implemented: DilithiumService.generateKeypair()');
  }

  /** Sign a message with private key */
  // eslint-disable-next-line @typescript-eslint/require-await
  async sign(_message: Uint8Array, _privateKey: Uint8Array): Promise<DilithiumSignature> {
    // TODO: return await dilithium3.sign(message, privateKey);
    throw new Error('PQCrypto not implemented: DilithiumService.sign()');
  }

  /** Verify a signature with public key */
  // eslint-disable-next-line @typescript-eslint/require-await
  async verify(_signature: Uint8Array, _message: Uint8Array, _publicKey: Uint8Array): Promise<boolean> {
    // TODO: return await dilithium3.verify(signature, message, publicKey);
    throw new Error('PQCrypto not implemented: DilithiumService.verify()');
  }
}

// ── Hybrid Mode: Classical + Post-Quantum ────────────────────────────────────
// Recommended migration path: use both classical (AES-256/Ed25519) and
// PQ algorithms simultaneously. This provides security against both
// classical and quantum attackers during the transition period.

export interface HybridKeyExchange {
  /** Classical: X25519 ECDH shared secret */
  classicalShared: Uint8Array;
  /** Post-quantum: Kyber-768 shared secret */
  pqShared:        Uint8Array;
  /** Combined: SHA-256(classicalShared || pqShared) */
  hybridSecret:    Uint8Array;
}

/**
 * HybridCryptoService — Placeholder
 *
 * Migration roadmap:
 *   Phase 1 (Now):   Classical only (current implementation)
 *   Phase 2 (2025):  Hybrid mode (classical + PQ in parallel)
 *   Phase 3 (2026+): PQ only (after NIST standards finalize)
 */
export class HybridCryptoService {
  // eslint-disable-next-line @typescript-eslint/require-await
  async hybridKeyExchange(_peerPublicKey: Uint8Array): Promise<HybridKeyExchange> {
    // TODO: Implement X25519 + Kyber-768 hybrid KEM
    throw new Error('PQCrypto not implemented: HybridCryptoService.hybridKeyExchange()');
  }
}
