# NEWGAME — Threat Intelligence Integration Guide
**Legal basis**: Passive observation only · No hack-back · UU ITE compliant

---

## Overview

Threat intelligence (TI) provides external context for IPs and domains observed
in your logs. Integration is **read-only** — we query external TI feeds and
add context to our own forensic logs. We never attack back.

---

## 1. AbuseIPDB

**Purpose**: Check if observed IPs have been reported for abuse by the global community.

**API Endpoint**: `https://api.abuseipdb.com/api/v2/check`

**Setup**:
1. Register at https://www.abuseipdb.com/register
2. Get API key from dashboard
3. Set `THREAT_INTEL_ABUSEIPDB_KEY=your-key` in `.env`

**Usage in ThreatScoringService** (add to `score()` method):
```typescript
const response = await fetch(
  `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`,
  { headers: { Key: process.env.THREAT_INTEL_ABUSEIPDB_KEY!, Accept: 'application/json' } }
);
const data = await response.json();
const abuseScore = data.data?.abuseConfidenceScore || 0;
// Add to threat score: +10 if abuseScore > 50, +20 if > 90
```

**Rate limits**: Free = 1000 req/day · Paid = 3000–100000/day

**What it provides**:
- `abuseConfidenceScore`: 0–100 community abuse confidence
- `countryCode`: Country of origin
- `isp`: ISP name
- `domain`: Resolved domain
- `totalReports`: Total historical reports
- `lastReportedAt`: Most recent report timestamp

---

## 2. AlienVault OTX (Open Threat Exchange)

**Purpose**: Community-driven threat intelligence with IOC (Indicators of Compromise) lookup.

**API Endpoint**: `https://otx.alienvault.com/api/v1/indicators/IPv4/{ip}/reputation`

**Setup**:
1. Register at https://otx.alienvault.com/accounts/register
2. Get API key from account settings
3. Set `THREAT_INTEL_OTX_KEY=your-key` in `.env`

**Usage**:
```typescript
const response = await fetch(
  `https://otx.alienvault.com/api/v1/indicators/IPv4/${ip}/reputation`,
  { headers: { 'X-OTX-API-KEY': process.env.THREAT_INTEL_OTX_KEY! } }
);
const data = await response.json();
const reputationScore = data.reputation?.threat_score || 0;
const activities = data.reputation?.activities || [];
```

**What it provides**:
- Threat score (0–10 scale)
- Activity categories: Malware, Scanner, Botnet, Proxy, Tor
- Associated malware families
- Geographic data
- Related pulses (community threat reports)

**Rate limits**: Free = unlimited (fair use) · Recommend caching results 24h

---

## 3. GreyNoise

**Purpose**: Identifies IPs that are mass-scanning the internet (distinguishes targeted attacks from background noise).

**API Endpoint**: `https://api.greynoise.io/v3/community/{ip}` (Community) or `https://api.greynoise.io/v2/noise/context/{ip}` (Enterprise)

**Setup**:
1. Register at https://www.greynoise.io/account/register
2. Get API key
3. Set `THREAT_INTEL_GREYNOISE_KEY=your-key` in `.env`

**Usage**:
```typescript
const response = await fetch(
  `https://api.greynoise.io/v3/community/${ip}`,
  { headers: { key: process.env.THREAT_INTEL_GREYNOISE_KEY! } }
);
const data = await response.json();
// noise: true = mass internet scanner (likely not targeted at you)
// riot: true = known benign service (Google, Cloudflare, etc.)
// classification: 'malicious' | 'benign' | 'unknown'
```

**Decision logic**:
- `riot: true` → lower threat score (known benign)
- `noise: true, classification: malicious` → raise score (+15)
- `noise: false` → possibly targeted attack → raise score (+10)

**Rate limits**: Community = 50 req/day · Paid = 10000+/day

---

## 4. Threat Intelligence Cache

To avoid rate limit exhaustion, cache all TI lookups:

```typescript
// Simple in-memory cache (replace with Redis in production)
const tiCache = new Map<string, { data: unknown; expiry: number }>();

async function queryWithCache(ip: string, queryFn: () => Promise<unknown>): Promise<unknown> {
  const cached = tiCache.get(ip);
  if (cached && cached.expiry > Date.now()) return cached.data;
  
  const data = await queryFn();
  tiCache.set(ip, { data, expiry: Date.now() + 86_400_000 }); // 24h cache
  return data;
}
```

**Production**: Use Redis with `EXPIRE 86400` for 24-hour TTL per IP.

---

## 5. Legal Forensic Data Collection

### What We Collect (Legal — Publicly Observable)
| Data | Source | Legal basis |
|------|--------|-------------|
| Source IP address | HTTP header | Network traffic monitoring |
| User-Agent string | HTTP header | Server log standard |
| Request URL + method | HTTP request line | Server log standard |
| HTTP headers (Accept, Accept-Language) | HTTP headers | Network traffic monitoring |
| TLS handshake metadata (JA3) | TLS layer | Network layer analysis |
| Timestamp (RFC3339) | Server clock | Audit logging requirement |
| Geo-IP country + city | GeoLite2 DB lookup | Publicly available IP data |
| ASN + ISP name | GeoLite2 DB lookup | Publicly available IP data |
| Request body hash (SHA-256) | Request body | Security monitoring |

### What We DO NOT Collect
- Password values (hash only, never plaintext)
- Personal identifiable information beyond IP
- Browser cookies (beyond session management)
- Biometric data
- Location beyond country/city level
- Health or financial data

### Legal Framework
- **Indonesia**: UU ITE No. 11/2008 jo. No. 19/2016 (Article 40 — system security)
- **Indonesia**: PP No. 71/2019 (Electronic System Administration)
- **GDPR**: Article 6(1)(f) — legitimate interest (security monitoring)
- **GDPR**: Article 17(3)(e) — right to erasure exception (legal defense)

---

## 6. Evidence Reporting Procedures

### To ISP (Attacker's Internet Provider)
1. Identify attacker ISP via ASN lookup (GreyNoise / GeoLite2-ASN)
2. Find ISP abuse contact: `whois <IP>` → look for `abuse-mailbox`
3. Export evidence: `evidenceChainService.exportEvidence(fromSeq, toSeq)`
4. Include: IP, timestamps, attack type, Merkle root, partial log excerpt
5. Send to abuse contact with subject: `Abuse Report: [Attack Type] from [IP]`

**Template abuse report**:
```
To: [ISP abuse contact]
Subject: Security Abuse Report — [attack_type] from [IP]

Dear ISP Security Team,

We are reporting malicious activity originating from IP [IP] on our systems.

Attack details:
- IP: [IP]
- ASN: [ASN] ([ASN_ORG])
- Type: [attack_type]
- First seen: [timestamp]
- Last seen: [timestamp]
- Total attempts: [count]

Evidence chain:
- Merkle root: [merkle_root]
- Verification method: SHA-256 hash chain (details in attached JSON)

Attached: evidence_export_[date].json

We request you investigate this activity and take appropriate action.
We have not taken any offensive action against the IP — only passive logging.

Regards,
NEWGAME Security Team
```

### To ID-CERT (Indonesia CERT)
- Email: id-cert@cert.or.id
- Report format: https://www.cert.or.id/en/contact/
- Include: same evidence package + impact assessment

### To Kominfo (Critical infrastructure attacks)
- Email: aduan@mail.kominfo.go.id
- Phone: 159

---

## 7. Required Environment Variables

```env
# Threat Intelligence APIs
THREAT_INTEL_ABUSEIPDB_KEY=your-abuseipdb-api-key
THREAT_INTEL_OTX_KEY=your-alienvault-otx-api-key
THREAT_INTEL_GREYNOISE_KEY=your-greynoise-api-key

# Cache (production: use Redis)
THREAT_INTEL_CACHE_TTL_SECONDS=86400
REDIS_URL=redis://localhost:6379
```
