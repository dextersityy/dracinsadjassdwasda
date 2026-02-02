"use client";

import { useState, useEffect } from 'react';
import { getPopularSearch, searchDramas } from '@/lib/public-api';
import { Drama } from '@/types';
import { DramaCard } from '@/components/DramaCard';
import { Search as SearchIcon, TrendingUp, X } from 'lucide-react';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [popularTags, setPopularTags] = useState<Drama[]>([]);
    const [results, setResults] = useState<Drama[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Fetch popular searches on mount
    useEffect(() => {
        getPopularSearch().then(setPopularTags);
    }, []);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);
        return () => clearTimeout(handler);
    }, [query]);

    // Perform search
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        searchDramas(debouncedQuery).then((data) => {
            setResults(data);
            setIsSearching(false);
        });
    }, [debouncedQuery]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
            {/* Search Header */}
            <div className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md p-4">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search dramas, genre, cast..."
                        className="w-full h-12 rounded-xl bg-gray-900 border border-white/10 pl-12 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition"
                        autoFocus
                    />
                    <SearchIcon className="absolute left-4 top-3.5 text-gray-500" size={20} />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4">
                {/* Results */}
                {query ? (
                    <div>
                        <h2 className="mb-4 text-sm font-semibold text-gray-400">
                            {isSearching ? 'Searching...' : `Results for "${query}"`}
                        </h2>
                        <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 gap-3">
                            {results.map((drama) => (
                                <DramaCard key={drama.bookId} drama={drama} />
                            ))}
                            {!isSearching && results.length === 0 && (
                                <div className="col-span-full py-10 text-center text-gray-500">
                                    No results found.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Popular / Trending Tags */
                    <div>
                        <div className="mb-4 flex items-center gap-2 text-amber-500">
                            <TrendingUp size={18} />
                            <h2 className="font-bold">Trending Searches</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {popularTags.map((tag) => (
                                <button
                                    key={tag.bookId}
                                    onClick={() => setQuery(tag.bookName)}
                                    className="px-4 py-2 rounded-full bg-gray-900 border border-white/5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
                                >
                                    {tag.bookName}
                                </button>
                            ))}
                        </div>

                        {/* Suggestion List via tags from popular items could go here */}
                    </div>
                )}
            </div>
        </div>
    );
}
