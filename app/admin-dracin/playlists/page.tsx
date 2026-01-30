"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, List } from 'lucide-react';

interface Playlist {
    id: string;
    title: string;
    description: string;
    dramas: PlaylistItem[];
    createdAt: Date;
}

interface PlaylistItem {
    bookId: string;
    bookName?: string; // Optional, maybe fetched later
    provider?: string;
}

export default function AdminPlaylistsPage() {
    const router = useRouter();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null); // ID of playlist being edited
    const [showCreate, setShowCreate] = useState(false);

    // Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [itemsString, setItemsString] = useState(''); // JSON or comma separated? Let's use simple line based: ID, PROVIDER

    useEffect(() => {
        loadPlaylists();
    }, []);

    const loadPlaylists = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, 'playlists'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            })) as Playlist[];
            setPlaylists(list);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'playlists'), {
                title,
                description,
                dramas: [], // Start empty
                createdAt: serverTimestamp(),
            });
            setShowCreate(false);
            setTitle('');
            setDescription('');
            loadPlaylists();
        } catch (error) {
            alert('Gagal membuat playlist');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus playlist ini?')) return;
        try {
            await deleteDoc(doc(db, 'playlists', id));
            loadPlaylists();
        } catch (error) {
            alert('Gagal menghapus');
        }
    };

    const startEdit = (p: Playlist) => {
        setIsEditing(p.id);
        setTitle(p.title);
        setDescription(p.description);
        // Format dramas as "bookId|provider" per line for easy editing
        const formatted = p.dramas.map(d => `${d.bookId}`).join('\n');
        setItemsString(formatted);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEditing) return;

        try {
            // Parse items
            const newDramas: PlaylistItem[] = itemsString.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => {
                    // Simple just ID for now, provider default
                    return { bookId: line };
                });

            await updateDoc(doc(db, 'playlists', isEditing), {
                title,
                description,
                dramas: newDramas,
                updatedAt: serverTimestamp(),
            });

            setIsEditing(null);
            loadPlaylists();
        } catch (error) {
            alert('Gagal update playlist');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-white/10"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <List /> Kelola Playlist
                </h1>
            </div>

            {/* Create Button */}
            {!showCreate && !isEditing && (
                <button
                    onClick={() => setShowCreate(true)}
                    className="mb-6 px-4 py-2 bg-amber-600 rounded-lg font-bold flex items-center gap-2 hover:bg-amber-700"
                >
                    <Plus size={20} /> Buat Playlist Baru
                </button>
            )}

            {/* Create/Edit Form */}
            {(showCreate || isEditing) && (
                <div className="mb-8 p-4 bg-gray-900 rounded-xl border border-gray-800">
                    <h2 className="text-lg font-bold mb-4">{isEditing ? 'Edit Playlist' : 'Playlist Baru'}</h2>
                    <form onSubmit={isEditing ? handleUpdate : handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Judul Playlist</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-black border border-white/20 rounded p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Deskripsi</label>
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-black border border-white/20 rounded p-2"
                            />
                        </div>

                        {isEditing && (
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Daftar Drama (Satu ID per baris)</label>
                                <textarea
                                    value={itemsString}
                                    onChange={e => setItemsString(e.target.value)}
                                    className="w-full bg-black border border-white/20 rounded p-2 h-40 font-mono text-sm"
                                    placeholder="taruh_drama_id_disini"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Masukkan `bookId` saja. Provider otomatis handled nanti.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button type="submit" className="px-4 py-2 bg-green-600 rounded flex items-center gap-2">
                                <Save size={18} /> Simpan
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowCreate(false); setIsEditing(null); }}
                                className="px-4 py-2 bg-gray-700 rounded flex items-center gap-2"
                            >
                                <X size={18} /> Batal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="grid gap-4">
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    playlists.map(p => (
                        <div key={p.id} className="p-4 bg-gray-900 rounded-xl border border-white/5 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg">{p.title}</h3>
                                <p className="text-gray-400 text-sm">{p.description}</p>
                                <p className="text-amber-500 text-xs mt-2 font-mono">
                                    {p.dramas?.length || 0} Drama
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => startEdit(p)}
                                    className="p-2 bg-blue-600/20 text-blue-500 rounded hover:bg-blue-600/40"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(p.id)}
                                    className="p-2 bg-red-600/20 text-red-500 rounded hover:bg-red-600/40"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
