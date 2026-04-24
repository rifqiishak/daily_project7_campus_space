# CampusSpace - Sistem Manajemen Fasilitas Kampus Terintegrasi

CampusSpace adalah platform modern yang dirancang untuk mempermudah civitas akademika dalam mengelola peminjaman ruangan dan fasilitas kampus secara transparan, real-time, dan efisien.

##  Fitur Utama
- **Real-time Live Update**: Pantau ketersediaan ruangan secara instan di Landing Page.
- **Sistem Persetujuan Bertingkat**: Validasi digital dari Kaprodi hingga Staf Sarpras.
- **Anti-Bentrok (SIAKAD Sync)**: Integrasi jadwal kuliah rutin untuk mencegah duplikasi pemesanan.
- **Laporan Kerusakan**: Laporkan fasilitas rusak langsung dari lapangan dengan unggahan foto.
- **Heatmap Kepadatan**: Visualisasi data penggunaan ruangan untuk analisis efisiensi fasilitas.

##  Stack Teknologi
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Heroicons.
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage, Realtime).
- **State Management**: React Hooks & Server Actions.

---

##  Hasil Pengujian Sistem (Quality Assurance)

Pengujian dilakukan menggunakan metode *Black-Box Testing* berdasarkan skenario penggunaan nyata untuk memastikan kualitas perangkat lunak sesuai dengan standar yang ditetapkan.

| ID Uji | Aspek Kualitas | Skenario Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | **Keamanan** | Mengakses halaman *Pengaturan Akun* dengan akun Mahasiswa (Role & RLS Supabase). | Sistem hanya menampilkan data profil (NIM, Nama) milik pengguna yang sedang *login*. | Data profil berhasil dimuat sesuai `user.id`. Akses data lain diblokir RLS. | **[LULUS]** |
| **TC-02** | **Fungsionalitas** | Mahasiswa mengisi form peminjaman dan mengunggah foto KTM. | Foto terunggah ke *Supabase Storage* dan URL tersimpan di tabel `bookings`. | URL KTM berhasil digenerate dan tersimpan dengan status *Pending*. | **[LULUS]** |
| **TC-03** | **Fungsionalitas** | Kaprodi menekan tombol "Setujui" pada daftar antrean. | Status di database berubah menjadi *approved* dan data hilang dari antrean. | Status diperbarui secara *real-time* di seluruh dashboard. | **[LULUS]** |
| **TC-04** | **Kebergunaan** | Kaprodi menekan tombol "Lihat KTM" pada antrean. | Sistem memunculkan gambar KTM dalam bentuk *Modal/Popup* tanpa pindah tab. | *Modal popup* muncul dengan sempurna dan responsif di semua layar. | **[LULUS]** |
| **TC-05** | **Keandalan** | Memeriksa ketersediaan ruangan pada *Landing Page*. | Sistem menampilkan status: Tersedia, *Pending*, *Booked*, dan Jadwal Kuliah. | Indikator warna dan nama kegiatan muncul sesuai validasi data. | **[LULUS]** |
| **TC-06** | **Fungsionalitas** | Kaprodi menambahkan Jadwal Kuliah Rutin (CRUD). | Data masuk ke tabel akademik dan otomatis memblokir jam tersebut untuk peminjaman. | Data tersimpan, *Landing Page* langsung memblokir slot jam terkait. | **[LULUS]** |
| **TC-07** | **Performa** | Menampilkan *Heatmap* Kepadatan Ruangan. | Grafik matriks 7 Hari x 10 Jam tampil sempurna tanpa error dari database. | Fungsi *parser* berhasil mengonversi format kalender ke matriks warna. | **[LULUS]** |

> **Catatan Penguji:** Seluruh alur utama (*critical path*) aplikasi telah berjalan dengan stabil. Infrastruktur database dan frontend terintegrasi dengan sempurna untuk mendukung skala penggunaan yang lebih luas.

---

##  Cara Menjalankan Secara Lokal

1. Clone repositori ini.
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Konfigurasi variabel lingkungan di `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
4. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
