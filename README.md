# Poto - Dual-Camera Online Photobooth

Website photobooth online dua arah yang memungkinkan dua orang berfoto bersama dalam satu photostrip, meskipun berada di perangkat atau lokasi yang berbeda.

## Fitur Utama

- **Sinkronisasi Realtime**: Ditenagai oleh Pusher.
- **Database MongoDB**: State management untuk room dan pengguna.
- **Penyimpanan Vercel Blob**: Fast serverless image upload.
- **Dual Camera / Split Screen**: Menggunakan `react-webcam`.
- **Desain Modern**: Framer motion, glassmorphism, dan TailwindCSS.
- **Photostrip Generator**: `html2canvas` untuk ekspor resolusi tinggi.

## Cara Instalasi

1. Clone repositori ini (jika Anda mendownload source-nya).
2. Install dependensi:
   ```bash
   npm install
   ```
3. Copy file `.env.example` menjadi `.env.local` dan isi kredensial berikut:
   - **MongoDB URI**: Buat cluster gratis di MongoDB Atlas, dapatkan Connection String-nya.
   - **Pusher**: Buat aplikasi di [Pusher Channels](https://pusher.com/channels), dapatkan `app_id`, `key`, `secret`, dan `cluster`.
   - **Vercel Blob**: Buat Blob store di dashboard Vercel, copy `BLOB_READ_WRITE_TOKEN`.
   
   ```bash
   cp .env.example .env.local
   ```
4. Jalankan server development:
   ```bash
   npm run dev
   ```
5. Buka `http://localhost:3000` di browser.

## Cara Deploy ke Vercel

1. Push kode Anda ke GitHub.
2. Buat project baru di Vercel, import repositori Anda.
3. Di bagian **Environment Variables**, masukkan seluruh isi `.env.local`.
4. Tambahkan **Vercel Blob** melalui tab *Storage* di dashboard Vercel Anda.
5. Klik **Deploy**. Selesai! Tidak ada konfigurasi tambahan yang diperlukan.
