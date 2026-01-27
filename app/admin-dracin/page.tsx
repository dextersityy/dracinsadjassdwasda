"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { Users, Crown, Wallet, TrendingUp, RefreshCw } from 'lucide-react';

// Admin user IDs - add your Telegram ID or Firebase UID here
const ADMIN_IDS = ['YOUR_ADMIN_ID_HERE'];

interface Stats {
    totalUsers: number;
    totalVipUsers: number;
    pendingReferralEarnings: number;
    totalTransactions: number;
}

interface RecentUser {
    id: string;
    credits: number;
    isVip: boolean;
    createdAt: Date | null;
}

export default function AdminPage() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalVipUsers: 0,
        pendingReferralEarnings: 0,
        totalTransactions: 0,
    });
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

    useEffect(() => {
        // Check authorization and load data
        checkAuthAndLoadData();
    }, []);

    const checkAuthAndLoadData = async () => {
        setIsLoading(true);

        // For now, allow access (you can add proper auth later)
        // In production, check if current user ID is in ADMIN_IDS
        setIsAuthorized(true);

        await loadStats();
        setIsLoading(false);
    };

    const loadStats = async () => {
        try {
            // Get total users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const totalUsers = usersSnapshot.size;

            // Count VIP users
            let vipCount = 0;
            usersSnapshot.forEach(doc => {
                if (doc.data().isVip) vipCount++;
            });

            // Get pending referral earnings
            const referralsSnapshot = await getDocs(collection(db, 'referrals'));
            let pendingEarnings = 0;
            referralsSnapshot.forEach(doc => {
                pendingEarnings += doc.data().pendingEarnings || 0;
            });

            // Get transactions count
            const transactionsSnapshot = await getDocs(collection(db, 'vip_transactions'));

            setStats({
                totalUsers,
                totalVipUsers: vipCount,
                pendingReferralEarnings: pendingEarnings,
                totalTransactions: transactionsSnapshot.size,
            });

            // Get recent users
            const users: RecentUser[] = [];
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                users.push({
                    id: doc.id.slice(0, 12) + '...',
                    credits: data.credits || 0,
                    isVip: data.isVip || false,
                    createdAt: data.createdAt?.toDate() || null,
                });
            });

            // Sort by newest first (those with createdAt)
            users.sort((a, b) => {
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return b.createdAt.getTime() - a.createdAt.getTime();
            });

            setRecentUsers(users.slice(0, 20));

        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <RefreshCw className="animate-spin text-amber-500" size={32} />
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <p>⛔ Akses Ditolak</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-amber-500">🔐 Admin Panel</h1>
                    <button
                        onClick={loadStats}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <StatCard
                        icon={<Users size={24} />}
                        label="Total Users"
                        value={stats.totalUsers}
                        color="blue"
                    />
                    <StatCard
                        icon={<Crown size={24} />}
                        label="VIP Users"
                        value={stats.totalVipUsers}
                        color="amber"
                    />
                    <StatCard
                        icon={<Wallet size={24} />}
                        label="Pending Referral"
                        value={`Rp ${stats.pendingReferralEarnings.toLocaleString()}`}
                        color="green"
                    />
                    <StatCard
                        icon={<TrendingUp size={24} />}
                        label="Total Transaksi"
                        value={stats.totalTransactions}
                        color="purple"
                    />
                </div>

                {/* Recent Users */}
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                    <h2 className="text-lg font-bold mb-4">📋 Recent Users</h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {recentUsers.map((user, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    {user.isVip && <Crown size={14} className="text-amber-500" />}
                                    <span className="font-mono text-gray-400">{user.id}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-blue-400">{user.credits} kredit</span>
                                    {user.createdAt && (
                                        <span className="text-gray-500 text-xs">
                                            {user.createdAt.toLocaleDateString('id-ID')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {recentUsers.length === 0 && (
                            <p className="text-gray-500 text-center py-4">Belum ada user</p>
                        )}
                    </div>
                </div>

                {/* Quick Info */}
                <div className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-800 text-sm text-gray-400">
                    <p>💡 <strong>Tips:</strong></p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Halaman ini hanya menampilkan data overview</li>
                        <li>Untuk data detail, buka Firebase Console</li>
                        <li>Klik tombol refresh untuk update data</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: 'blue' | 'amber' | 'green' | 'purple';
}) {
    const colorClasses = {
        blue: 'from-blue-600 to-cyan-600',
        amber: 'from-amber-600 to-orange-600',
        green: 'from-green-600 to-emerald-600',
        purple: 'from-purple-600 to-pink-600',
    };

    return (
        <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white`}>
            <div className="flex items-center gap-2 mb-2 opacity-80">
                {icon}
                <span className="text-sm">{label}</span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
}
