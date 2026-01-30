# Roadmap Update v1.0.3 - DracinAja (Engagement & Identity)

Dokumen ini merangkum rencana pengembangan fitur untuk versi 1.0.3. Fokus utamanya adalah menggabungkan peningkatan manajemen identitas user (Internal) dengan fitur interaksi sosial (User-facing).

## 1. Identity & Data Management (Internal Improvement)
Meningkatkan kemudahan manajemen user di Firebase Console agar lebih "human-readable".

- **Explicit Telegram ID Logging:** Menambahkan field `telegramId`, `telegramUsername`, dan `telegramFirstName` ke setiap dokumen utama (`users`, `withdrawals`, `transactions`).
- **User Search & Admin Tools:** Update dashboard `/admin-dracin` untuk mendukung pencarian berdasarkan Telegram ID dan tombol aksi cepat "Hubungi User".
- **Refactoring User Service:** Memastikan setiap interaksi kunci (login/request) mencatat metadata identitas yang paling fresh dari Telegram WebApp.
- **Backward Compatibility:** Update identitas akan bersifat *additive* (menambah field baru tanpa menghapus data lama). User lama akan otomatis terupdate saat mereka membuka aplikasi kembali.

## 2. Social Engagement Features
Fitur interaksi untuk meningkatkan waktu kunjung user (stickiness).

- **Like & Bookmark (My List):**
    - User bisa menyukai drama dan menyimpannya ke koleksi pribadi ("Daftar Tontonan saya").
    - Tab baru di Profil untuk akses cepat ke drama yang sudah ditandai.
- **Real-time Social Proof:**
    - Indikator live: *"X orang sedang menonton drama ini"* di halaman player.
    - Menambah kepercayaan user bahwa aplikasi ramai dan aktif.

## 3. Growth & Feedback
Mendorong pertumbuhan organik dan mendengarkan kebutuhan user.


- **User Request System:**
    - Form permintaan drama baru bagi user.
    - Notifikasi otomatis lewat bot jika drama pesanan sudah tersedia.

## 4. Discovery Enhancements
- **Thematic Playlists:** Daftar drama pilihan admin (contoh: "CEO Obsessed Collection") yang menggabungkan konten dari berbagai provider (Dramabox & Reelshort).
    - **Admin Panel Integration:** Bisa dibuat langsung dari dashboard admin dengan memasukkan `bookId` dan `provider` secara manual agar API tidak bingung saat fetch data.

---
*Status: Roadmap gabungan v1.0.3 telah dikunci. Siap eksekusi.*
