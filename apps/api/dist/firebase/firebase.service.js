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
var FirebaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
let FirebaseService = FirebaseService_1 = class FirebaseService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(FirebaseService_1.name);
    }
    onModuleInit() {
        if (admin.apps.length > 0) {
            this.app = admin.apps[0];
            this._initServices();
            return;
        }
        const projectId = this.configService.get('FIREBASE_PROJECT_ID') || 'qr-absensi-unandnewgame';
        const storageBucket = this.configService.get('FIREBASE_STORAGE_BUCKET') || 'qr-absensi-unandnewgame.appspot.com';
        let keyFound = false;
        const envCredJson = this.configService.get('FIREBASE_CREDENTIALS_JSON');
        if (envCredJson) {
            try {
                const serviceAccount = JSON.parse(envCredJson);
                this.app = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    projectId,
                    storageBucket,
                });
                this.logger.log('Firebase initialized via FIREBASE_CREDENTIALS_JSON');
                keyFound = true;
            }
            catch (e) {
                this.logger.error(`Gagal parsing FIREBASE_CREDENTIALS_JSON: ${e.message}`);
            }
        }
        if (!keyFound) {
            const searchPaths = [
                path.resolve(process.cwd(), 'serviceAccountKey.json'),
                path.resolve(process.cwd(), '..', 'serviceAccountKey.json'),
                path.resolve(process.cwd(), '..', '..', 'serviceAccountKey.json'),
            ];
            const envFilePath = this.configService.get('GOOGLE_APPLICATION_CREDENTIALS');
            if (envFilePath) {
                searchPaths.unshift(path.resolve(process.cwd(), envFilePath));
            }
            for (const keyPath of searchPaths) {
                if (!fs.existsSync(keyPath))
                    continue;
                try {
                    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
                    this.app = admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount),
                        projectId,
                        storageBucket,
                    });
                    this.logger.log(`Firebase initialized from file: ${keyPath}`);
                    keyFound = true;
                    break;
                }
                catch (e) {
                    this.logger.warn(`Gagal membaca key di ${keyPath}: ${e.message}`);
                }
            }
        }
        if (!keyFound) {
            this.logger.warn('serviceAccountKey.json tidak ditemukan.');
            this.logger.warn('Tambahkan FIREBASE_CREDENTIALS_JSON ke environment variables.');
            delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
            this.app = admin.initializeApp({ projectId, storageBucket });
        }
        this._initServices();
    }
    _initServices() {
        try {
            this.firestoreInstance = this.app.firestore();
            this.firestoreInstance.settings({ ignoreUndefinedProperties: true });
            this.authInstance = this.app.auth();
            this.storageInstance = this.app.storage();
            this.logger.log('Firestore, Auth, Storage ready');
        }
        catch (e) {
            this.logger.error(`Firebase services init gagal: ${e.message}`);
        }
    }
    getFirestore() {
        if (!this.firestoreInstance)
            throw new Error('Firestore belum terinisialisasi');
        return this.firestoreInstance;
    }
    getAuth() {
        if (!this.authInstance)
            throw new Error('Auth belum terinisialisasi');
        return this.authInstance;
    }
    getStorage() {
        if (!this.storageInstance)
            throw new Error('Storage belum terinisialisasi');
        return this.storageInstance;
    }
    get firestore() { return this.getFirestore(); }
    get auth() { return this.getAuth(); }
    get timestamp() { return admin.firestore.FieldValue.serverTimestamp(); }
    get timestampNow() { return admin.firestore.Timestamp.now(); }
    createTimestamp(seconds, nanoseconds) {
        return new admin.firestore.Timestamp(seconds, nanoseconds);
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = FirebaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map