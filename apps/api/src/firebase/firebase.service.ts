import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
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
    // Cegah duplikat inisialisasi
    if (admin.apps.length > 0) {
      this.app = admin.apps[0];
      this._initServices();
      return;
    }

    const storageBucket =
      this.configService.get<string>('FIREBASE_STORAGE_BUCKET') ||
      'qr-absensi-unandnewgame.appspot.com';
    const projectId =
      this.configService.get<string>('FIREBASE_PROJECT_ID') ||
      'qr-absensi-unandnewgame';

    let keyFound = false;

    // 1. Coba ambil dari Environment Variable JSON string (untuk Vercel)
    const envCredJson = this.configService.get<string>('FIREBASE_CREDENTIALS_JSON');
    if (envCredJson) {
      try {
        const serviceAccount = JSON.parse(envCredJson);
        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId,
          storageBucket,
        });
        this.logger.log(`✅ Firebase initialized with FIREBASE_CREDENTIALS_JSON`);
        keyFound = true;
      } catch (e) {
        this.logger.error(`Gagal parsing FIREBASE_CREDENTIALS_JSON: ${e.message}`);
      }
    }

    // 2. Jika tidak ada, cari service account key di lokal
    if (!keyFound) {
      const searchPaths = [
        path.resolve(process.cwd(), 'serviceAccountKey.json'),
        path.resolve(process.cwd(), '..', 'serviceAccountKey.json'),
        path.resolve(process.cwd(), '..', '..', 'serviceAccountKey.json'),
      ];

      const envPath = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
      if (envPath) {
        searchPaths.unshift(path.resolve(process.cwd(), envPath));
      }

      for (const keyPath of searchPaths) {
      if (fs.existsSync(keyPath)) {
        try {
          const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
          this.app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId,
            storageBucket,
          });
          this.logger.log(`✅ Firebase initialized with key: ${keyPath}`);
          keyFound = true;
          break;
        } catch (e) {
          this.logger.warn(`Failed to parse key at ${keyPath}: ${e.message}`);
        }
      }
    }

    if (!keyFound) {
      this.logger.warn('⚠️  serviceAccountKey.json tidak ditemukan.');
      this.logger.warn('Download dari Firebase Console → Project Settings → Service Accounts');
      // Hapus env var agar firebase-admin tidak crash mencari file yang tidak ada
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
      // Inisialisasi tanpa credentials — server tetap jalan, tapi Firebase calls gagal
      this.app = admin.initializeApp({ projectId, storageBucket });
      this.logger.warn('Firebase initialized tanpa credentials (mode terbatas)');
    }

    this._initServices();
  }

  private _initServices() {
    try {
      this.firestoreInstance = this.app.firestore();
      this.firestoreInstance.settings({ ignoreUndefinedProperties: true });
      this.authInstance = this.app.auth();
      this.storageInstance = this.app.storage();
      const bucket = this.storageInstance.bucket().name;
      this.logger.log(`✅ Firestore, Auth, Storage ready. Bucket: ${bucket}`);
    } catch (e) {
      this.logger.error(`Firebase services init failed: ${e.message}`);
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

  // Legacy getters (backward compatible)
  get firestore(): admin.firestore.Firestore {
    return this.getFirestore();
  }

  get auth(): admin.auth.Auth {
    return this.getAuth();
  }

  get timestamp() {
    return admin.firestore.FieldValue.serverTimestamp();
  }

  get timestampNow() {
    return admin.firestore.Timestamp.now();
  }

  createTimestamp(seconds: number, nanoseconds: number) {
    return new admin.firestore.Timestamp(seconds, nanoseconds);
  }
}
