import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
export declare class FirebaseService implements OnModuleInit {
    private configService;
    private app;
    private firestoreInstance;
    private authInstance;
    private storageInstance;
    private readonly logger;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    private _initServices;
    getFirestore(): admin.firestore.Firestore;
    getAuth(): admin.auth.Auth;
    getStorage(): admin.storage.Storage;
    get firestore(): admin.firestore.Firestore;
    get auth(): admin.auth.Auth;
    get timestamp(): admin.firestore.FieldValue;
    get timestampNow(): admin.firestore.Timestamp;
    createTimestamp(seconds: number, nanoseconds: number): admin.firestore.Timestamp;
}
