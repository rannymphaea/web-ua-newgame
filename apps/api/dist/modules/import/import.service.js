"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase/firebase.service");
const user_history_service_1 = require("../user-history/user-history.service");
const user_vault_service_1 = require("../user-vault/user-vault.service");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let ImportService = ImportService_1 = class ImportService {
    constructor(firebase, history, vault) {
        this.firebase = firebase;
        this.history = history;
        this.vault = vault;
        this.logger = new common_1.Logger(ImportService_1.name);
    }
    parseCSV(buffer) {
        const lines = buffer.toString('utf-8').replace(/\r/g, '').split('\n').filter(l => l.trim());
        if (lines.length < 2)
            throw new common_1.BadRequestException('CSV needs header + at least 1 data row');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        return lines.slice(1).map(line => {
            const vals = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
            const row = {};
            headers.forEach((h, i) => { row[h] = vals[i] || ''; });
            return row;
        });
    }
    async importRows(rows, importedBy, dryRun = false) {
        const db = this.firebase.firestore;
        const result = { total: rows.length, inserted: 0, skipped: 0, errors: [], dryRun };
        const existSnap = await db.collection('users').select('email').get();
        const existing = new Set(existSnap.docs.map(d => (d.data().email || '').toLowerCase()));
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2;
            if (!row.name?.trim() || !row.email?.trim()) {
                result.errors.push({ row: rowNum, email: row.email || '', reason: 'Missing name or email' });
                continue;
            }
            const email = row.email.trim().toLowerCase();
            if (!EMAIL_RE.test(email)) {
                result.errors.push({ row: rowNum, email, reason: 'Invalid email format' });
                continue;
            }
            if (existing.has(email)) {
                result.skipped++;
                continue;
            }
            if (!dryRun) {
                try {
                    const now = new Date().toISOString();
                    const data = {
                        name: row.name.trim(), email,
                        username: row.username?.trim().toLowerCase() || '',
                        division: row.division?.trim() || '', role: row.role?.trim() || 'member',
                        memberId: row.memberId?.trim() || '', status: row.status?.trim() || 'active',
                        xpCache: 0, streak: 0, attendanceCount: 0,
                        createdAt: now, updatedAt: now, createdBy: importedBy, importedAt: now,
                    };
                    const ref = await db.collection('users').add({ ...data, serverTs: this.firebase.timestamp });
                    existing.add(email);
                    await Promise.all([
                        this.history.write({ userId: ref.id, changedBy: importedBy, action: 'batch_import', before: {}, after: data, changedFields: Object.keys(data) }),
                        this.vault.saveVersion(ref.id, data, importedBy),
                    ]);
                    result.inserted++;
                }
                catch (err) {
                    result.errors.push({ row: rowNum, email, reason: String(err) });
                }
            }
            else {
                result.inserted++;
            }
        }
        if (!dryRun) {
            try {
                await db.collection('import_logs').add({ importedBy, ...result, timestamp: new Date().toISOString(), serverTs: this.firebase.timestamp });
            }
            catch { }
        }
        return result;
    }
    async getLastImportSummary() {
        try {
            const snap = await this.firebase.firestore.collection('import_logs').orderBy('timestamp', 'desc').limit(1).get();
            if (snap.empty)
                return null;
            return { id: snap.docs[0].id, ...snap.docs[0].data() };
        }
        catch {
            return null;
        }
    }
};
exports.ImportService = ImportService;
exports.ImportService = ImportService = ImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        user_history_service_1.UserHistoryService,
        user_vault_service_1.UserVaultService])
], ImportService);
//# sourceMappingURL=import.service.js.map