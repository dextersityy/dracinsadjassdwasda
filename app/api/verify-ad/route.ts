import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        const { userId, token } = await req.json();

        // In a real app, verify the ad token with Monetag S2S postback or shared secret.
        // For this MVP, we simulate success.

        if (!userId) {
            return NextResponse.json({ success: false }, { status: 400 });
        }

        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            credits: FieldValue.increment(10), // Reward 10 credits
        });

        return NextResponse.json({ success: true, message: 'Credits added' });

    } catch (error) {
        console.error('Verify ad error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
