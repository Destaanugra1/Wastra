# Banner Images Guide

## Panduan Penggunaan Gambar Banner

Untuk menggunakan komponen Banner, Anda perlu menambahkan gambar banner ke folder `public/images/`.

### Format Gambar yang Disarankan:

- **Format**: JPG, PNG, atau WebP
- **Resolusi**: 1920x600px atau 1920x800px (ratio 16:9 atau 16:10)
- **Ukuran file**: Maksimal 2MB per gambar untuk performa optimal

### Nama File yang Dibutuhkan:

1. `banner1.jpg` - Banner untuk "Koleksi Terbaru 2025"
2. `banner2.jpg` - Banner untuk "Diskon Hingga 50%"
3. `banner3.jpg` - Banner untuk "Gratis Ongkir"

### Cara Menambahkan Gambar:

1. Siapkan 3 gambar banner dengan nama file sesuai di atas
2. Letakkan di folder `public/images/`
3. Gambar akan otomatis muncul di banner carousel

### Kustomisasi:

Jika Anda ingin mengubah data banner, edit file `src/components/Banner.jsx` pada bagian `bannerData`.

### Contoh Struktur Folder:

```
public/
  images/
    banner1.jpg
    banner2.jpg
    banner3.jpg
```

### Tips Desain Banner:

- Gunakan gambar dengan kontras yang baik agar teks tetap terbaca
- Hindari gambar yang terlalu ramai di area tengah (tempat teks)
- Pertimbangkan penggunaan gambar dengan tone yang sesuai dengan tema brand Anda

### Fallback:

Jika gambar tidak ditemukan, banner akan tetap menampilkan background gradient tanpa gambar.
