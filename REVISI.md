# Ringkasan Revisi Portal Pengumuman

## File yang ditambahkan

| File | Fungsi |
| --- | --- |
| `server.js` | Menjalankan server Node.js dan menyediakan endpoint `POST /api/results` untuk memeriksa hasil seleksi. |
| `private/selection-data.js` | Menyimpan data seleksi dan data dummy pengujian di sisi server. Folder `private` tidak boleh dijadikan aset publik. |
| `.gitignore` | Mencegah `private/selection-data.js` ikut terunggah ke Git. |
| `REVISI.md` | Dokumen ringkasan perubahan dan data pengujian ini. |

## File yang direvisi

| File | Revisi |
| --- | --- |
| `app.js` | Pengecekan hasil memakai API server, tombol salin memiliki fallback, dan tombol WhatsApp disembunyikan bila tautan belum ada. |
| `index.html` | Menghapus pemanggilan data seleksi dari browser serta tag HTML penutup yang duplikat. |
| `config.js` | Tautan WhatsApp dikosongkan agar tidak mengarah ke placeholder. Isi dengan tautan grup resmi sebelum rilis. |
| `README.md` | Menambahkan panduan menjalankan server dan catatan keamanan data. |

## File yang dihapus

| File | Alasan |
| --- | --- |
| `data-lolos.js` | Data tidak lagi dikirim ke browser. |
| `data_tidak-lolos.js` | Data tidak lagi dikirim ke browser. |

## Data pengujian

| NRP | Hasil | Nama | Kata kunci |
| --- | --- | --- | --- |
| `900000000001` | Lolos | Peserta Uji Lolos | `UJI-LOLOS-2026` |
| `900000000002` | Tidak lolos | Peserta Uji Tidak Lolos | - |

Data pengujian ada di `private/selection-data.js`. Hapus `testRecords` sebelum pengumuman resmi dipublikasikan.

## Cara menjalankan

Jalankan perintah berikut dari folder proyek:

```bash
node server.js
```

Lalu buka `http://localhost:3000`. Jangan membuka `index.html` langsung melalui `file://`, dan jangan deploy sebagai situs statis karena pemeriksaan hasil membutuhkan server Node.js.

Jika muncul respons HTML atau pesan `Unexpected token '<'`, halaman sedang dibuka melalui Live Server/server statis. Tutup Live Server dan akses alamat yang ditampilkan setelah menjalankan `node server.js`.
