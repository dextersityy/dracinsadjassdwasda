import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    increment,
    serverTimestamp,
    query,
    where,
    limit
} from 'firebase/firestore';

/**
 * Adsgram Reward Postback (S2S)
 * URL: https://blond.my.id/api/adsgram/reward?userId=[userId]
 * Adsgram replaces [userId] with the actual Telegram ID.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const telegramId = searchParams.get('userId');

        if (!telegramId) {
            console.error('[Adsgram Reward] No userId provided in query');
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        console.log(`[Adsgram Reward] Received reward for Telegram ID: ${telegramId}`);

        // 1. Try to find user by document ID (if document ID is Telegram ID)
        const userRef = doc(db, 'users', telegramId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            await updateDoc(userRef, {
                credits: increment(3),
                updatedAt: serverTimestamp(),
            });
            console.log(`[Adsgram Reward] Updated user ${telegramId} via docId`);
            return new Response('OK', { status: 200 });
        }

        // 2. Try to find user by telegramId field (if using Firebase UID as doc ID)
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('telegramId', '==', telegramId), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            await updateDoc(userDoc.ref, {
                credits: increment(3),
                updatedAt: serverTimestamp(),
            });
            console.log(`[Adsgram Reward] Updated user ${userDoc.id} via telegramId field`);
            return new Response('OK', { status: 200 });
        }

        console.warn(`[Adsgram Reward] User with Telegram ID ${telegramId} not found in Firestore`);
        return new Response('User not found', { status: 200 });

    } catch (error) {
        console.error('[Adsgram Reward] Error processing reward:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
