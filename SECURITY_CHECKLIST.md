# NEWGAME — Security Checklist
**Last updated**: 2026-05-27 | **Standard**: OWASP ASVS L3 · CIS Benchmark

---

## Pre-Deployment Checklist

### Infrastructure
- [ ] Server OS patched to latest stable (Ubuntu 22.04 LTS or Debian 12)
- [ ] Fail2ban installed and configured for SSH + NGINX logs
- [ ] UFW/iptables: only ports 22 (SSH), 80 (HTTP→redirect), 443 (HTTPS) open
- [ ] SSH: key-only auth, root login disabled, port changed from 22
- [ ] Automatic security updates enabled (`unattended-upgrades`)

### TLS / Certificates
- [ ] TLS certificate installed (Let's Encrypt or commercial CA)
- [ ] TLS 1.3 only configured in NGINX (`ssl_protocols TLSv1.3`)
- [ ] OCSP stapling enabled
- [ ] HSTS header configured (max-age=63072000, includeSubDomains, preload)
- [ ] Certificate auto-renewal cron configured
- [ ] SSL Labs score A+ verified: https://www.ssllabs.com/ssltest/

### NGINX
- [ ] `server_tokens off` set
- [ ] Security headers config included (`security-headers.conf`)
- [ ] CSP header configured for production domains
- [ ] Rate limiting zones configured and tested
- [ ] Sensitive path denial rules verified (/.env, /.git, etc.)
- [ ] Access log format set to JSON forensic format
- [ ] Error log level set to `warn`
- [ ] Geo-IP database installed (GeoLite2-City.mmdb, GeoLite2-ASN.mmdb)

### ModSecurity WAF
- [ ] ModSecurity v3 installed and enabled
- [ ] OWASP CRS v4 installed
- [ ] `crs-setup.conf` customized (paranoia level 2, anomaly thresholds)
- [ ] `modsecurity.conf` audit logging enabled (JSON format)
- [ ] WAF tested with OWASP ZAP or Nikto (verify blocks, not bypasses)
- [ ] Bad-IP blocklist file created at `/etc/modsecurity/bad-ips.txt`
- [ ] Log rotation for `/var/log/modsecurity/` configured

### NestJS API
- [ ] `SecurityModule` imported in `AppModule`
- [ ] All environment variables set (see `.env.example`)
- [ ] `FRONTEND_URL` set to production domain
- [ ] Firebase Admin SDK initialized with production service account
- [ ] `serviceAccountKey.json` file permissions: `chmod 600`
- [ ] `serviceAccountKey.json.json` double-extension bug fixed (rename to `.json`)
- [ ] Global `ValidationPipe` configured (whitelist + forbidNonWhitelisted)
- [ ] Rate limiting in `main.ts` set to production values
- [ ] CORS origin set to production frontend URL only

### Security Services
- [ ] `ForensicMiddleware` applied to all routes (via `SecurityModule`)
- [ ] `ForensicLoggerMiddleware` applied to all routes
- [ ] `AnomalyEngineService` initialized and training verified
- [ ] `EvidenceChainService` initialized and chain verification passes
- [ ] `SiemService` connected to at least one SIEM backend
- [ ] `AlertService` all channels tested with test alert
- [ ] `RequestReplayGuard` applied to all write endpoints (POST/PUT/PATCH/DELETE)

---

## Runtime Monitoring Checklist

### Daily
- [ ] Review SIEM dashboard for HIGH/CRITICAL anomalies
- [ ] Check Telegram/Discord for overnight security alerts
- [ ] Verify evidence chain integrity: `evidenceChainService.verify()`
- [ ] Review ModSecurity audit log for new attack patterns
- [ ] Check active blocked IPs count

### Weekly
- [ ] Review threat intelligence feeds (AbuseIPDB, OTX, GreyNoise)
- [ ] Update bad-IP blocklist from threat intel sources
- [ ] Review API key usage for abuse patterns
- [ ] Check AI model training status and anomaly baseline drift
- [ ] Review rate limit hit statistics

### Monthly
- [ ] Rotate SIEM API keys (`SIEM_KEY_ROTATION_DAYS=30`)
- [ ] Rotate alert webhook tokens
- [ ] Review and update OWASP CRS version
- [ ] Run full WAF regression test
- [ ] Export and archive evidence chain logs
- [ ] Review firewall rule effectiveness
- [ ] Update GeoLite2 databases (MaxMind monthly release)

### Quarterly
- [ ] Full penetration test (internal or third-party)
- [ ] OWASP ZAP full scan on production
- [ ] Review and update TLS certificate expiry
- [ ] Review Firestore security rules
- [ ] Review Firebase App Check configuration
- [ ] AI model manual review — check for concept drift

---

## Incident Response Checklist

### Detection (0–5 min)
- [ ] Receive alert via Telegram/Discord/Slack
- [ ] Identify: IP, type, severity, fingerprint from alert
- [ ] Cross-reference with SIEM for full context

### Containment (5–15 min)
- [ ] Add attacker IP to `/etc/modsecurity/bad-ips.txt` → auto-ban
- [ ] If persistent: add to UFW: `ufw deny from <IP>`
- [ ] Block at NGINX level if needed: `deny <IP>`
- [ ] Revoke compromised Firebase token if account breach suspected

### Evidence Collection (15–30 min)
- [ ] Export evidence chain: `evidenceChainService.exportEvidence(fromSeq, toSeq)`
- [ ] Save Merkle proof for relevant entries
- [ ] Export NGINX JSON logs for the attack window
- [ ] Export ModSecurity audit log entries
- [ ] Screenshot alert notifications (Discord/Telegram)

### Reporting
- [ ] ISP report: send evidence package to attacker's ISP abuse contact
  - Format: Evidence chain JSON + Merkle root + NGINX log excerpt
- [ ] CERT/ID report: id-cert@cert.or.id
- [ ] Internal incident report created
- [ ] Firestore anomaly log updated with incident record

### Recovery
- [ ] Root cause identified
- [ ] Patch or rule update applied
- [ ] WAF rules updated if new attack pattern identified
- [ ] Post-incident review documented
- [ ] AI model retrained with attack samples labeled

---

## Environment Variables Required

```env
# Firebase
FIREBASE_PROJECT_ID=your-project-id

# API
NEXT_PUBLIC_API_URL=https://api.newgame.example.com
FRONTEND_URL=https://newgame.example.com
NODE_ENV=production

# SIEM (at least one required)
SIEM_ELASTIC_URL=
SIEM_ELASTIC_API_KEY=
SIEM_LOKI_URL=
SIEM_SPLUNK_URL=
SIEM_SPLUNK_TOKEN=
SIEM_WEBHOOK_URL=
SIEM_WEBHOOK_KEY=

# Alerts (at least one required)
ALERT_TELEGRAM_BOT_TOKEN=
ALERT_TELEGRAM_CHAT_ID=
ALERT_DISCORD_WEBHOOK=
ALERT_SLACK_WEBHOOK=
ALERT_EMAIL_WEBHOOK=
ALERT_EMAIL_TO=
ALERT_EMAIL_FROM=
```
