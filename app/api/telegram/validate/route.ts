import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Validates Telegram WebApp initData to ensure requests are legitimate
 * This prevents fake requests from non-Telegram sources
 */
export async function POST(request: NextRequest) {
    try {
        const { initData } = await request.json();

        if (!initData) {
            return NextResponse.json({ valid: false, error: 'No initData provided' }, { status: 400 });
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            console.error('TELEGRAM_BOT_TOKEN not configured');
            return NextResponse.json({ valid: false, error: 'Server configuration error' }, { status: 500 });
        }

        const isValid = validateInitData(initData, botToken);

        if (isValid) {
            // Parse user data from initData
            const params = new URLSearchParams(initData);
            const userDataStr = params.get('user');
            const userData = userDataStr ? JSON.parse(userDataStr) : null;

            return NextResponse.json({
                valid: true,
                user: userData,
                authDate: params.get('auth_date'),
            });
        } else {
            return NextResponse.json({ valid: false, error: 'Invalid initData signature' }, { status: 401 });
        }
    } catch (error) {
        console.error('Error validating initData:', error);
        return NextResponse.json({ valid: false, error: 'Validation failed' }, { status: 500 });
    }
}

/**
 * Validate Telegram WebApp initData using HMAC-SHA256
 * Based on: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
function validateInitData(initData: string, botToken: string): boolean {
    try {
        const params = new URLSearchParams(initData);
        const hash = params.get('hash');

        if (!hash) return false;

        // Remove hash from params and sort remaining params
        params.delete('hash');
        const sortedParams = Array.from(params.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        // Create secret key using HMAC-SHA256 with "WebAppData" as key
        const secretKey = crypto
            .createHmac('sha256', 'WebAppData')
            .update(botToken)
            .digest();

        // Calculate HMAC-SHA256 of the data string
        const calculatedHash = crypto
            .createHmac('sha256', secretKey)
            .update(sortedParams)
            .digest('hex');

        return calculatedHash === hash;
    } catch (error) {
        console.error('Error in validateInitData:', error);
        return false;
    }
}
