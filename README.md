# Portal Pengumuman ILITS × IKAMADIRI 2026

Jalankan dengan Node.js agar data peserta tidak dikirim ke browser:

```bash
node server.js
```

Buka `http://localhost:3000`. Jangan membuka `index.html` langsung melalui `file://`.

Sebelum rilis, isi `whatsappGroupUrl` pada `config.js` dengan tautan grup resmi.

Data seleksi berada di `private/selection-data.js`, yang sengaja tidak dilacak Git. Pastikan berkas tersebut diprovisikan sebagai rahasia pada server produksi dan folder `private` tidak pernah dijadikan aset statis.

Data uji (hapus sebelum pengumuman dipublikasikan): `900000000001` untuk hasil lolos dan `900000000002` untuk hasil tidak lolos.
