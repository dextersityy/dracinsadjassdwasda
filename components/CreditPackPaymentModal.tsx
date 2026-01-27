"use client";

import { useState, useEffect, useRef } from 'react';
import { useCredits } from '@/contexts/CreditContext';
import { getUserId } from '@/lib/user-service';
import { X, Coins, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface CreditPackPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    packType: 'small' | 'large';
}

interface QrisData {
    id: string;
    qrisString: string;
    amount: number;
    expiresAt: number;
}

// Credit pack pricing
const CREDIT_PACKS = {
    small: { price: 3000, credits: 30, label: 'Paket Hemat' },
    large: { price: 7000, credits: 80, label: 'Paket Super' },
};

// Generate QR code URL using public API
function generateQRUrl(data: string): string {
    const encoded = encodeURIComponent(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;
}

export function CreditPackPaymentModal({ isOpen, onClose, onSuccess, packType }: CreditPackPaymentModalProps) {
    const { addCredits, userId } = useCredits();
    const [step, setStep] = useState<'loading' | 'qris' | 'success' | 'error' | 'expired'>('loading');
    const [qrisData, setQrisData] = useState<QrisData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const expiryRef = useRef<NodeJS.Timeout | null>(null);

    const pack = CREDIT_PACKS[packType];

    // Create QRIS on open
    useEffect(() => {
        if (isOpen) {
            createQris();
        }
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (expiryRef.current) clearTimeout(expiryRef.current);
        };
    }, [isOpen]);

    const createQris = async () => {
        setStep('loading');
        setError(null);

        try {
            const currentUserId = userId || getUserId();

            if (!currentUserId) throw new Error('User ID not found');

            const res = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: pack.price,
                    note: `Credit Pack ${pack.credits} - ${currentUserId} - ${Date.now()}`,
                }),
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                throw new Error(data.error || 'Failed to create payment');
            }

            setQrisData(data);
            setStep('qris');

            // Start polling for payment status
            startPolling(data.id, currentUserId);

            // Set expiry timer (6 minutes)
            expiryRef.current = setTimeout(() => {
                if (pollingRef.current) clearInterval(pollingRef.current);
                setStep('expired');
            }, 6 * 60 * 1000);

        } catch (err: unknown) {
            console.error('Create QRIS error:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
            setStep('error');
        }
    };

    const startPolling = (transactionId: string, currentUserId: string) => {
        // Poll every 3 seconds
        pollingRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/api/payment/status?id=${transactionId}`);
                const data = await res.json();

                if (data.paid === true) {
                    if (pollingRef.current) clearInterval(pollingRef.current);
                    if (expiryRef.current) clearTimeout(expiryRef.current);
                    setStep('success');

                    // Add credits to user
                    addCredits(pack.credits);

                    // Auto close after success
                    setTimeout(() => {
                        onSuccess();
                    }, 2000);
                } else if (data.expired === true) {
                    if (pollingRef.current) clearInterval(pollingRef.current);
                    setStep('expired');
                }
            } catch (err) {
                console.warn('Polling error:', err);
            }
        }, 3000);
    };

    const handleClose = () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (expiryRef.current) clearTimeout(expiryRef.current);
        onClose();
    };

    if (!isOpen) return null;

    const formattedPrice = new Intl.NumberFormat('id-ID').format(pack.price);

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="relative p-4 bg-gradient-to-b from-blue-500/20 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Coins className="text-blue-500" size={20} />
                        <h2 className="font-bold text-white">Beli {pack.credits} Kredit</h2>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 'loading' && (
                        <div className="text-center py-10">
                            <Loader2 className="h-12 w-12 mx-auto text-blue-500 animate-spin" />
                            <p className="text-gray-400 mt-4">Membuat pembayaran...</p>
                        </div>
                    )}

                    {step === 'qris' && qrisData && (
                        <div className="text-center">
                            {/* Price */}
                            <div className="mb-4">
                                <p className="text-gray-400 text-sm">Total Pembayaran</p>
                                <p className="text-3xl font-bold text-white">Rp {formattedPrice}</p>
                                <p className="text-xs text-gray-500 mt-1">{pack.label} - {pack.credits} Kredit</p>
                            </div>

                            {/* QR Code */}
                            <div className="bg-white p-4 rounded-xl inline-block mb-4">
                                {qrisData.qrisString ? (
                                    <img
                                        src={generateQRUrl(qrisData.qrisString)}
                                        alt="QRIS"
                                        className="w-48 h-48"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder-qr.png';
                                        }}
                                    />
                                ) : (
                                    <div className="w-48 h-48 flex items-center justify-center bg-gray-100">
                                        <Loader2 className="animate-spin text-gray-400" size={40} />
                                    </div>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="text-left bg-gray-900/50 rounded-lg p-4 text-sm space-y-2">
                                <p className="text-gray-300 font-medium">Cara Pembayaran:</p>
                                <ol className="text-gray-400 space-y-1 list-decimal list-inside">
                                    <li>Buka aplikasi e-wallet atau m-banking</li>
                                    <li>Scan QR code di atas</li>
                                    <li>Konfirmasi pembayaran Rp {formattedPrice}</li>
                                    <li>Tunggu verifikasi otomatis</li>
                                </ol>
                            </div>

                            {/* Status */}
                            <div className="mt-4 flex items-center justify-center gap-2 text-blue-500 text-sm">
                                <Loader2 size={16} className="animate-spin" />
                                <span>Menunggu pembayaran...</span>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-10">
                            <div className="h-16 w-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                                <CheckCircle className="text-green-500" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Pembayaran Berhasil!</h3>
                            <p className="text-gray-400 mt-2">+{pack.credits} kredit sudah ditambahkan</p>
                        </div>
                    )}

                    {step === 'expired' && (
                        <div className="text-center py-10">
                            <div className="h-16 w-16 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
                                <AlertCircle className="text-yellow-500" size={40} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Pembayaran Kedaluwarsa</h3>
                            <p className="text-gray-400 text-sm mt-2">QRIS sudah tidak berlaku</p>
                            <button
                                onClick={createQris}
                                className="mt-4 px-6 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-400 transition"
                            >
                                Buat QRIS Baru
                            </button>
                        </div>
                    )}

                    {step === 'error' && (
                        <div className="text-center py-10">
                            <div className="h-16 w-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                                <AlertCircle className="text-red-500" size={40} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Gagal Membuat Pembayaran</h3>
                            <p className="text-gray-400 text-sm mt-2">{error}</p>
                            <button
                                onClick={createQris}
                                className="mt-4 px-6 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-400 transition"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
