// Utility untuk mengkonversi nama produk menjadi slug dan sebaliknya
// Format: nama-produk-id (untuk memastikan uniqueness)

export const generateProductSlug = (productName, productId) => {
  if (!productName || !productId) return null;
  
  // Bersihkan nama produk dan buat slug
  const slug = productName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Hapus karakter khusus kecuali - dan _
    .replace(/\s+/g, '-') // Ganti spasi dengan -
    .replace(/-+/g, '-') // Hilangkan double dash
    .replace(/^-|-$/g, ''); // Hilangkan dash di awal/akhir
  
  // Tambahkan ID di akhir untuk uniqueness
  return `${slug}-${productId}`;
};

export const extractIdFromSlug = (slug) => {
  if (!slug) return null;
  
  // Ambil ID dari akhir slug (setelah dash terakhir)
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Pastikan part terakhir adalah angka
  if (/^\d+$/.test(lastPart)) {
    return parseInt(lastPart);
  }
  
  return null;
};

export const isValidProductSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  
  // Cek format: minimal ada dash dan diakhiri dengan angka
  return /^.+-\d+$/.test(slug);
};

// Contoh penggunaan:
// generateProductSlug("Batik Vest Pendek", 13) => "batik-vest-pendek-13"
// extractIdFromSlug("batik-vest-pendek-13") => 13
