"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { db, getAuthUser } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp, increment } from 'firebase/firestore';

interface ReferralData {
    referralCode: string;
    referredBy: string | null;
    totalReferrals: number;
    totalEarnings: number;
    pendingEarnings: number;
    referralHistory: ReferralRecord[];
}

interface ReferralRecord {
    referredUserId: string;
    date: Date;
    commission: number;
    status: 'pending' | 'paid';
}

interface ReferralContextType {
    referralCode: string | null;
    referredBy: string | null;
    totalReferrals: number;
    totalEarnings: number;
    pendingEarnings: number;
    isLoading: boolean;
    applyReferralCode: (code: string) => Promise<{ success: boolean; message: string }>;
    getReferralLink: () => string;
    requestWithdrawal: (amount: number) => Promise<{ success: boolean; message: string }>;
}

const ReferralContext = createContext<ReferralContextType | null>(null);

const VIP_PRICE = 10000; // 10K
const COMMISSION_RATE = 0.30; // 30%
const COMMISSION_AMOUNT = VIP_PRICE * COMMISSION_RATE; // 3000

export function useReferral() {
    const context = useContext(ReferralContext);
    if (!context) {
        throw new Error('useReferral must be used within ReferralProvider');
    }
    return context;
}

interface ReferralProviderProps {
    children: ReactNode;
}

export function ReferralProvider({ children }: ReferralProviderProps) {
    const [referralCode, setReferralCode] = useState<string | null>(null);
    const [referredBy, setReferredBy] = useState<string | null>(null);
    const [totalReferrals, setTotalReferrals] = useState(0);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [pendingEarnings, setPendingEarnings] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Generate a unique referral ID from Firebase UID
    // Convert UID to a numeric-like string for Telegram deep link
    const generateReferralId = (uid: string): string => {
        // Create a deterministic numeric ID from UID
        let hash = 0;
        for (let i = 0; i < uid.length; i++) {
            const char = uid.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        // Make it positive and add timestamp suffix for uniqueness
        const positiveHash = Math.abs(hash);
        return `${positiveHash}${Date.now().toString().slice(-6)}`;
    };

    // Load referral data
    useEffect(() => {
        async function loadReferralData() {
            try {
                const user = await getAuthUser();
                if (!user) {
                    setIsLoading(false);
                    return;
                }

                setUserId(user.uid);

                const referralRef = doc(db, 'referrals', user.uid);
                const referralSnap = await getDoc(referralRef);

                if (referralSnap.exists()) {
                    const data = referralSnap.data();
                    setReferralCode(data.referralCode);
                    setReferredBy(data.referredBy || null);
                    setTotalReferrals(data.totalReferrals || 0);
                    setTotalEarnings(data.totalEarnings || 0);
                    setPendingEarnings(data.pendingEarnings || 0);
                } else {
                    // Create new referral record
                    const newCode = generateReferralId(user.uid);
                    await setDoc(referralRef, {
                        referralCode: newCode,
                        referredBy: null,
                        totalReferrals: 0,
                        totalEarnings: 0,
                        pendingEarnings: 0,
                        createdAt: serverTimestamp(),
                    });
                    setReferralCode(newCode);
                }

                // Check URL for referral code on first visit
                if (typeof window !== 'undefined') {
                    const urlParams = new URLSearchParams(window.location.search);
                    const refCode = urlParams.get('ref');
                    if (refCode && !referralSnap.exists()) {
                        // New user with referral code - apply it
                        await applyReferralCodeInternal(user.uid, refCode);
                    }
                }
            } catch (error) {
                console.error('Error loading referral data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadReferralData();
    }, []);

    // Internal function to apply referral code
    const applyReferralCodeInternal = async (currentUserId: string, code: string): Promise<{ success: boolean; message: string }> => {
        try {
            // Find the referrer by code
            const referralsRef = collection(db, 'referrals');
            const q = query(referralsRef, where('referralCode', '==', code.toUpperCase()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return { success: false, message: 'Kode referral tidak ditemukan' };
            }

            const referrerDoc = querySnapshot.docs[0];
            const referrerId = referrerDoc.id;

            // Prevent self-referral
            if (referrerId === currentUserId) {
                return { success: false, message: 'Tidak bisa menggunakan kode referral sendiri' };
            }

            // Check if already referred
            const userReferralRef = doc(db, 'referrals', currentUserId);
            const userReferralSnap = await getDoc(userReferralRef);

            if (userReferralSnap.exists() && userReferralSnap.data().referredBy) {
                return { success: false, message: 'Anda sudah menggunakan kode referral sebelumnya' };
            }

            // Apply referral
            await updateDoc(userReferralRef, {
                referredBy: referrerId,
                referredByCode: code.toUpperCase(),
                referredAt: serverTimestamp(),
            });

            setReferredBy(referrerId);

            return { success: true, message: 'Kode referral berhasil diterapkan!' };
        } catch (error) {
            console.error('Error applying referral code:', error);
            return { success: false, message: 'Gagal menerapkan kode referral' };
        }
    };

    // Public function to apply referral code
    const applyReferralCode = useCallback(async (code: string): Promise<{ success: boolean; message: string }> => {
        if (!userId) {
            return { success: false, message: 'Silakan login terlebih dahulu' };
        }

        if (referredBy) {
            return { success: false, message: 'Anda sudah menggunakan kode referral sebelumnya' };
        }

        return applyReferralCodeInternal(userId, code);
    }, [userId, referredBy]);

    // Get shareable referral link (Telegram bot deep link)
    const getReferralLink = useCallback((): string => {
        const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'dracinaja_bot';
        return referralCode ? `https://t.me/${botUsername}?start=ref${referralCode}` : `https://t.me/${botUsername}`;
    }, [referralCode]);

    // Request withdrawal of pending earnings
    const requestWithdrawal = useCallback(async (amount: number): Promise<{ success: boolean; message: string }> => {
        if (!userId) {
            return { success: false, message: 'User tidak ditemukan' };
        }

        if (amount < 10000) {
            return { success: false, message: 'Minimum penarikan Rp10.000' };
        }

        if (amount > pendingEarnings) {
            return { success: false, message: 'Saldo tidak mencukupi' };
        }

        try {
            // Create withdrawal request document
            const withdrawalRef = doc(collection(db, 'withdrawal_requests'));
            await setDoc(withdrawalRef, {
                userId,
                amount,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            // Deduct from pending earnings
            const referralRef = doc(db, 'referrals', userId);
            await updateDoc(referralRef, {
                pendingEarnings: increment(-amount),
            });

            // Update local state
            setPendingEarnings(prev => prev - amount);

            return { success: true, message: 'Permintaan penarikan berhasil! Admin akan memproses dalam 1-3 hari kerja.' };
        } catch (error) {
            console.error('Error requesting withdrawal:', error);
            return { success: false, message: 'Gagal memproses penarikan' };
        }
    }, [userId, pendingEarnings]);

    return (
        <ReferralContext.Provider value={{
            referralCode,
            referredBy,
            totalReferrals,
            totalEarnings,
            pendingEarnings,
            isLoading,
            applyReferralCode,
            getReferralLink,
            requestWithdrawal,
        }}>
            {children}
        </ReferralContext.Provider>
    );
}

/**
 * Called when a VIP purchase is completed - credits commission to referrer
 * This should be called from the payment success handler
 */
export async function processReferralCommission(buyerUserId: string): Promise<void> {
    try {
        // Get buyer's referral data
        const buyerReferralRef = doc(db, 'referrals', buyerUserId);
        const buyerReferralSnap = await getDoc(buyerReferralRef);

        if (!buyerReferralSnap.exists()) return;

        const referrerId = buyerReferralSnap.data().referredBy;
        if (!referrerId) return; // No referrer

        // Check if this is the buyer's first VIP purchase (anti-abuse)
        const purchaseTrackRef = doc(db, 'referral_purchases', `${buyerUserId}_first_vip`);
        const purchaseTrackSnap = await getDoc(purchaseTrackRef);

        if (purchaseTrackSnap.exists()) {
            // Already credited commission for this user's first purchase
            console.log('Commission already credited for this user');
            return;
        }

        // Credit commission to referrer
        const referrerRef = doc(db, 'referrals', referrerId);
        await updateDoc(referrerRef, {
            totalReferrals: increment(1),
            pendingEarnings: increment(COMMISSION_AMOUNT),
            totalEarnings: increment(COMMISSION_AMOUNT),
        });

        // Record the referral transaction
        const transactionRef = doc(collection(db, 'referral_transactions'));
        await setDoc(transactionRef, {
            referrerId,
            referredUserId: buyerUserId,
            commission: COMMISSION_AMOUNT,
            status: 'pending',
            createdAt: serverTimestamp(),
        });

        // Mark first purchase as processed (anti-abuse)
        await setDoc(purchaseTrackRef, {
            processed: true,
            processedAt: serverTimestamp(),
            referrerId,
            commission: COMMISSION_AMOUNT,
        });

        console.log(`Commission ${COMMISSION_AMOUNT} credited to referrer ${referrerId}`);
    } catch (error) {
        console.error('Error processing referral commission:', error);
    }
}
