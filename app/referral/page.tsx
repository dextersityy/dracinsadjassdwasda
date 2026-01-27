"use client";

import { useState } from 'react';
import { Users, Copy, Check, Wallet, Clock, ArrowRight, Banknote } from 'lucide-react';
import { useReferral } from '@/contexts/ReferralContext';
import { useCredits } from '@/contexts/CreditContext';

export default function ReferralPage() {
    const { totalReferrals, totalEarnings, pendingEarnings, getReferralLink, requestWithdrawal, isLoading } = useReferral();
    const { isVip } = useCredits();
    const [copied, setCopied] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [withdrawResult, setWithdrawResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(getReferralLink());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleWithdraw = async () => {
        if (pendingEarnings < 10000) {
            setWithdrawResult({ success: false, message: 'Minimum penarikan Rp10.000' });
            return;
        }

        setWithdrawing(true);
        try {
            const result = await requestWithdrawal(pendingEarnings);
            setWithdrawResult(result);
            if (result.success) {
                setTimeout(() => {
                    setShowWithdrawModal(false);
                    setWithdrawResult(null);
                }, 2000);
            }
        } catch (err) {
            setWithdrawResult({ success: false, message: 'Gagal memproses penarikan' });
        } finally {
            setWithdrawing(false);
        }
    };

    return (
        <div className="min-h-screen pb-24 pt-4 px-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                    <Users className="w-6 h-6 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold">Program Referral</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="glass-card rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-gray-400">Total Referral</span>
                    </div>
                    <p className="text-2xl font-bold">{totalReferrals}</p>
                    <p className="text-xs text-gray-500">orang bergabung</p>
                </div>
                <div className="glass-card rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-gray-400">Total Komisi</span>
                    </div>
                    <p className="text-2xl font-bold">Rp{totalEarnings.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">sepanjang waktu</p>
                </div>
            </div>

            {/* Pending Balance Card */}
            <div className="glass-card rounded-2xl p-5 mb-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-400" />
                        <span className="font-medium">Saldo Pending</span>
                    </div>
                    <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full">
                        Bisa ditarik
                    </span>
                </div>
                <p className="text-3xl font-bold text-amber-400 mb-2">
                    Rp{pendingEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                    Komisi dari referral yang sudah beli VIP
                </p>
                <button
                    onClick={() => setShowWithdrawModal(true)}
                    disabled={pendingEarnings < 10000}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
                >
                    <Banknote className="w-5 h-5" />
                    Tarik Saldo
                </button>
                {pendingEarnings < 10000 && (
                    <p className="text-xs text-center text-gray-500 mt-2">
                        Minimum penarikan Rp10.000
                    </p>
                )}
            </div>

            {/* Commission Info */}
            <div className="glass-card rounded-2xl p-4 mb-6">
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                    <p className="text-sm text-green-200">
                        🎁 Dapatkan <span className="font-bold">Rp3.000</span> (30%) setiap teman Anda membeli VIP Rp10.000!
                    </p>
                </div>
            </div>

            {/* Referral Link */}
            <div className="glass-card rounded-2xl p-4 mb-6">
                <h3 className="font-semibold mb-3">Link Referral Anda</h3>
                <div className="flex gap-2">
                    <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-sm truncate">
                        {getReferralLink()}
                    </div>
                    <button
                        onClick={handleCopyLink}
                        className="px-4 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors flex items-center gap-2 text-black font-medium"
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                    Bagikan link ini ke teman-teman Anda via Telegram, WhatsApp, dll!
                </p>
            </div>

            {/* How It Works */}
            <div className="glass-card rounded-2xl p-4">
                <h3 className="font-semibold mb-4">Cara Kerja</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-sm shrink-0">
                            1
                        </div>
                        <div>
                            <p className="font-medium text-sm">Bagikan Link</p>
                            <p className="text-xs text-gray-500">Kirim link referral ke teman-teman Anda</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-sm shrink-0">
                            2
                        </div>
                        <div>
                            <p className="font-medium text-sm">Teman Bergabung</p>
                            <p className="text-xs text-gray-500">Teman klik link dan masuk ke DracinAja</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-sm shrink-0">
                            3
                        </div>
                        <div>
                            <p className="font-medium text-sm">Teman Beli VIP</p>
                            <p className="text-xs text-gray-500">Saat teman beli VIP, Anda dapat komisi 30%</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold text-sm shrink-0">
                            4
                        </div>
                        <div>
                            <p className="font-medium text-sm">Tarik Saldo</p>
                            <p className="text-xs text-gray-500">Tarik saldo pending Anda (min Rp10.000)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-sm bg-gray-900 rounded-2xl border border-white/10 p-6">
                        <h3 className="text-xl font-bold mb-4">Tarik Saldo</h3>

                        <div className="bg-white/5 rounded-xl p-4 mb-4">
                            <p className="text-sm text-gray-400">Jumlah Penarikan</p>
                            <p className="text-2xl font-bold text-amber-400">
                                Rp{pendingEarnings.toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-amber-500/10 rounded-xl p-3 mb-4 border border-amber-500/20">
                            <p className="text-xs text-amber-200">
                                ⚠️ Penarikan akan diproses dalam 1-3 hari kerja. Hubungi admin untuk konfirmasi rekening tujuan.
                            </p>
                        </div>

                        {withdrawResult && (
                            <div className={`rounded-xl p-3 mb-4 ${withdrawResult.success
                                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                }`}>
                                <p className="text-sm">{withdrawResult.message}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowWithdrawModal(false);
                                    setWithdrawResult(null);
                                }}
                                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleWithdraw}
                                disabled={withdrawing || pendingEarnings < 10000}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
                            >
                                {withdrawing ? 'Memproses...' : 'Konfirmasi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
