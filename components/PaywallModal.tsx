"use client";

import { useState } from 'react';
import { useCredits } from '@/contexts/CreditContext';
import { Play, Crown, Tv, Zap, X, AlertCircle } from 'lucide-react';
import { VipPaymentModal } from '@/components/VipPaymentModal';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Declare the Monetag SDK function type
declare global {
    interface Window {
        show_10522796: (options?: { ymid?: string; type?: string }) => Promise<void>;
    }
}

export function PaywallModal({ isOpen, onClose, onSuccess }: PaywallModalProps) {
    const { addCredits, credits, videosWatched } = useCredits();
    const [isLoadingAd, setIsLoadingAd] = useState(false);
    const [adError, setAdError] = useState<string | null>(null);
    const [showDevOption, setShowDevOption] = useState(false);
    const [showVipPayment, setShowVipPayment] = useState(false);

    if (!isOpen) return null;

    // Wait for SDK to be ready with retries
    const waitForSdk = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 10; // 10 attempts = 5 seconds max

            const check = () => {
                attempts++;
                console.log(`[Monetag] Checking SDK... attempt ${attempts}`);

                if (typeof window.show_10522796 === 'function') {
                    console.log('[Monetag] SDK ready!');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.log('[Monetag] SDK not available after max attempts');
                    reject(new Error('SDK not loaded'));
                } else {
                    setTimeout(check, 500);
                }
            };
            check();
        });
    };

    const handleWatchAd = async () => {
        setIsLoadingAd(true);
        setAdError(null);

        try {
            // Wait for SDK to be ready
            await waitForSdk();

            // Show the rewarded ad
            console.log('[Monetag] Showing ad...');
            await window.show_10522796({ ymid: `user-${Date.now()}` });

            // User completed ad - reward 10 credits
            console.log('[Monetag] Ad completed, rewarding user');
            addCredits(10);
            onSuccess();
        } catch (error: any) {
            console.warn('Ad failed or skipped:', error);

            // Show dev fallback option
            setShowDevOption(true);

            if (error.message?.includes('Network')) {
                setAdError('Koneksi gagal. Pastikan tidak ada ad blocker aktif.');
            } else if (error.message?.includes('SDK')) {
                setAdError('SDK iklan belum siap. Pastikan buka dari Telegram Mini App.');
            } else {
                setAdError('Iklan tidak tersedia atau user menutup iklan.');
            }
        } finally {
            setIsLoadingAd(false);
        }
    };

    // Development fallback - give free credits
    const handleDevReward = () => {
        addCredits(10);
        onSuccess();
    };

    const handleBuyVip = () => {
        setShowVipPayment(true);
    };

    const handleVipSuccess = () => {
        setShowVipPayment(false);
        onSuccess();
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-sm bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-white/10 overflow-hidden">
                    {/* Header */}
                    <div className="relative p-6 text-center bg-gradient-to-b from-amber-500/20 to-transparent">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        <div className="h-16 w-16 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                            <Tv size={32} className="text-amber-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Kredit Habis!</h2>
                        <p className="text-gray-400 text-sm mt-2">
                            Kamu sudah menonton {videosWatched} video
                        </p>
                    </div>

                    {/* Options */}
                    <div className="p-5 space-y-3">
                        {/* Watch Ad Option */}
                        <button
                            onClick={handleWatchAd}
                            disabled={isLoadingAd}
                            className="w-full p-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center gap-4 hover:opacity-90 transition disabled:opacity-50"
                        >
                            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                                <Play size={24} />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-bold">{isLoadingAd ? 'Memuat...' : 'Tonton Iklan'}</h3>
                                <p className="text-sm text-green-200">Dapatkan 10 kredit GRATIS</p>
                            </div>
                            <Zap size={20} className="text-yellow-300" />
                        </button>

                        {/* Error Message & Dev Fallback */}
                        {adError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <div className="flex items-start gap-2 text-red-400 text-xs">
                                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                    <p>{adError}</p>
                                </div>

                                {showDevOption && (
                                    <button
                                        onClick={handleDevReward}
                                        className="w-full mt-3 py-2 rounded-lg bg-gray-800 text-gray-300 text-xs hover:bg-gray-700 transition"
                                    >
                                        🔧 Dev Mode: Dapatkan Kredit Gratis
                                    </button>
                                )}
                            </div>
                        )}

                        {/* VIP Option */}
                        <button
                            onClick={handleBuyVip}
                            className="w-full p-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black flex items-center gap-4 hover:opacity-90 transition"
                        >
                            <div className="h-12 w-12 rounded-full bg-black/20 flex items-center justify-center">
                                <Crown size={24} />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-bold">Beli VIP</h3>
                                <p className="text-sm text-amber-900">Unlimited • Rp 10.000/bulan</p>
                            </div>
                        </button>

                        {/* Info */}
                        <div className="pt-3 text-center text-xs text-gray-500">
                            <p>1 Kredit = 10 Video</p>
                            <p className="mt-1">VIP = Unlimited tanpa iklan</p>
                        </div>
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
