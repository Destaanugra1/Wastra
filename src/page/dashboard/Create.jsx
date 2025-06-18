import { useEffect, useState } from 'react';
import { create } from '../../service/Product';
//import { productSchema } from '../../components/validation/ZodCreate';
import Button from '../../components/Button';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';

const Create = () => {
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const user_id = user.id || '';
  const [categories, setCategories] = useState([]);
  const [errors, _setErrors] = useState({});
  const [form, setForm] = useState({
    user_id: user_id,
    nama_produk: '',
    category_id: '',
    foto: null,
    stok: '',
    harga: '',
    deskripsi: '',
  });
  const [preview, setPreview] = useState('');

  useEffect(() => {
    // Fetch kategori dari database
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/category/`
        );
        setCategories(response.data.data || []); // Ambil data kategori dari response
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]); // Set default jika gagal
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'foto') {
      const file = files[0];
      setForm({ ...form, foto: file });
      setPreview(URL.createObjectURL(file)); // Preview gambar
    } else if (name === 'stok' || name === 'harga') {
      setForm({ ...form, [name]: parseInt(value, 10) || 0 });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('Form Data:', form); // Log data form sebelum dikirim

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    console.log('FormData:', formData.get('foto')); // Log file foto

    try {
      const res = await create(formData);
      console.log('Response:', res.data);
      if (res.data.status === 'success') {
        alert('Produk berhasil ditambahkan!');
        window.location.href = '/toko';
      } else {
        alert(
          'Gagal menambah produk: ' +
            (res.data.message || res.data.errors || 'Unknown error')
        );
      }
    } catch (error) {
      console.error('Error:', error.response?.data);
      alert(
        'Terjadi kesalahan: ' +
          (error.response?.data?.errors?.foto || 'Gagal mengunggah produk.')
      );
    }
    setLoading(false);
  };

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 lg:ml-64 p-8'>
        <div className='max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md'>
          <h2 className='text-xl font-bold mb-6'>Tambah Produk</h2>
          <form
            onSubmit={handleSubmit}
            className='space-y-6'
            encType='multipart/form-data'>
            {/* Hidden fields */}
            <input name='user_id' type='hidden' value={form.user_id} readOnly />
            <p className='text-black text-sm'>{user?.nama || '-'}</p>

            {/* Row 1: Nama Produk and Kategori */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Nama Produk
                </label>
                <input
                  name='nama_produk'
                  placeholder='Masukkan nama produk'
                  value={form.nama_produk}
                  onChange={handleChange}
                  className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
                {errors.nama_produk && (
                  <span className='text-red-500 text-sm'>
                    {errors.nama_produk}
                  </span>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Kategori
                </label>
                <select
                  name='category_id'
                  value={form.category_id}
                  onChange={handleChange}
                  required
                  className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'>
                  <option value=''>Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id_category} value={cat.id_category}>
                      {cat.nama_category}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <span className='text-red-500 text-sm'>
                    {errors.category_id}
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: Harga and Stok */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Harga (Rp)
                </label>
                <input
                  name='harga'
                  type='number'
                  placeholder='Masukkan harga'
                  value={form.harga}
                  onChange={handleChange}
                  className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
                {errors.harga && (
                  <span className='text-red-500 text-sm'>{errors.harga}</span>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Stok
                </label>
                <input
                  name='stok'
                  type='number'
                  placeholder='Masukkan jumlah stok'
                  value={form.stok}
                  onChange={handleChange}
                  className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
                {errors.stok && (
                  <span className='text-red-500 text-sm'>{errors.stok}</span>
                )}
              </div>
            </div>

            {/* Row 3: Gambar Produk */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Gambar Produk
              </label>
              <div
                className='border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer'
                onClick={() => document.getElementById('foto-input').click()}>
                {preview ? (
                  <div className='space-y-4'>
                    <img
                      src={preview}
                      alt='Preview'
                      className='h-32 w-32 object-cover rounded-lg mx-auto'
                    />
                    <button
                      type='button'
                      onClick={() =>
                        document.getElementById('foto-input').click()
                      }
                      className='px-4 py-2 bg-orange-400 text-white rounded-md text-sm hover:bg-orange-500 transition-colors'>
                      Pilih File
                    </button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div className='flex justify-center'>
                      <svg
                        className='w-12 h-12 text-orange-400'
                        fill='currentColor'
                        viewBox='0 0 24 24'>
                        <path d='M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z' />
                      </svg>
                    </div>
                    <div className='text-gray-500 text-sm'>
                      Klik untuk mengunggah atau seret gambar ke sini
                    </div>
                    <button
                      type='button'
                      onClick={() =>
                        document.getElementById('foto-input').click()
                      }
                      className='px-4 py-2 bg-orange-400 text-white rounded-md text-sm hover:bg-orange-500 transition-colors'>
                      Pilih File
                    </button>
                  </div>
                )}
              </div>
              <input
                id='foto-input'
                name='foto'
                type='file'
                accept='image/*'
                onChange={handleChange}
                className='hidden'
              />
              {errors.foto && (
                <span className='text-red-500 text-sm'>{errors.foto}</span>
              )}
            </div>

            {/* Row 4: Deskripsi Produk */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Deskripsi Produk
              </label>
              <textarea
                name='deskripsi'
                placeholder='Masukkan deskripsi produk'
                value={form.deskripsi}
                onChange={handleChange}
                rows={4}
                className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
              />
              {errors.deskripsi && (
                <span className='text-red-500 text-sm'>{errors.deskripsi}</span>
              )}
            </div>

            {/* Buttons */}
            <div className='flex justify-end space-x-3 pt-6'>
              <button
                type='button'
                className='px-6 py-2 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400 transition-colors'
                onClick={() => window.history.back()}>
                Batal
              </button>
              <Button label='Simpan Produk' type='submit' loading={loading} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Create;
