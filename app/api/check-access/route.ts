import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, Timestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ allowed: false, reason: 'invalid_user' }, { status: 400 });
        }

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Create user if not exists (Auto-register for MVP)
            await setDoc(userRef, {
                telegramId: userId,
                credits: 10,
                isVip: false,
                vipExpiry: null,
                walletBalance: 0,
                createdAt: serverTimestamp(),
            });
            return NextResponse.json({ allowed: true, remaining: 9 }); // 10 - 1
        }

        const userData = userSnap.data();

        // Check VIP
        if (userData?.isVip) {
            const now = new Date();
            const vipExpiry = userData.vipExpiry as Timestamp | null;
            if (vipExpiry && vipExpiry.toDate() > now) {
                return NextResponse.json({ allowed: true, isVip: true });
            } else {
                // VIP expired
                await updateDoc(userRef, { isVip: false });
            }
        }

        // Check Credits
        if (userData && userData.credits > 0) {
            await updateDoc(userRef, {
                credits: increment(-1),
            });
            return NextResponse.json({ allowed: true, remaining: userData.credits - 1 });
        }

        return NextResponse.json({ allowed: false, reason: 'limit_reached' });

    } catch (error) {
        console.error('Check access error:', error);
        return NextResponse.json({ allowed: false, reason: 'server_error' }, { status: 500 });
    }
}
