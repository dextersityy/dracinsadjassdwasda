import * as admin from 'firebase-admin';

export interface User {
    telegramId: string;
    credits: number;
    isVip: boolean;
    vipExpiry: admin.firestore.Timestamp | null;
    referralCode: string;
    referredBy?: string;
    walletBalance: number;
}

export interface Transaction {
    id: string;
    userId: string;
    amount: number;
    type: 'VIP_PURCHASE' | 'REFERRAL_COMMISSION';
    timestamp: admin.firestore.Timestamp;
}

export interface Drama {
    bookId: string;
    bookName: string;
    coverWap: string;
    introduction?: string;
    tags?: string[];
    protagonist?: string;
    source?: 'dramabox' | 'reelshort';
}

export interface Episode {
    chapterId: string;
    chapterName: string;
    isCharge: number; // 1 = Locked, 0 = Free
    videoUrl: string; // Extracted locally
}
