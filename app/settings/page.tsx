"use client";

import { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Monitor, Check, Shield } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useCredits } from '@/contexts/CreditContext';

// Ganti dengan ID user kamu yang asli
const ADMIN_IDS = [
    '7559161536', // Ganti dengan ID Telegram kamu
];

// Type declaration for Telegram WebApp
declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initDataUnsafe?: {
                    user?: {
                        id?: number;
                    };
                };
            };
        };
    }
}

export default function SettingsPage() {
    const { theme, resolution, setTheme, setResolution } = useSettings();
    const { isVip } = useCredits();
    const [telegramId, setTelegramId] = useState<string | null>(null);

    // Get Telegram ID on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
            setTelegramId(window.Telegram.WebApp.initDataUnsafe.user.id.toString());
        }
    }, []);

    type Resolution = '480p' | '720p' | '1080p';

    const resolutionOptions: { value: Resolution; label: string; description: string; vipOnly?: boolean }[] = [
        { value: '480p', label: '480p', description: 'Hemat data', vipOnly: false },
        { value: '720p', label: '720p HD', description: 'Rekomendasi', vipOnly: false },
        { value: '1080p', label: '1080p Full HD', description: 'VIP Only', vipOnly: true },
    ];

    // Check if current user is admin by Telegram ID
    const isAdmin = telegramId && ADMIN_IDS.includes(telegramId);

    return (
        <div className="min-h-screen pb-24 pt-4 px-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                    <Settings className="w-6 h-6 text-amber-500" />
                </div>
                <h1 className="text-2xl font-bold">Pengaturan</h1>
            </div>

            {/* Admin Panel (Hidden) */}
            {isAdmin && (
                <section className="mb-6">
                    <div className="glass-card rounded-2xl p-1 bg-gradient-to-r from-red-900/40 to-red-800/40 border border-red-500/30">
                        <a
                            href="/admin-dracin"
                            className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition"
                        >
                            <Shield className="w-5 h-5 text-red-500" />
                            <div className="text-left flex-1">
                                <p className="font-bold text-red-400">Admin Panel</p>
                                <p className="text-xs text-gray-500">Akses Khusus Admin</p>
                            </div>
                            <Settings className="w-4 h-4 text-red-400 opacity-50" />
                        </a>
                    </div>
                </section>
            )}

            {/* Theme Section */}
            <section className="mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-300">Tema</h2>
                <div className="glass-card rounded-2xl p-4">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setTheme('dark')}
                            className={`flex items-center gap-3 p-4 rounded-xl transition-all ${theme === 'dark'
                                ? 'bg-amber-500/20 border-2 border-amber-500'
                                : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                                }`}
                        >
                            <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-amber-500' : 'text-gray-400'}`} />
                            <div className="text-left">
                                <p className="font-medium">Gelap</p>
                                <p className="text-xs text-gray-500">Default</p>
                            </div>
                        </button>
                        <button
                            onClick={() => setTheme('light')}
                            className={`flex items-center gap-3 p-4 rounded-xl transition-all ${theme === 'light'
                                ? 'bg-amber-500/20 border-2 border-amber-500'
                                : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                                }`}
                        >
                            <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-amber-500' : 'text-gray-400'}`} />
                            <div className="text-left">
                                <p className="font-medium">Cerah</p>
                            </div>
                        </button>
                    </div>
                </div>
            </section>

            {/* Resolution Section */}
            <section className="mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-300">Resolusi Video</h2>
                <div className="glass-card rounded-2xl p-4">
                    <div className="space-y-3">
                        {resolutionOptions.map((option) => {
                            const isDisabled = option.vipOnly && !isVip;
                            const isSelected = resolution === option.value;

                            return (
                                <button
                                    key={option.value}
                                    onClick={() => !isDisabled && setResolution(option.value)}
                                    disabled={isDisabled}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${isSelected
                                        ? 'bg-amber-500/20 border-2 border-amber-500'
                                        : isDisabled
                                            ? 'bg-white/5 border-2 border-transparent opacity-50 cursor-not-allowed'
                                            : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Monitor className={`w-5 h-5 ${isSelected ? 'text-amber-500' : 'text-gray-400'}`} />
                                        <div className="text-left">
                                            <p className="font-medium">{option.label}</p>
                                            <p className="text-xs text-gray-500">{option.description}</p>
                                        </div>
                                    </div>
                                    {option.vipOnly && !isVip && (
                                        <span className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium">
                                            VIP
                                        </span>
                                    )}
                                    {isSelected && (
                                        <Check className="w-5 h-5 text-amber-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* App Info */}
            <section>
                <div className="glass-card rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">DracinAja</p>
                            <p className="text-sm text-gray-500">Versi 1.0.0</p>
                        </div>
                        {isVip && (
                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm font-bold">
                                VIP
                            </span>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
