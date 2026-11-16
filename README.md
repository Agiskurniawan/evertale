# Dokumentasi Frontend EverTale

## A. Tujuan

Membuat tampilan website (antarmuka pengguna) untuk aplikasi baca novel dan komik **EverTale**. Frontend ini berkomunikasi dengan backend EverTale lewat REST API, sehingga pembaca bisa menjelajah dan membaca karya, sedangkan penulis (author) bisa membuat dan mengelola karyanya sendiri.

## B. Teknologi yang Digunakan

| Teknologi | Fungsi |
| --------- | ------ |
| React 19 | Library untuk membangun tampilan |
| TypeScript | JavaScript dengan tipe data, supaya lebih minim error |
| Vite | Tools untuk menjalankan dan membangun proyek |
| React Router | Perpindahan antar halaman |
| Tailwind CSS 4 | Pengaturan gaya / desain tampilan |
| Axios | Memanggil API backend |
| Recharts | Grafik analitik penulis |
| Lucide React | Kumpulan ikon |
| ESLint | Pengecek kerapian kode |

## C. Fitur yang Dibuat

**Untuk pembaca**

* Beranda (hero/banner, daftar karya, karya populer, kategori)
* Halaman Original dengan filter hari rilis dan pengurutan
* Halaman kategori / genre
* Pencarian karya langsung dari navbar
* Detail karya, daftar bab/episode, rating, dan komentar (termasuk balasan)
* Membaca novel dan komik, serta menyukai (like) bab
* Favorit karya dan follow kreator
* Riwayat baca (bisa dihapus semua)
* Notifikasi (bab baru dan balasan komentar)
* Register, login, logout, dan edit profil (nama, bio, foto avatar)
* Mode gelap / terang (tersimpan di browser)

**Untuk author**

* Mendaftar menjadi author
* Dashboard author dengan tiga tab: **Serial**, **Analisis**, dan **Komentar**
* Membuat serial baru (novel atau komik) beserta cover dan banner
* Mengubah dan menghapus serial
* Menulis bab novel dengan editor (ada simpan otomatis dan draft)
* Mengunggah halaman komik
* Mengatur ulang urutan bab
* Analitik: total views, grafik harian/mingguan/bulanan, dan ringkasan per serial
* Moderasi komentar: balas, hapus, dan blokir pengguna

## D. Cara Kerja Singkat

```text
Browser (React) ──Axios──▶ Backend EverTale (http://localhost:5000/api) ──▶ MySQL
```

1. Frontend memanggil API backend lewat file `src/lib/api.ts`.
2. Setelah login, token JWT disimpan di `localStorage` dengan nama `evertale_token`.
3. Setiap request otomatis membawa header `Authorization: Bearer <token>`.
4. Jika server membalas **401** (token kedaluwarsa atau akun dinonaktifkan), token dihapus dan pengguna otomatis logout.
5. Gambar dari backend (cover, banner, avatar) dibaca lewat `http://localhost:5000/uploads/...`.

Frontend **tidak bisa berjalan sendiri**. Backend harus sudah menyala supaya data tampil.

## E. Autentikasi di Frontend

File: `src/context/AuthContext.tsx`

`AuthContext` menyimpan data pengguna yang sedang login dan dipakai di seluruh halaman lewat `useAuth()`.

| Nilai | Fungsi |
| ----- | ------ |
| `user`, `username`, `bio`, `avatarUrl` | Data profil |
| `isLoggedIn`, `isAuthor`, `isAdmin` | Status dan role pengguna |
| `loading` | `true` saat token lama sedang dicek ke server |
| `login()`, `register()`, `logout()` | Masuk, daftar, keluar |
| `updateProfile()` | Mengubah profil |
| `registerAsAuthor()` | Mengubah role menjadi author |

Saat website dibuka, jika ada token tersimpan, frontend memanggil `GET /auth/me` untuk mengetahui siapa pemiliknya.

**Pembatasan halaman:**

| Halaman | Aturan |
| ------- | ------ |
| `/profil`, `/favorit`, `/riwayat` | Wajib login. Jika belum, diarahkan ke `/login` |
| `/author` | Wajib login **dan** role author. Jika belum login ke `/login`, jika bukan author ke `/profil` |

Pembatasan ini hanya untuk tampilan. Keamanan sebenarnya tetap dijaga oleh backend (authentication dan authorization).

## F. Daftar Halaman (Route)

| Path | Halaman | Keterangan |
| ---- | ------- | ---------- |
| `/` | Home | Beranda |
| `/original` | Original | Daftar karya per hari rilis |
| `/kategori`, `/kategori/:type` | KategoriDetail | Karya berdasarkan genre |
| `/riwayat` | Riwayat | Riwayat baca |
| `/baca/:id` | BacaDetail | Detail karya, daftar bab, komentar, dan mode membaca |
| `/kreator/:id` | KreatorDetail | Profil kreator |
| `/login` | Login | Login dan register dalam satu halaman |
| `/profil` | Profil | Profil pengguna |
| `/profil/edit`, `/edit-profil` | EditProfil | Ubah profil dan avatar |
| `/favorit` | Favorit | Karya dan kreator favorit |
| `/daftar-author` | DaftarAuthor | Mendaftar menjadi author |
| `/author` | AuthorDashboard | Dashboard author (tab Serial, Analisis, Komentar) |
| `/author/buat-serial` | AuthorBuatSerial | Membuat serial baru |
| `/author/karya/:id` | AuthorKarya | Kelola satu serial dan bab-babnya |
| `/author/tulis` | AuthorTulis | Menulis bab / unggah halaman komik |
| `/author/novel-editor` | AuthorNovelEditor | Editor novel |
| `*` | EmptyPage | Halaman tidak ditemukan |

Halaman `/login`, `/daftar-author`, `/profil/edit`, `/author/novel-editor`, dan mode membaca tampil **tanpa navbar dan footer**.

## G. Endpoint Backend yang Dipakai

| Fitur | Endpoint |
| ----- | -------- |
| Login / register / cek akun | `POST /auth/login`, `POST /auth/register`, `GET /auth/me` |
| Profil | `PATCH /users/me`, `POST /users/me/become-author`, `GET /users/:id` |
| Karya dan kategori | `GET /books`, `GET /books/:id`, `GET /books/:id/chapters`, `GET /categories` |
| Rating dan komentar | `PUT /books/:id/rating`, `GET/POST /books/:id/comments`, `DELETE /comments/:id` |
| Membaca dan like bab | `GET /chapters/:id`, `POST/DELETE /chapters/:id/like` |
| Favorit dan follow | `GET/POST/DELETE /favorites/books...`, `GET/POST/DELETE /favorites/authors...` |
| Riwayat | `GET /history`, `DELETE /history` |
| Notifikasi | `GET /notifications`, `POST /notifications/read-all` |
| Upload gambar | `POST /upload?type=avatar / cover / banner / thumbnail / page` |
| Author: serial dan bab | `/author/books...`, `/author/chapters/:id` |
| Author: analitik | `/author/analytics/stats`, `/chart`, `/serials` |
| Author: komentar | `/author/comments...`, `/author/blocked-users`, `/author/block-user`, `/author/unblock-user/:userId` |

Penjelasan lengkap tiap endpoint ada di dokumentasi backend.

## H. Struktur File

```text
frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx              # Pintu masuk aplikasi
    ├── App.tsx               # Daftar route dan layout
    ├── index.css, App.css    # Gaya global
    ├── lib/
    │   └── api.ts            # Axios, token otomatis, helper URL gambar dan pesan error
    ├── hooks/
    │   └── useFetch.ts       # Hook pengambil data (loading, error, reload)
    ├── context/
    │   ├── AuthContext.tsx   # Data login pengguna
    │   └── ThemeContext.tsx  # Mode gelap / terang
    ├── types/
    │   └── index.ts          # Tipe data (Book, Episode, User, dll.)
    ├── data/
    │   └── navLinks.ts       # Menu navbar
    ├── components/           # Komponen yang dipakai ulang
    │   ├── Navbar.tsx, Footer.tsx, HeroSection.tsx
    │   ├── BookCard.tsx, Buku.tsx, populer.tsx, Kategori.tsx
    │   ├── ComicReader.tsx, HistoryCard.tsx, DataState.tsx
    │   ├── author/           # Sidebar author
    │   ├── cards/            # Kartu statistik, serial, episode, komentar
    │   └── modals/           # Jendela pop-up (pedoman konten, blokir user, dll.)
    └── pages/
        ├── Home.tsx, Original.tsx, KategoriDetail.tsx, BacaDetail.tsx
        ├── Login.tsx, Profil.tsx, EditProfil.tsx
        ├── Favorit.tsx, Riwayat.tsx
        ├── DaftarAuthor.tsx, KreatorDetail.tsx, EmptyPage.tsx
        └── author/           # Halaman dashboard dan penulisan
```

## I. Cara Instalasi dan Menjalankan

### Prasyarat

* Node.js versi terbaru (disarankan 20.19 atau lebih baru)
* **Backend EverTale sudah berjalan** di `http://localhost:5000`

### Langkah-langkah

1. **Jalankan backend dulu** (lihat dokumentasi backend), pastikan `http://localhost:5000/api/health` bisa dibuka.
2. **Buka folder `frontend`** di terminal atau VS Code.
3. **Install dependency:**

   ```bash
   npm install
   ```

4. **(Opsional) Atur alamat backend.** Secara bawaan frontend memakai `http://localhost:5000`. Jika backend berjalan di alamat lain, buat file `.env` di folder `frontend`:

   ```env
   VITE_API_URL=http://localhost:5000
   ```

5. **Jalankan frontend:**

   ```bash
   npm run dev
   ```

6. **Buka alamat yang muncul di terminal**, biasanya `http://localhost:5173`.

### Perintah lain

| Perintah | Fungsi |
| -------- | ------ |
| `npm run dev` | Menjalankan mode development |
| `npm run build` | Membuat versi siap rilis di folder `dist` |
| `npm run preview` | Melihat hasil build |
| `npm run lint` | Mengecek kerapian kode |

### Jika terjadi masalah

| Masalah | Penyebab dan solusi |
| ------- | ------------------- |
| "Tidak bisa terhubung ke server" | Backend belum menyala, atau `VITE_API_URL` salah |
| Halaman kosong / tidak ada karya | Database belum diisi karya. Daftar jadi author lalu buat serial dan terbitkan |
| Gambar tidak muncul | Backend mati, atau file gambar tidak ada di folder `uploads` backend |
| Tiba-tiba logout sendiri | Token kedaluwarsa (bawaan 7 hari) atau akun dinonaktifkan |
| Perubahan `.env` tidak terbaca | Matikan `npm run dev` lalu jalankan lagi |

## J. Alur Penggunaan

**Sebagai pembaca**

1. Buka website, jelajahi karya di Beranda, Original, atau Kategori.
2. Klik karya untuk melihat detail dan daftar bab.
3. Daftar atau login untuk memberi rating, komentar, favorit, dan melihat riwayat.

**Sebagai author**

1. Login, buka **Profil**, lalu pilih **Daftar Menjadi Author**.
2. Buka **Dashboard Author**, klik buat serial baru, isi judul, jenis, cover, dan kategori.
3. Tambahkan bab lewat editor (novel) atau unggah halaman (komik).
4. Terbitkan serial dan bab agar tampil ke pembaca.
5. Pantau views di tab **Analisis** dan kelola komentar di tab **Komentar**.

## K. Catatan dan Batasan Saat Ini

* Frontend belum memiliki halaman khusus **admin**. Fitur admin (moderasi user, karya, kategori) sudah tersedia di backend dan bisa diakses lewat API.
* Pemanggilan penyimpanan riwayat baca (`POST /history`) belum ditemukan di kode frontend, sehingga riwayat baru bergantung pada data yang sudah ada di backend.
* Draft dan riwayat versi di editor novel disimpan di `localStorage` browser, sehingga hanya ada di perangkat yang sama.

## L. Hasil Progress

Frontend EverTale sudah memiliki:

* Tampilan responsif dengan mode gelap dan terang
* Login, register, dan pembatasan halaman berdasarkan role
* Penjelajahan, pencarian, dan pembacaan karya
* Rating, komentar, like, favorit, follow, dan notifikasi
* Dashboard author lengkap (serial, editor, analitik, moderasi komentar)
* Terhubung penuh dengan backend lewat Axios

## M. Kesimpulan

Frontend EverTale berhasil dibuat dengan React, TypeScript, dan Tailwind CSS, serta terhubung dengan backend lewat REST API. Pembagian komponen, halaman, context, dan hook membuat kode rapi dan mudah dikembangkan, dengan pembagian pengalaman yang jelas antara pembaca dan author.
