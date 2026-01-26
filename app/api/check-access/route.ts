import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ allowed: false, reason: 'invalid_user' }, { status: 400 });
        }

        const userRef = db.collection('users').doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            // Create user if not exists (Auto-register for MVP)
            await userRef.set({
                telegramId: userId,
                credits: 10,
                isVip: false,
                vipExpiry: null,
                walletBalance: 0,
                createdAt: FieldValue.serverTimestamp(),
            });
            return NextResponse.json({ allowed: true, remaining: 9 }); // 10 - 1
        }

        const userData = userSnap.data();

        // Check VIP
        if (userData?.isVip) {
            const now = new Date();
            if (userData.vipExpiry && userData.vipExpiry.toDate() > now) {
                return NextResponse.json({ allowed: true, isVip: true });
            } else {
                // VIP expired
                await userRef.update({ isVip: false });
            }
        }

        // Check Credits
        if (userData?.credits > 0) {
            await userRef.update({
                credits: FieldValue.increment(-1),
            });
            return NextResponse.json({ allowed: true, remaining: userData.credits - 1 });
        }

        return NextResponse.json({ allowed: false, reason: 'limit_reached' });

    } catch (error) {
        console.error('Check access error:', error);
        return NextResponse.json({ allowed: false, reason: 'server_error' }, { status: 500 });
    }
}
