# NEWGAME — Security Hardening Blueprint
**Standard**: OWASP ASVS L3 · NIST 800-53 · CIS Benchmark · SANS Top 20

---

## Architecture Overview

```
Internet
   │
   ▼
[ModSecurity WAF + OWASP CRS v4]
   │  JA3 fingerprint | HTTP fingerprint | Auto-ban | Honeypot traps
   ▼
[NGINX — TLS 1.3 Only]
   │  JSON forensic logs | Geo-IP/ASN | Rate limiting | Request-ID
   ▼
[NestJS API — Port 3001]
   │  ForensicMiddleware → ForensicLoggerMiddleware
   │  FirebaseAuthGuard → RolesGuard → RequestReplayGuard
   ▼
[AnomalyEngineService — Isolation Forest AI]
   │  Real-time scoring | Auto-block | Challenge | Alert
   ▼
[EvidenceChainService — Tamper-Evident Logs]
   │  Hash chain | Merkle tree | Legal export
   ▼
[SIEM: ELK / Loki / Splunk / Wazuh]
   │  Real-time push | Batch flush | CEF format
   ▼
[Alerts: Telegram / Discord / Slack / Email]
```

---

## Module 1 — Firewall Forensics

| Parameter | Value |
|-----------|-------|
| Engine | ModSecurity v3 |
| Ruleset | OWASP CRS v4 (Paranoia Level 2) |
| Audit log | JSON format, parts ABCDEFHIJKZ |
| Timestamp | RFC3339 |
| IP reputation | Persistent score per IP, auto-ban at score > 10 |
| JA3 logging | Via `X-JA3-Fingerprint` header from nginx module |
| HTTP fingerprint | UA pattern, Accept ordering, TLS metadata |
| Honeypot traps | 15+ hidden paths trigger instant score +5 |
| Geo-IP | GeoLite2-City + GeoLite2-ASN (MaxMind) |

**Config**: [`security/firewall/modsecurity.conf`](file:///c:/Users/lenovo/web-unandnewgame/security/firewall/modsecurity.conf)
**CRS**: [`security/firewall/crs-setup.conf`](file:///c:/Users/lenovo/web-unandnewgame/security/firewall/crs-setup.conf)

---

## Module 2 — NGINX Hardening

| Parameter | Value |
|-----------|-------|
| TLS | 1.3 only (`ssl_protocols TLSv1.3`) |
| Cipher suites | TLS_AES_256_GCM_SHA384, CHACHA20_POLY1305, AES_128_GCM |
| HSTS | 2 years, includeSubDomains, preload |
| CSP | strict-origin, no unsafe-eval |
| Rate zones | global 60/min · api 30/min · auth 10/min |
| Request ID | UUIDv4 injected per request via `$request_id` |
| Access log | Full JSON: IP, Geo, ASN, JA3, method, URI, status, timing |
| Hidden paths | Blocked: .env, .git, .htaccess, SQL, keys, backups |

**Config**: [`security/nginx/nginx.conf`](file:///c:/Users/lenovo/web-unandnewgame/security/nginx/nginx.conf)
**Headers**: [`security/nginx/security-headers.conf`](file:///c:/Users/lenovo/web-unandnewgame/security/nginx/security-headers.conf)

---

## Module 3 — Node.js (NestJS) Tracker Middleware

### ForensicMiddleware
**File**: [`apps/api/src/common/security/forensic.middleware.ts`](file:///c:/Users/lenovo/web-unandnewgame/apps/api/src/common/security/forensic.middleware.ts)

Applied globally to **all routes** via `SecurityModule`.

Log output per request (JSON stdout):
```json
{
  "type": "FORENSIC_REQUEST",
  "timestamp": "2026-05-27T04:00:00.000Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "ip": "1.2.3.4",
  "ja3": "769,49195-49199...",
  "url": "/api/users/dashboard",
  "method": "GET",
  "payload_hash": "e3b0c44298fc...",
  "device_signature": "a1b2c3d4...",
  "score": 12,
  "action": "allow",
  "geo_country": "ID",
  "geo_city": "Padang",
  "asn": "AS7713",
  "asn_org": "Telekomunikasi Indonesia",
  "user_agent": "Mozilla/5.0...",
  "status_code": 200,
  "response_time_ms": 45
}
```

### FingerprintService
**File**: [`apps/api/src/common/security/fingerprint.service.ts`](file:///c:/Users/lenovo/web-unandnewgame/apps/api/src/common/security/fingerprint.service.ts)

Composite fingerprint = SHA-256 of:
- IP `/24` subnet bucket
- Browser family + OS family (from UA)
- JA3 hash
- Accept header order (sorted)
- Accept-Language (primary 3 languages)
- Accept-Encoding (sorted)

### ThreatScoringService
**File**: [`apps/api/src/common/security/threat-scoring.service.ts`](file:///c:/Users/lenovo/web-unandnewgame/apps/api/src/common/security/threat-scoring.service.ts)

| Factor | Score Added |
|--------|------------|
| Blocked IP prefix | +20 |
| Scanner/tool UA detected | +15 |
| Honeypot/sensitive path | +15 |
| Request rate > 120/min | +20 |
| Request rate > 60/min | +10 |
| High-entropy URL (fuzzing) | +10 |
| High URL diversity from IP | +10 |
| Suspicious payload pattern | +10 |
| Missing User-Agent | +5 |
| No JA3 fingerprint | +3 |

Action thresholds: **≥80 = block · 50–79 = challenge · <50 = allow**

---

## Module 4 — NestJS Forensic Mode

### ForensicLoggerMiddleware
**File**: [`apps/api/src/common/security/forensic-logger.middleware.ts`](file:///c:/Users/lenovo/web-unandnewgame/apps/api/src/common/security/forensic-logger.middleware.ts)

- **Query tampering**: detects SQL injection patterns in query params
- **API key abuse**: flags keys used > 500×/hour or from > 5 different IPs
- **Sequence tracking**: detects suspicious endpoint traversal patterns
- **File upload hashing**: SHA-256 of every uploaded file logged

### RequestReplayGuard
**File**: [`apps/api/src/common/security/request-replay.guard.ts`](file:///c:/Users/lenovo/web-unandnewgame/apps/api/src/common/security/request-replay.guard.ts)

- Nonce-based: `X-Request-Nonce` + `X-Request-Timestamp` headers
- Timestamp window: ±300 seconds (clock skew tolerance)
- Body hash deduplication: 30-second window per IP
- Apply with `@UseGuards(RequestReplayGuard)` on sensitive routes

---

## Module 5 — AI Anomaly Detection Engine

**Files**:
- [`apps/api/src/common/security/ai/anomaly-engine.service.ts`](file:///c:/Users/lenovo/web-unandnewgame/apps/api/src/common/security/ai/anomaly-engine.service.ts)
- [`apps/api/src/common/security/ai/isolation-forest.ts`](file:///c:/Users/lenovo/web-unandnewgame/apps/api/src/common/security/ai/isolation-forest.ts)

| Parameter | Value |
|-----------|-------|
| Algorithm | Isolation Forest (Liu et al. 2008) |
| Trees | 100 |
| Sample size | 256 per tree |
| Feature vector | 8 dimensions (rate, payload, diversity, errors, time, score, UA entropy, params) |
| Training | Online, every 15 minutes, last 2000 samples |
| Bootstrap | 200 synthetic baseline samples at startup |
| CRITICAL threshold | anomaly_score > 0.7 → block |
| HIGH threshold | anomaly_score > 0.5 → challenge |
| MEDIUM threshold | anomaly_score > 0.3 → log + monitor |

**Principles**: No attack-back. Block, log, alert only. All decisions auditable.

---

## Module 6 — SIEM Integration

**Files**:
- [`apps/api/src/common/security/siem/siem.service.ts`](file:///c:/Users/lenovo/web-unandnewgame/apps/api/src/common/security/siem/siem.service.ts)
- [`apps/api/src/common/security/siem/siem.config.ts`](file:///c:/Users/lenovo/web-unandnewgame/apps/api/src/common/security/siem/siem.config.ts)

| Backend | Transport | Auth |
|---------|-----------|------|
| Elasticsearch | HTTPS Bulk API | ApiKey header |
| Grafana Loki | HTTPS push API | Basic auth |
| Splunk HEC | HTTPS | Splunk token |
| Wazuh | REST API | Bearer token |
| Generic webhook | HTTPS POST | X-API-Key |

Stdout JSON logs are also captured by Filebeat/Fluentd for ELK pipeline.

---

## Module 7 — External Alert System

**File**: [`apps/api/src/common/security/alerts/alert.service.ts`](file:///c:/Users/lenovo/web-unandnewgame/apps/api/src/common/security/alerts/alert.service.ts)

| Channel | CRITICAL | HIGH | MEDIUM | LOW |
|---------|----------|------|--------|-----|
| Telegram | ✓ | ✓ | — | — |
| Discord | ✓ | ✓ | ✓ | — |
| Slack | ✓ | ✓ | — | — |
| Email | ✓ | — | — | — |
| Log only | ✓ | ✓ | ✓ | ✓ |

Rate limit: max 1 alert per IP per 60 seconds (non-CRITICAL).

Required env vars:
```env
ALERT_TELEGRAM_BOT_TOKEN=your-bot-token
ALERT_TELEGRAM_CHAT_ID=your-chat-id
ALERT_DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
ALERT_SLACK_WEBHOOK=https://hooks.slack.com/services/...
ALERT_EMAIL_WEBHOOK=https://api.resend.com/emails
ALERT_EMAIL_TO=security@yourorg.com
ALERT_EMAIL_FROM=noreply@newgame.example.com
```

---

## Module 8 — Legal Forensic Suite

**Files**:
- [`apps/api/src/common/security/forensic/evidence-chain.service.ts`](file:///c:/Users/lenovo/web-unandnewgame/apps/api/src/common/security/forensic/evidence-chain.service.ts)
- [`apps/api/src/common/security/forensic/merkle-tree.ts`](file:///c:/Users/lenovo/web-unandnewgame/apps/api/src/common/security/forensic/merkle-tree.ts)

### Hash Chain
Each log entry contains:
- `seq`: monotonic sequence number
- `timestamp`: RFC3339
- `prev_hash`: SHA-256 of previous entry (chain link)
- `entry_hash`: SHA-256 of all fields except itself

Chain breaks if any entry is modified — detectable via `verify()`.

### Merkle Tree
- Built from all `entry_hash` values every 100 entries
- Binary SHA-256 tree (Bitcoin-style odd-leaf duplication)
- Inclusion proof: verify single entry without revealing full chain
- `MerkleTree.verifyProof(leafHash, proof, root)` — stateless verification

### Evidence Export
```typescript
const pkg = evidenceChainService.exportEvidence(fromSeq, toSeq);
// Returns JSON with: entries, merkle_root, chain_verification, verification_instructions
```

Legal basis (Indonesia): UU ITE No. 11/2008 jo. No. 19/2016, PP No. 71/2019

---

## Module 9 — PQCrypto Stubs

**File**: [`security/stubs/pqcrypto/pqcrypto.placeholder.ts`](file:///c:/Users/lenovo/web-unandnewgame/security/stubs/pqcrypto/pqcrypto.placeholder.ts)

| Algorithm | Purpose | Key size | Status |
|-----------|---------|----------|--------|
| Kyber-768 | KEM (replaces RSA/ECDH) | PK: 1184B, SK: 2400B | PLACEHOLDER |
| Dilithium3 | Signature (replaces RSA/ECDSA) | PK: 1952B, SK: 4000B | PLACEHOLDER |
| Hybrid mode | Classical + PQ parallel | Combined secrets | PLACEHOLDER |

Migration roadmap:
1. **Now**: Classical only (Firebase Auth + TLS 1.3)
2. **2025–2026**: Hybrid mode (X25519 + Kyber-768)
3. **2026+**: PQ-only after NIST FIPS 203/204 finalize

---

## Compliance Mapping

| Control | OWASP ASVS L3 | NIST 800-53 | CIS | Implemented |
|---------|---------------|-------------|-----|-------------|
| TLS 1.3 only | V9.2.1 | SC-8 | CIS.14.4 | ✓ NGINX |
| Auth token validation | V3.3.1 | IA-2 | CIS.16.3 | ✓ FirebaseAuthGuard |
| Rate limiting | V11.1.2 | SI-10 | CIS.9.2 | ✓ NGINX + NestJS |
| Input validation | V5.1.1 | SI-10 | CIS.18.2 | ✓ ValidationPipe |
| Audit logging | V7.1.1 | AU-2 | CIS.6.2 | ✓ ForensicMiddleware |
| Tamper-evident logs | V7.3.1 | AU-9 | CIS.6.3 | ✓ EvidenceChain |
| Anomaly detection | V11.1.5 | SI-3 | CIS.13.1 | ✓ IsolationForest |
| Security headers | V14.4.1 | SC-28 | CIS.18.9 | ✓ NGINX headers |
| Replay prevention | V3.3.3 | IA-8 | CIS.16.5 | ✓ RequestReplayGuard |
| WAF protection | V12.1.1 | SC-7 | CIS.12.6 | ✓ ModSecurity+CRS |
