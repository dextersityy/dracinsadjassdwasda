"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User } from 'lucide-react';
import clsx from 'clsx';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/profile', icon: User, label: 'Profile' },
    ];

    // Hide on detail pages if desired, or keep it. 
    // Often hidden on video player pages to maximize screen.
    if (pathname.startsWith('/drama/')) return null;

    return (
        <div className="fixed bottom-0 z-50 w-full glass-panel border-t border-white/10 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center justify-center w-full h-full transition-colors",
                                isActive ? "text-amber-500" : "text-gray-500 hover:text-gray-300"
                            )}
                        >
                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
