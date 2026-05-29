import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as fs   from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App;
  private firestoreInstance: admin.firestore.Firestore;
  private authInstance: admin.auth.Auth;
  private storageInstance: admin.storage.Storage;
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Cegah duplikat inisialisasi jika module dimuat ulang (cold-start serverless)
    if (admin.apps.length > 0) {
      this.app = admin.apps[0];
      this._initServices();
      return;
    }

    const projectId     = this.configService.get<string>('FIREBASE_PROJECT_ID')      || 'qr-absensi-unandnewgame';
    const storageBucket = this.configService.get<string>('FIREBASE_STORAGE_BUCKET')  || 'qr-absensi-unandnewgame.appspot.com';

    let keyFound = false;

    // ── Opsi 1: Baca credentials dari env var JSON string (digunakan di Vercel) ──
    const envCredJson = this.configService.get<string>('FIREBASE_CREDENTIALS_JSON');
    if (envCredJson) {
      try {
        const serviceAccount = JSON.parse(envCredJson);
        this.app = admin.initializeApp({
          credential:    admin.credential.cert(serviceAccount),
          projectId,
          storageBucket,
        });
        this.logger.log('Firebase initialized via FIREBASE_CREDENTIALS_JSON');
        keyFound = true;
      } catch (e) {
        this.logger.error(`Gagal parsing FIREBASE_CREDENTIALS_JSON: ${e.message}`);
      }
    }

    // ── Opsi 2: Baca dari file serviceAccountKey.json (untuk development lokal) ──
    if (!keyFound) {
      const searchPaths = [
        path.resolve(process.cwd(), 'serviceAccountKey.json'),
        path.resolve(process.cwd(), '..', 'serviceAccountKey.json'),
        path.resolve(process.cwd(), '..', '..', 'serviceAccountKey.json'),
      ];

      const envFilePath = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
      if (envFilePath) {
        searchPaths.unshift(path.resolve(process.cwd(), envFilePath));
      }

      for (const keyPath of searchPaths) {
        if (!fs.existsSync(keyPath)) continue;
        try {
          const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
          this.app = admin.initializeApp({
            credential:    admin.credential.cert(serviceAccount),
            projectId,
            storageBucket,
          });
          this.logger.log(`Firebase initialized from file: ${keyPath}`);
          keyFound = true;
          break;
        } catch (e) {
          this.logger.warn(`Gagal membaca key di ${keyPath}: ${e.message}`);
        }
      }
    }

    // ── Fallback: inisialisasi tanpa credentials — server tetap jalan ──
    if (!keyFound) {
      this.logger.warn('serviceAccountKey.json tidak ditemukan.');
      this.logger.warn('Tambahkan FIREBASE_CREDENTIALS_JSON ke environment variables.');
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
      this.app = admin.initializeApp({ projectId, storageBucket });
    }

    this._initServices();
  }

  private _initServices() {
    try {
      this.firestoreInstance = this.app.firestore();
      this.firestoreInstance.settings({ ignoreUndefinedProperties: true });
      this.authInstance   = this.app.auth();
      this.storageInstance = this.app.storage();
      this.logger.log('Firestore, Auth, Storage ready');
    } catch (e) {
      this.logger.error(`Firebase services init gagal: ${e.message}`);
    }
  }

  getFirestore(): admin.firestore.Firestore {
    if (!this.firestoreInstance) throw new Error('Firestore belum terinisialisasi');
    return this.firestoreInstance;
  }

  getAuth(): admin.auth.Auth {
    if (!this.authInstance) throw new Error('Auth belum terinisialisasi');
    return this.authInstance;
  }

  getStorage(): admin.storage.Storage {
    if (!this.storageInstance) throw new Error('Storage belum terinisialisasi');
    return this.storageInstance;
  }

  // ── Legacy getters (kompatibel ke belakang) ──────────────────────────────────

  get firestore(): admin.firestore.Firestore { return this.getFirestore(); }
  get auth(): admin.auth.Auth                { return this.getAuth(); }

  get timestamp()    { return admin.firestore.FieldValue.serverTimestamp(); }
  get timestampNow() { return admin.firestore.Timestamp.now(); }

  createTimestamp(seconds: number, nanoseconds: number) {
    return new admin.firestore.Timestamp(seconds, nanoseconds);
  }
}
