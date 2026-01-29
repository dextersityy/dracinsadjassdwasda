"use client";

import { useState } from 'react';
import { useCredits } from '@/contexts/CreditContext';
import { Play, Crown, Tv, Zap, X, AlertCircle, Coins } from 'lucide-react';
import { VipPaymentModal } from '@/components/VipPaymentModal';
import { CreditPackPaymentModal } from '@/components/CreditPackPaymentModal';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Declare Adsgram SDK (sad.min.js)
declare global {
    interface Window {
        Adsgram?: {
            init: (config: { blockId: string; debug?: boolean }) => {
                show: () => Promise<{ done: boolean; description: string; state: string }>;
            };
        };
    }
}

export function PaywallModal({ isOpen, onClose, onSuccess }: PaywallModalProps) {
    const { addCredits, credits, videosWatched } = useCredits();
    const [isLoadingAd, setIsLoadingAd] = useState(false);
    const [adError, setAdError] = useState<string | null>(null);
    const [showVipPayment, setShowVipPayment] = useState(false);
    const [showCreditPack, setShowCreditPack] = useState<'small' | 'large' | null>(null);

    if (!isOpen) return null;

    const handleWatchAd = async () => {
        setIsLoadingAd(true);
        setAdError(null);

        try {
            // Check if Adsgram AdController (sad.min.js) is available
            if (!window.Adsgram) {
                throw new Error('SDK not loaded');
            }

            console.log('[Adsgram] Initializing ad...');
            const AdController = window.Adsgram.init({ blockId: "21980" });

            console.log('[Adsgram] Showing ad...');
            const result = await AdController.show();

            if (result.done) {
                // User completed ad - reward 3 credits
                console.log('[Adsgram] Ad completed, rewarding user');
                addCredits(3);
                onSuccess();
            } else {
                // User closed ad early or it failed
                // result.state can be 'error', 'skipped', etc.
                throw new Error(result.description || `Ad ${result.state}`);
            }
        } catch (error: any) {
            console.warn('Ad failed or skipped:', error);

            if (error.message?.includes('Network')) {
                setAdError('Koneksi gagal. Pastikan tidak ada ad blocker aktif.');
            } else if (error.message?.includes('timeout') || error.message?.includes('unavailable')) {
                setAdError('Iklan tidak tersedia. Coba lagi nanti.');
            } else {
                setAdError('Iklan tidak tersedia atau kamu menutup iklan sebelum selesai.');
            }
        } finally {
            setIsLoadingAd(false);
        }
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
                                <p className="text-sm text-green-200">Dapatkan 3 kredit GRATIS</p>
                            </div>
                            <Zap size={20} className="text-yellow-300" />
                        </button>

                        {/* Error Message */}
                        {adError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <div className="flex items-start gap-2 text-red-400 text-xs">
                                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                    <p>{adError}</p>
                                </div>
                            </div>
                        )}

                        {/* Credit Pack Options */}
                        <div className="grid grid-cols-2 gap-2">
                            {/* Small Pack: Rp 3.000 = 30 Credits */}
                            <button
                                onClick={() => setShowCreditPack('small')}
                                className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:opacity-90 transition"
                            >
                                <div className="text-lg font-bold">30</div>
                                <div className="text-xs opacity-80">Kredit</div>
                                <div className="text-sm font-bold mt-1">Rp 3.000</div>
                            </button>

                            {/* Large Pack: Rp 7.000 = 80 Credits */}
                            <button
                                onClick={() => setShowCreditPack('large')}
                                className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition"
                            >
                                <div className="text-lg font-bold">80</div>
                                <div className="text-xs opacity-80">Kredit</div>
                                <div className="text-sm font-bold mt-1">Rp 7.000</div>
                                <div className="text-[10px] text-green-300">HEMAT!</div>
                            </button>
                        </div>

                        {/* VIP Option - Best Seller */}
                        <button
                            onClick={handleBuyVip}
                            className="w-full p-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black flex items-center gap-4 hover:opacity-90 transition relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                                BEST SELLER
                            </div>
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
                            <p>1 Kredit = 1 Video</p>
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

            {/* Credit Pack Payment Modal */}
            {showCreditPack && (
                <CreditPackPaymentModal
                    isOpen={true}
                    onClose={() => setShowCreditPack(null)}
                    onSuccess={() => {
                        setShowCreditPack(null);
                        onSuccess();
                    }}
                    packType={showCreditPack}
                />
            )}
        </>
    );
}
