import { NextRequest, NextResponse } from 'next/server';

const QOUPAY_API_KEY = 'p7HG0qRualY4_XH9yyiVnAoygSE_d9Xw';
const QOUPAY_BASE_URL = 'https://payment.qoupaypremium.web.id';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
        }

        const response = await fetch(`${QOUPAY_BASE_URL}/statusqris?id=${id}`, {
            method: 'GET',
            headers: {
                'x-api-key': QOUPAY_API_KEY,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to check status');
        }

        const statusData = await response.json();
        const tx = statusData.tx || {};
        const status = String(tx.status || 'UNKNOWN').toUpperCase();

        return NextResponse.json({
            id: tx.id,
            status: status,
            total: tx.total,
            paid: status === 'PAID',
            expired: ['EXPIRED', 'CANCELLED', 'CANCELED', 'FAILED'].includes(status),
            raw: statusData,
        });
    } catch (error: any) {
        console.error('Check status error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to check payment status' },
            { status: 500 }
        );
    }
}
