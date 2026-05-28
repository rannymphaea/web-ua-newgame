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
    const storageBucket = this.configService.get<string>('FIREBASE_STORAGE_BUCKET')
      || 'qr-absensi-unandnewgame.appspot.com';
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID') || 'qr-absensi-unandnewgame';

    // Search for service account key in multiple locations
    const searchPaths = [
      path.resolve(process.cwd(), 'serviceAccountKey.json'),
      path.resolve(process.cwd(), 'serviceAccountKey.json.json'),
      path.resolve(process.cwd(), '..', '..', 'serviceAccountKey.json'),
      path.resolve(process.cwd(), '..', '..', 'serviceAccountKey.json.json'),
      path.resolve(process.cwd(), '..', 'serviceAccountKey.json'),
      path.resolve(process.cwd(), '..', 'serviceAccountKey.json.json'),
    ];

    const envPath = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
    if (envPath) {
      searchPaths.unshift(path.resolve(process.cwd(), envPath));
    }

    let keyFound = false;
    for (const keyPath of searchPaths) {
      if (fs.existsSync(keyPath)) {
        try {
          const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
          this.app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId,
            storageBucket,
          });
          this.logger.log(`Firebase initialized with key: ${keyPath}`);
          keyFound = true;
          break;
        } catch (e) {
          this.logger.warn(`Failed to parse key at ${keyPath}: ${e.message}`);
        }
      }
    }

    if (!keyFound) {
      this.logger.warn('No service account key found. Download from Firebase Console.');
      this.logger.warn('See NEED_TO_DO.md for instructions.');
      // Initialize without credentials - API calls will fail but server starts
      try {
        // Remove env var so Firebase SDK doesn't try to auto-detect
        delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
        this.app = admin.initializeApp({ projectId, storageBucket });
        this.logger.log('Firebase initialized without credentials (limited functionality)');
      } catch (e) {
        this.logger.error(`Firebase init failed: ${e.message}`);
        this.logger.error('Backend will start but Firebase calls will fail.');
        this.app = admin.initializeApp({ projectId, storageBucket, credential: admin.credential.applicationDefault() });
      }
    }

    try {
      this.firestoreInstance = this.app.firestore();
      this.firestoreInstance.settings({ 
        ignoreUndefinedProperties: true,
        timestampsInSnapshots: true,
      });
      this.authInstance = this.app.auth();
      this.storageInstance = this.app.storage();
      this.logger.log(`Firestore, Auth, and Storage ready. Bucket: ${storageBucket}`);
    } catch (e) {
      this.logger.error(`Firebase services init failed: ${e.message}`);
    }
  }

  /** Get Firestore instance */
  getFirestore(): admin.firestore.Firestore {
    return this.firestoreInstance;
  }

  /** Get Auth instance */
  getAuth(): admin.auth.Auth {
    return this.authInstance;
  }

  /** Get Storage instance */
  getStorage(): admin.storage.Storage {
    return this.storageInstance;
  }

  // Legacy getters for backward compatibility
  get firestore(): admin.firestore.Firestore {
    return this.firestoreInstance;
  }

  get auth(): admin.auth.Auth {
    return this.authInstance;
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
