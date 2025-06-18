import { z } from 'zod';

export const productSchema = z.object({
  nama_produk: z.string().min(5, 'Nama produk wajib diisi'),
  category_id: z.string().nonempty('Kategori wajib dipilih'),
  foto: z
    .any()
    .optional()
    .refine(
      (file) => !file || (file instanceof File && file.size > 0),
      'Foto wajib diupload'
    ),
  stok: z.coerce.number().min(1, 'Stok harus lebih dari 0'),
  harga: z.coerce.number().min(1, 'Harga harus lebih dari 0'),
  deskripsi: z.string().trim().min(1, 'Deskripsi wajib diisi'),
});
