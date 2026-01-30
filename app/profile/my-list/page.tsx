"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, getAuthUser } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { ArrowLeft, Loader2, BookmarkX } from 'lucide-react';
import { DramaCard } from '@/components/DramaCard';

export default function MyListPage() {
    const router = useRouter();
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadBookmarks();
    }, []);

    const loadBookmarks = async () => {
        try {
            const user = await getAuthUser();
            if (!user) {
                router.push('/login'); // Or handle auth state
                return;
            }

            const bookmarksRef = collection(db, 'users', user.uid, 'bookmarks');
            const q = query(bookmarksRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const list = snapshot.docs.map(doc => {
                const data = doc.data();
                // Map to DramaCard format
                return {
                    bookId: data.dramaId,
                    bookName: data.title,
                    coverWap: data.cover,
                    // mocked other fields if necessary
                };
            });

            setBookmarks(list);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-10 py-2">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-white/10"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Daftar Tontonan Saya</h1>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-amber-500" size={32} />
                </div>
            ) : bookmarks.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {bookmarks.map((drama) => (
                        <DramaCard key={drama.bookId} drama={drama} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-4">
                    <BookmarkX size={48} className="opacity-50" />
                    <p>Belum ada drama yang disimpan.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-sm hover:bg-white/10"
                    >
                        Cari Drama
                    </button>
                </div>
            )}
        </div>
    );
}
