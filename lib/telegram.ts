"use client";

import { useEffect, useState } from 'react';

interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    language_code?: string;
    is_premium?: boolean;
}

interface TelegramWebApp {
    ready: () => void;
    initData: string;
    initDataUnsafe: {
        query_id?: string;
        user?: TelegramUser;
        auth_date?: number;
        hash?: string;
        start_param?: string;
    };
    version: string;
    platform: string;
    colorScheme: string;
    themeParams: Record<string, string>;
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    expand: () => void;
    close: () => void;
}

declare global {
    interface Window {
        Telegram?: {
            WebApp?: TelegramWebApp;
        };
    }
}

export function useTelegramUser(): TelegramUser | null {
    const [user, setUser] = useState<TelegramUser | null>(null);

    useEffect(() => {
        const initTelegram = () => {
            console.log('[Telegram] Initializing...');

            if (typeof window === 'undefined') {
                console.log('[Telegram] Window undefined (SSR)');
                return;
            }

            const tg = window.Telegram?.WebApp;

            if (!tg) {
                console.log('[Telegram] WebApp not available - not in Telegram');
                return;
            }

            // Call ready() to notify Telegram the app is ready
            tg.ready();
            console.log('[Telegram] WebApp ready() called');
            console.log('[Telegram] Platform:', tg.platform);
            console.log('[Telegram] Version:', tg.version);
            console.log('[Telegram] initData:', tg.initData);
            console.log('[Telegram] initDataUnsafe:', JSON.stringify(tg.initDataUnsafe, null, 2));

            if (tg.initDataUnsafe?.user) {
                console.log('[Telegram] User found:', tg.initDataUnsafe.user);
                setUser(tg.initDataUnsafe.user);
            } else {
                console.log('[Telegram] No user in initDataUnsafe');
            }
        };

        // Try immediately
        initTelegram();

        // Also try after a short delay in case SDK loads late
        const timer = setTimeout(initTelegram, 500);

        return () => clearTimeout(timer);
    }, []);

    return user;
}

export function TelegramDebugInfo() {
    const user = useTelegramUser();
    const [debugInfo, setDebugInfo] = useState<string>('Loading...');

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (tg) {
            setDebugInfo(JSON.stringify({
                hasWebApp: !!tg,
                platform: tg.platform,
                version: tg.version,
                hasInitData: !!tg.initData,
                initDataLength: tg.initData?.length,
                hasUser: !!tg.initDataUnsafe?.user,
                userId: tg.initDataUnsafe?.user?.id,
            }, null, 2));
        } else {
            setDebugInfo('Telegram WebApp not available');
        }
    }, []);

    return (
        <div className= "p-3 bg-gray-800 rounded-lg text-xs font-mono text-green-400 overflow-auto max-h-40" >
        <div>User: { user ? `${user.first_name} (${user.id})` : 'Not detected' } </div>
            < pre > { debugInfo } </pre>
            </div>
    );
}
