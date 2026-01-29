import { NextRequest, NextResponse } from 'next/server';

const QOUPAY_API_KEY = process.env.QOUPAY_API_KEY!;
const QOUPAY_BASE_URL = process.env.QOUPAY_BASE_URL || 'https://payment.qoupaypremium.web.id';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, note } = body;

        const response = await fetch(`${QOUPAY_BASE_URL}/createqris`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': QOUPAY_API_KEY,
            },
            body: JSON.stringify({
                amount: amount || 10000,
                note: note || `VIP DracinAja - ${Date.now()}`,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Qoupay API error:', response.status, errorText);
            // Include upstream error details in the thrown error
            throw new Error(`Qoupay error: ${response.status} - ${errorText}`);
        }

        const qrisData = await response.json();

        // Extract QRIS payload string (for QR code generation)
        const qrisString =
            qrisData?.qris?.payload ||
            qrisData?.qris ||
            qrisData?.payload ||
            null;

        // Extract transaction ID (required for status check)
        const txId = qrisData?.tx?.id;

        if (!txId) {
            console.error('No transaction ID in response:', qrisData);
            throw new Error('Qoupay tidak mengembalikan id transaksi');
        }

        // Return formatted data
        return NextResponse.json({
            id: txId,
            qrisString: qrisString, // Raw QRIS payload for QR generation
            amount: amount || 10000,
            expiresAt: Date.now() + 6 * 60 * 1000, // 6 minutes
            raw: qrisData,
        });
    } catch (error: any) {
        console.error('Create QRIS error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create payment' },
            { status: 500 }
        );
    }
}
