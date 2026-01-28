# Roadmap Update v1.0.1 - DracinAja

Dokumen ini merangkum rencana pengembangan fitur untuk versi 1.0.1 dengan fokus pada eksplorasi konten yang lebih luas dan navigasi yang lebih baik.

## 1. Home Page v2 (Dual Tab System)
Mengubah struktur Home Page untuk memberikan variasi konten kepada pengguna.

- **Tab: For You**
    - Menggunakan algoritma "Shuffle & Mix" dari berbagai API.
    - Menampilkan drama populer dan rekomendasi acak.
- **Tab: Terbaru**
    - **Unified Feed:** Menggabungkan data terbaru dari Dramabox API dan **Reelshort API** (`/reelshort/homepage`).
    - **Sorting:** Diurutkan berdasarkan tanggal rilis/update terbaru secara kolektif.
- **Interaksi:**
    - Mendukung navigasi tombol di bagian atas.
    - Mendukung gestur **Swipe (Geser)** antar tab untuk pengalaman mobile yang lebih native.

## 2. Trending Page (Dedicated Menu)
Memindahkan section Trending dari Home ke menu utama tersendiri.

- **Navigasi:** Akan ditambahkan ke **Bottom Navigation Bar**.
- **Provider Selector:** Bagian atas halaman trending akan memiliki filter/tombol untuk memilih sumber data:
    - [Dramabox]
    - [Reelshort] (Data diambil dari `/reelshort/homepage` atau section terkait)
- **Kustomisasi:** Data yang ditampilkan akan menyesuaikan dengan provider yang dipilih user.

## 3. Reelshort API Integration Detail
Data provider baru yang akan diintegrasikan:
- **Base URL:** `https://api.sansekai.my.id/api/reelshort`
- **Endpoints:**
    - Homepage: `/homepage`
    - Detail: `/detail?bookId={id}`
    - Search: `/search?query={q}`
    - Episodes: `/allepisode?bookId={id}`

- **Mapping Logic (Adapter):**
    - Kerangka data Reelshort berbeda sedikit dengan Dramabox, perlu adapter:
    - **Drama:** `bookId` -> `book_id`, `bookName` -> `title` / `book_title`, `coverWap` -> `cover` / `book_pic`.
    - **Episode:** `chapterId` -> `chapterId`, `chapterName` -> `title`, `videoUrl` -> `videoList[0].url`.
    - **Homepage:** Data utama ada di dalam `data.lists` dan `banners`.

## 4. Engine Pengembangan (Internal)
Strategi untuk mengatasi keterbatasan API (tidak adanya endpoint "Random" atau "All"):

- **Pool Mixing Logic:** Mengambil snapshot dari 'Latest', 'Trending', dan 'Search' dari kedua API, lalu menggabungkannya di server-side sebelum dikirim ke UI.
- **Keyword Discovery:** Menggunakan list keyword dinamis untuk melakukan fetch search secara acak di background.
- **Firestore Discovery:** Menyimpan setiap `bookId` baru yang ditemukan ke database pusat sebagai referensi list drama global untuk di-random di masa depan.

## 5. Referral System Enhancements
Peningkatan fitur pada sistem referral dan penarikan dana:

- **Withdrawal Form Validation:**
    - User **WAJIB** mengisi detail akun pembayaran saat melakukan penarikan saldo.
    - **Supported Methods:** Menambahkan daftar lengkap Bank dan E-wallet Indonesia (DANA, OVO, GoPay, ShopeePay, BCA, Mandiri, BRI, BNI, dll).
- **Permanent Referral Binding:**
    - Logika backend (Webhook/Payment Callback) harus memastikan komisi selalu masuk ke `referredBy` setiap kali user melakukan transaksi (VIP atau Credit).
    - Status "anak referral" berlaku selamanya (lifetime attribution).

## 4. Branding & UI Minor Fixes
- **Branding Update:** Mengganti teks logo/header dari "DRAMABOX" menjadi **"DracinAja ID"** di seluruh bagian aplikasi (terutama Home Header).
- **Profile Update LOG:**
    - Menambahkan tab atau menu baru di halaman profil: **"Update LOG"**.
    - Berisi daftar riwayat perubahan aplikasi agar pengguna mendapatkan informasi fitur terbaru secara transparan.

---
*Draft ide ini akan dikonversi menjadi tugas teknis saat fase development 1.0.1 dimulai.*
