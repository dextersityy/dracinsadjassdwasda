"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Sparkles, Settings, ChevronRight, Copy, Crown, Tv, Users } from 'lucide-react';
import clsx from 'clsx';
import { useCredits } from '@/contexts/CreditContext';
import { VipPaymentModal } from '@/components/VipPaymentModal';

interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { credits, videosWatched, isVip, vipExpiry, activateVip } = useCredits();
    const [mounted, setMounted] = useState(false);
    const [showVipPayment, setShowVipPayment] = useState(false);
    const [user, setUser] = useState<TelegramUser | null>(null);
    const [showDebug, setShowDebug] = useState(true); // Default to true for debugging
    const [debugInfo, setDebugInfo] = useState<string>('Initializing...');

    useEffect(() => {
        setMounted(true);

        // Read user data from Telegram WebApp SDK
        const initTelegram = () => {
            const telegram = (window as unknown as {
                Telegram?: {
                    WebApp?: {
                        ready: () => void;
                        initDataUnsafe?: { user?: TelegramUser };
                        initData?: string;
                        platform?: string;
                        version?: string;
                    }
                }
            }).Telegram;

            // Collect debug info
            const debug: string[] = [];
            debug.push(`Time: ${new Date().toLocaleTimeString()}`);
            debug.push(`Has Telegram: ${!!telegram}`);
            debug.push(`Has WebApp: ${!!telegram?.WebApp}`);

            if (telegram?.WebApp) {
                // Call ready() to notify Telegram the app is ready
                telegram.WebApp.ready();

                debug.push(`Platform: ${telegram.WebApp.platform || 'unknown'}`);
                debug.push(`Version: ${telegram.WebApp.version || 'unknown'}`);
                debug.push(`initData length: ${telegram.WebApp.initData?.length || 0}`);
                debug.push(`Has user: ${!!telegram.WebApp.initDataUnsafe?.user}`);

                if (telegram.WebApp.initDataUnsafe?.user) {
                    const u = telegram.WebApp.initDataUnsafe.user;
                    debug.push(`User ID: ${u.id}`);
                    debug.push(`First name: ${u.first_name}`);
                    setUser(u);
                } else {
                    debug.push('No user in initDataUnsafe');
                    setUser({
                        id: 0,
                        first_name: "Telegram",
                        last_name: "User",
                    });
                }
            } else {
                debug.push('Not in Telegram WebApp');
                setUser({
                    id: 0,
                    first_name: "Guest",
                    last_name: "User",
                });
            }

            setDebugInfo(debug.join('\n'));
        };

        // Try immediately and after delay
        initTelegram();
        setTimeout(initTelegram, 500);
    }, []);

    const remainingVideos = credits * 10 - videosWatched;

    const handleBuyVip = () => {
        setShowVipPayment(true);
    };

    const handleVipSuccess = () => {
        setShowVipPayment(false);
    };

    const goToSettings = () => {
        router.push('/settings');
    };

    const goToReferral = () => {
        router.push('/referral');
    };

    if (!mounted || !user) return null;

    return (
        <>
            <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
                {/* Debug Panel - Always visible at top */}
                <div className="p-3 bg-gray-900 border-b border-gray-800">
                    <button
                        onClick={() => setShowDebug(!showDebug)}
                        className="w-full text-center text-xs text-yellow-400 py-1 font-mono"
                    >
                        {showDebug ? '🔽 Hide Debug Info' : '🔼 Show Debug Info'}
                    </button>

                    {showDebug && (
                        <div className="mt-2 p-3 rounded-lg bg-black border border-green-900 text-xs font-mono">
                            <p className="text-green-400 mb-2 font-bold">📡 Telegram SDK Debug:</p>
                            <pre className="text-green-300 whitespace-pre-wrap">{debugInfo}</pre>
                        </div>
                    )}
                </div>

                {/* Profile Header */}
                <div className="relative pt-6 pb-6 px-6 bg-gradient-to-b from-gray-900 via-gray-900 to-[#0a0a0a] border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 p-[2px]">
                            <div className="h-full w-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                {user.photo_url ? (
                                    <img src={user.photo_url} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <User size={32} className="text-gray-400" />
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold">{user.first_name} {user.last_name || ''}</h1>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                <span>ID: {user.id}</span>
                                <Copy size={12} className="cursor-pointer hover:text-white" />
                            </div>

                            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium">
                                {isVip ? (
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                                        👑 VIP MEMBER
                                    </span>
                                ) : (
                                    <span className="text-gray-400">FREE MEMBER</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats / Credit Card */}
                <div className="p-4 -mt-4">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 p-6 shadow-xl">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                        <div className="relative z-10 flex justify-between items-center text-white">
                            <div>
                                <p className="text-sm font-medium text-amber-100">Sisa Video</p>
                                <h2 className="text-4xl font-black mt-1">
                                    {isVip ? '∞' : remainingVideos}
                                </h2>
                                <p className="text-xs text-amber-100/70 mt-1">
                                    {isVip ? 'Unlimited Access' : `${credits} kredit (${credits * 10} video)`}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                                <Tv size={24} />
                            </div>
                        </div>

                        <div className="mt-6">
                            {isVip ? (
                                <p className="text-xs text-amber-100/80">
                                    VIP aktif sampai {vipExpiry?.toLocaleDateString('id-ID')}
                                </p>
                            ) : (
                                <button
                                    onClick={handleBuyVip}
                                    className="w-full py-2.5 rounded-lg bg-black/20 hover:bg-black/30 backdrop-blur-sm text-sm font-semibold transition flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={16} /> Upgrade ke VIP
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Menu Options */}
                <div className="px-4 py-2 space-y-3">
                    <MenuItem icon={Crown} label="Beli VIP" subLabel="Unlimited • Rp 10.000/bulan" highlight onClick={handleBuyVip} />
                    <MenuItem icon={Users} label="Program Referral" subLabel="Ajak teman, dapat komisi 30%" onClick={goToReferral} />
                    <MenuItem icon={Settings} label="Pengaturan" onClick={goToSettings} />
                </div>

                {/* Credit Info */}
                <div className="px-4 mt-6">
                    <div className="p-4 rounded-xl bg-gray-900/50 border border-white/5 text-center">
                        <p className="text-gray-400 text-sm">1 Kredit = 10 Video</p>
                        <p className="text-gray-500 text-xs mt-1">Tonton iklan untuk dapat kredit gratis</p>
                    </div>
                </div>
            </div>

            {/* VIP Payment Modal */}
            <VipPaymentModal
                isOpen={showVipPayment}
                onClose={() => setShowVipPayment(false)}
                onSuccess={handleVipSuccess}
            />
        </>
    );
}

function MenuItem({ icon: Icon, label, subLabel, highlight, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-900/40 border border-white/5 hover:bg-gray-900 transition active:scale-[0.98]"
        >
            <div className={clsx("p-2.5 rounded-lg", highlight ? "bg-amber-500/10 text-amber-500" : "bg-white/5 text-gray-400")}>
                <Icon size={20} />
            </div>
            <div className="flex-1 text-left">
                <h4 className={clsx("text-sm font-semibold", highlight ? "text-amber-500" : "text-white")}>
                    {label}
                </h4>
                {subLabel && <p className="text-xs text-gray-500 mt-0.5">{subLabel}</p>}
            </div>
            <ChevronRight size={18} className="text-gray-600" />
        </button>
    );
}
