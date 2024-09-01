// src/config/adminConfig.ts
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp();
}

export const adminAuth = admin.auth();
export const adminFirestore = admin.firestore();