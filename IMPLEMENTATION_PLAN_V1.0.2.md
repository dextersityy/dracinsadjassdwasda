# Roadmap Update v1.0.2 - DracinAja (Internal Only)

> **⚠️ RAHASIA:** Dokumen ini bersifat internal untuk pengembangan. Informasi mengenai teknis database dan identitas user tidak untuk dipublikasikan ke log update publik.

Fokus utama versi 1.0.2 adalah meningkatkan manajemen data user di Firebase agar lebih mudah dipantau (human-readable) dan mempersiapkan fondasi migrasi database di masa depan.

## 1. Explicit Identity Logging (Telegram ID)
Masalah saat ini adalah ID dokumen di Firestore menggunakan Firebase UID random (`abc123xyz`), sehingga menyulitkan admin untuk mencari user berdasarkan Telegram ID di Firebase Console.

- **Objective:** Menyertakan Telegram ID dan Metadata di setiap dokumen kunci.
- **Fields yang akan ditambahkan:**
    - `telegramId`: (Number/String) ID asli dari Telegram.
    - `telegramUsername`: (String) Username @user (jika ada).
    - `telegramFirstName`: (String) Nama depan user.
- **Target Collections:**
    - `users`: Sebagai field pencarian utama.
    - `withdrawal_requests`: Agar admin langsung tahu siapa yang meminta penarikan tanpa cek silang.
    - `referrals`: Menghubungkan ID referral dengan identitas asli.
    - `transactions`: Log pembayaran VIP/Credit.

## 2. Refactoring User Service (`lib/user-service.ts`)
Memperbarui logika pembuatan user baru agar tidak hanya mengandalkan Firebase Auth UID.

- **Logic Update:**
    - Fungsi `createUser` akan mengambil context dari `window.Telegram.WebApp` untuk mengisi metadata identitas.
    - Menambahkan fungsi helper `findUserByTelegramId(telId)` untuk keperluan debugging backend.
    - Memastikan `updatedAt` selalu diperbarui setiap user melakukan interaksi kunci.

## 3. Referral & Withdrawal Tracking Improvement
Meningkatkan transparansi data di dalam sistem referral.

- **Withdrawal Metadata:** Setiap request WD akan mencatat Snapshot identitas user saat itu.
- **Commission Logs:** Menambahkan field `buyerTelegramId` pada koleksi `referral_transactions` agar referrer bisa melihat (secara anonim atau parsial) siapa "anak" mereka yang melakukan pembelian.

## 4. Admin Dashboard Polish (v2)
Update pada halaman `/admin-dracin` untuk mempermudah operasional harian.

- **User Search:** Fitur pencarian user berdasarkan Telegram ID di dashboard admin.
- **Quick Action:** Tombol "Hubungi di Telegram" (link `t.me/username`) pada setiap baris data user/withdrawal.
- **Status Badge:** Visualisasi status transaksi yang lebih jelas (Glowing badges untuk 'Pending').

## 5. Fondasi Migrasi (Sql-Ready Design)
Walaupun tetap menggunakan Firebase (selama kuota gratis masih ada), struktur data akan mulai disesuaikan agar mirip dengan tabel SQL (PostgreSQL).

- **Normalized Data:** Menghindari penyimpanan data yang terlalu "nested".
- **Strict Typing:** Menggunakan interface TypeScript yang lebih ketat agar saat pindah ke Prisma/Postgres nanti tidak banyak error tipe data.

---
*Status: Draft dikunci untuk pengembangan fase v1.0.2.*
