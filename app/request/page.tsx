"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, getAuthUser } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function RequestDramaPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!title.trim()) {
            setError('Judul drama wajib diisi');
            return;
        }

        setIsSubmitting(true);

        try {
            const user = await getAuthUser();
            if (!user) {
                setError('Silakan login terlebih dahulu');
                setIsSubmitting(false);
                return;
            }

            await addDoc(collection(db, 'drama_requests'), {
                userId: user.uid,
                title: title.trim(),
                description: description.trim(),
                status: 'pending', // pending, approved, rejected
                createdAt: serverTimestamp(),
            });

            setSuccess(true);
            setTitle('');
            setDescription('');
        } catch (err) {
            console.error(err);
            setError('Gagal mengirim permintaan. Coba lagi nanti.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-white/10"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Request Drama</h1>
            </div>

            <div className="max-w-md mx-auto space-y-6">
                <div className="bg-gradient-to-br from-amber-900/40 to-black p-6 rounded-2xl border border-amber-500/20">
                    <h2 className="text-lg font-semibold text-amber-500 mb-2">
                        Ingin Nonton Drama Apa?
                    </h2>
                    <p className="text-sm text-gray-400">
                        Beri tahu kami judul drama yang ingin kamu tonton, dan kami akan berusaha menyediakannya!
                    </p>
                </div>

                {success ? (
                    <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center space-y-3 animate-fade-in">
                        <div className="flex justify-center">
                            <CheckCircle size={48} className="text-green-500" />
                        </div>
                        <h3 className="text-lg font-bold text-green-500">Permintaan Terkirim!</h3>
                        <p className="text-sm text-gray-400">
                            Terima kasih atas masukanmu. Kami akan segera mengecek ketersediaan drama tersebut.
                        </p>
                        <button
                            onClick={() => setSuccess(false)}
                            className="text-sm text-green-400 hover:text-green-300 underline mt-2"
                        >
                            Request drama lain
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Judul Drama <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Contoh: The Double, Hidden Love..."
                                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Keterangan Tambahan (Opsional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tahun rilis, pemeran utama, atau link..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors resize-none"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/20">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Mengirim...' : (
                                <>
                                    <Send size={18} /> Kirim Request
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
