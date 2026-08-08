import * as admin from 'firebase-admin';
import { logOpsError } from '@/lib/ops-monitoring';

let firebaseInitialized = false;

export async function initializeFirebase() {
    if (firebaseInitialized) return;

    try {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (!serviceAccountJson) {
            console.warn('FIREBASE_SERVICE_ACCOUNT_JSON not configured - FCM disabled');
            return;
        }

        const serviceAccount = JSON.parse(serviceAccountJson);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        firebaseInitialized = true;
        console.log('Firebase initialized for FCM');
    } catch (error) {
        await logOpsError({
            source: 'lib.firebase-admin',
            level: 'error',
            message: 'Failed to initialize Firebase',
            details: error instanceof Error ? error.message : String(error),
        });
    }
}

export async function sendFCMNotification(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, string>
): Promise<boolean> {
    if (!firebaseInitialized) {
        await initializeFirebase();
    }

    if (!firebaseInitialized) {
        console.warn('Firebase not initialized - cannot send FCM');
        return false;
    }

    try {
        await admin.messaging().send({
            token: deviceToken,
            notification: {
                title,
                body,
            },
            data: data || {},
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'default',
                },
            },
            apns: {
                headers: {
                    'apns-priority': '10',
                },
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
        });

        return true;
    } catch (error) {
        await logOpsError({
            source: 'firebase-admin.sendFCMNotification',
            level: 'warn',
            message: 'Failed to send FCM notification',
            details: {
                deviceToken: deviceToken.substring(0, 20) + '...',
                error: error instanceof Error ? error.message : String(error),
            },
        });
        return false;
    }
}

export async function sendFCMToMultiple(
    deviceTokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
): Promise<{ success: number; failed: number }> {
    if (!firebaseInitialized) {
        await initializeFirebase();
    }

    if (!firebaseInitialized) {
        console.warn('Firebase not initialized');
        return { success: 0, failed: deviceTokens.length };
    }

    let success = 0;
    let failed = 0;

    for (const token of deviceTokens) {
        const sent = await sendFCMNotification(token, title, body, data);
        if (sent) {
            success++;
        } else {
            failed++;
        }
    }

    return { success, failed };
}
