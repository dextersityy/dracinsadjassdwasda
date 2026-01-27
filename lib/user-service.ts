import { db, getAuthUser, getCurrentUserId } from './firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';

export interface UserData {
    credits: number;
    videosWatched: number;
    isVip: boolean;
    vipExpiry: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

const DEFAULT_USER_DATA: UserData = {
    credits: 1,
    videosWatched: 0,
    isVip: false,
    vipExpiry: null,
};

/**
 * Get user ID from Firebase Auth (anonymous or authenticated)
 * This now uses Firebase Anonymous Auth for secure access
 */
export async function getUserIdAsync(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    // Try to get Telegram User ID first (for Telegram Mini App)
    const telegram = (window as unknown as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: { id?: number } } } } }).Telegram;
    if (telegram?.WebApp?.initDataUnsafe?.user?.id) {
        // For Telegram users, we still use Firebase Auth but can link the Telegram ID
        const user = await getAuthUser();
        return user?.uid || null;
    }

    // Use Firebase Anonymous Auth
    const user = await getAuthUser();
    return user?.uid || null;
}

/**
 * Synchronous version - returns current user ID or null if not yet authenticated
 */
export function getUserId(): string | null {
    return getCurrentUserId();
}

/**
 * Get user data from Firestore
 */
export async function getUserData(userId: string): Promise<UserData | null> {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            return {
                credits: data.credits ?? 1,
                videosWatched: data.videosWatched ?? 0,
                isVip: data.isVip ?? false,
                vipExpiry: data.vipExpiry ? (data.vipExpiry as Timestamp).toDate() : null,
                createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : undefined,
                updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined,
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

/**
 * Create new user in Firestore
 */
export async function createUser(userId: string, initialData?: Partial<UserData>): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            ...DEFAULT_USER_DATA,
            ...initialData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

/**
 * Update user credits
 */
export async function updateCredits(userId: string, credits: number): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            credits,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating credits:', error);
        throw error;
    }
}

/**
 * Update videos watched count
 */
export async function updateVideosWatched(userId: string, videosWatched: number): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            videosWatched,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating videos watched:', error);
        throw error;
    }
}

/**
 * Activate VIP status
 */
export async function activateVipStatus(userId: string, expiryDate: Date): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            isVip: true,
            vipExpiry: Timestamp.fromDate(expiryDate),
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error activating VIP:', error);
        throw error;
    }
}

/**
 * Deactivate VIP status (when expired)
 */
export async function deactivateVipStatus(userId: string): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            isVip: false,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error deactivating VIP:', error);
        throw error;
    }
}

/**
 * Sync all user data at once
 */
export async function syncUserData(userId: string, data: Partial<UserData>): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId);
        const updateData: Record<string, unknown> = {
            updatedAt: serverTimestamp(),
        };

        if (data.credits !== undefined) updateData.credits = data.credits;
        if (data.videosWatched !== undefined) updateData.videosWatched = data.videosWatched;
        if (data.isVip !== undefined) updateData.isVip = data.isVip;
        if (data.vipExpiry !== undefined) {
            updateData.vipExpiry = data.vipExpiry ? Timestamp.fromDate(data.vipExpiry) : null;
        }

        await updateDoc(userRef, updateData);
    } catch (error) {
        console.error('Error syncing user data:', error);
        throw error;
    }
}

export interface TransactionData {
    userId: string;
    transactionId: string;
    amount: number;
    status: 'pending' | 'paid' | 'expired' | 'failed';
    type: 'vip_purchase';
    createdAt?: Date;
    paidAt?: Date;
}

/**
 * Record a VIP purchase transaction to Firebase
 */
export async function recordVipTransaction(
    userId: string,
    transactionId: string,
    amount: number,
    status: 'pending' | 'paid' | 'expired' | 'failed'
): Promise<void> {
    try {
        const transactionRef = doc(db, 'transactions', transactionId);
        const transactionData: Record<string, unknown> = {
            userId,
            transactionId,
            amount,
            status,
            type: 'vip_purchase',
            updatedAt: serverTimestamp(),
        };

        // Check if transaction exists
        const existingTx = await getDoc(transactionRef);
        if (existingTx.exists()) {
            // Update existing transaction
            if (status === 'paid') {
                transactionData.paidAt = serverTimestamp();
            }
            await updateDoc(transactionRef, transactionData);
        } else {
            // Create new transaction
            transactionData.createdAt = serverTimestamp();
            await setDoc(transactionRef, transactionData);
        }
    } catch (error) {
        console.error('Error recording transaction:', error);
        throw error;
    }
}
