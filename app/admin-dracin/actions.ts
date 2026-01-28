'use server';

import { db } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export async function approveWithdrawal(withdrawalId: string) {
    try {
        const withdrawalRef = db.collection('withdrawal_requests').doc(withdrawalId);
        const withdrawalSnap = await withdrawalRef.get();

        if (!withdrawalSnap.exists) {
            return { success: false, message: 'Permintaan tidak ditemukan' };
        }

        const data = withdrawalSnap.data();
        if (!data) return { success: false, message: 'Data korup' };

        // 1. Update status to paid
        await withdrawalRef.update({
            status: 'paid',
            paidAt: new Date(), // Use JS Date for Firestore Admin
        });

        // 2. Send Telegram Notification
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const telegramId = data.telegramId;
        // Note: We recorded 'telegramId' in ReferralContext.tsx 
        // If older request, it might use 'email' or missing. Handle correctly.

        if (botToken && telegramId) {
            const message = `✅ *PENARIKAN BERHASIL*\n\n` +
                `Halo ${data.telegramUsername ? '@' + data.telegramUsername : 'Kak'}! 👋\n` +
                `Permintaan penarikan saldo Anda telah kami proses.\n\n` +
                `💰 *Nominal:* Rp${data.amount?.toLocaleString('id-ID')}\n` +
                `🏦 *Tujuan:* ${data.paymentDetails?.bankName} - ${data.paymentDetails?.accountNumber}\n` +
                `👤 *A.N:* ${data.paymentDetails?.accountHolder}\n\n` +
                `Terima kasih telah bergabung dengan program referral DracinAja!`;

            try {
                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: telegramId,
                        text: message,
                        parse_mode: 'Markdown',
                    }),
                });
            } catch (err) {
                console.error('Failed to send Telegram message:', err);
                // Don't fail the whole action just because notification failed
            }
        }

        revalidatePath('/admin-dracin');
        return { success: true, message: 'Berhasil disetujui' };
    } catch (error) {
        console.error('Error approving withdrawal:', error);
        return { success: false, message: 'Gagal memproses persetujuan' };
    }
}
