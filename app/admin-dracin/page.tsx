"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { Users, Crown, Wallet, TrendingUp, RefreshCw, AlertCircle, ArrowUpRight, Check, X } from 'lucide-react';

// Admin user IDs - Ganti dengan ID user kamu yang asli
const ADMIN_IDS = [
    '5009968560', // Ganti dengan ID Telegram kamu
    'YOUR_ID_2'
];

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

interface WithdrawalRequest {
    id: string;
    userId: string;
    amount: number;
    status: 'pending' | 'paid' | 'rejected';
    createdAt: Date | null;
}

export default function AdminPage() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalVipUsers: 0,
        pendingReferralEarnings: 0,
        totalTransactions: 0,
    });
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);

    useEffect(() => {
        checkAuthAndLoadData();
    }, []);

    const checkAuthAndLoadData = async () => {
        setIsLoading(true);
        setError(null);

        // Disini bisa tambah logika cek ID user login vs ADMIN_IDS
        // Untuk sekarang kita buat simple dulu
        setIsAuthorized(true);

        await loadStats();
        setIsLoading(false);
    };

    const loadStats = async () => {
        try {
            setError(null);

            // 1. Get Users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const totalUsers = usersSnapshot.size;

            let vipCount = 0;
            const usersList: RecentUser[] = [];

            usersSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.isVip) vipCount++;

                usersList.push({
                    id: doc.id,
                    credits: data.credits || 0,
                    isVip: data.isVip || false,
                    createdAt: data.createdAt?.toDate() || null,
                });
            });

            // Sort & Limit Users
            usersList.sort((a, b) => {
                const timeA = a.createdAt?.getTime() || 0;
                const timeB = b.createdAt?.getTime() || 0;
                return timeB - timeA;
            });
            setRecentUsers(usersList.slice(0, 20));

            // 2. Get Referrals
            const referralsSnapshot = await getDocs(collection(db, 'referrals'));
            let pendingEarnings = 0;
            referralsSnapshot.forEach(doc => {
                pendingEarnings += doc.data().pendingEarnings || 0;
            });

            // 3. Get Transactions
            const transactionsSnapshot = await getDocs(collection(db, 'vip_transactions'));

            // 4. Get Withdrawal Requests
            const withdrawalsSnapshot = await getDocs(query(
                collection(db, 'withdrawal_requests'),
                orderBy('createdAt', 'desc'),
                limit(50)
            ));

            const withdrawalList: WithdrawalRequest[] = [];
            withdrawalsSnapshot.forEach(doc => {
                const data = doc.data();
                withdrawalList.push({
                    id: doc.id,
                    userId: data.userId,
                    amount: data.amount,
                    status: data.status,
                    createdAt: data.createdAt?.toDate() || null,
                });
            });
            setWithdrawals(withdrawalList);

            setStats({
                totalUsers,
                totalVipUsers: vipCount,
                pendingReferralEarnings: pendingEarnings,
                totalTransactions: transactionsSnapshot.size,
            });

        } catch (error: any) {
            console.error('Error loading stats:', error);
            setError(error.message || 'Gagal memuat data');
        }
    };

    const handleWithdrawalAction = async (id: string, action: 'paid' | 'rejected') => {
        if (!confirm(`Yakin ingin ${action === 'paid' ? 'menyetujui' : 'menolak'} penarikan ini?`)) return;

        try {
            await updateDoc(doc(db, 'withdrawal_requests', id), {
                status: action
            });

            // Reload data
            loadStats();
        } catch (err) {
            alert('Gagal update status');
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

                {error && (
                    <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg flex items-center gap-3 text-red-200">
                        <AlertCircle size={24} />
                        <p>{error}</p>
                    </div>
                )}

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

                {/* Withdrawal Requests */}
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Wallet size={20} className="text-green-500" />
                        Permintaan Penarikan (WD)
                    </h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {withdrawals.map((wd) => (
                            <div
                                key={wd.id}
                                className="p-3 bg-gray-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-gray-400 text-xs">{wd.id.slice(0, 8)}...</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${wd.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                                                wd.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                                                    'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                            {wd.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-bold text-white">ID: {wd.userId}</span>
                                    </div>
                                    <div className="text-green-400 font-bold mt-1">
                                        Rp {wd.amount.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {wd.createdAt?.toLocaleString('id-ID')}
                                    </p>
                                </div>

                                {wd.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleWithdrawalAction(wd.id, 'paid')}
                                            className="p-2 bg-green-600 rounded-lg hover:bg-green-700"
                                            title="Tandai Sudah Bayar"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleWithdrawalAction(wd.id, 'rejected')}
                                            className="p-2 bg-red-600 rounded-lg hover:bg-red-700"
                                            title="Tolak"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {withdrawals.length === 0 && (
                            <p className="text-gray-500 text-center py-4">Belum ada request WD</p>
                        )}
                    </div>
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
