import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct } from '../../service/Product';
import axios from 'axios';
import Alert from '../../components/Notification';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    user_id: '',
    nama_produk: '',
    category_id: '',
    stok: '',
    harga: '',
    deskripsi: '',
    foto: null,
  });
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState('');

  // Fetch kategori dari backend
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/category/`)
      .then((res) => setCategories(res.data.data || []));
  }, []);

  // Fetch data produk berdasarkan ID
  useEffect(() => {
    getProductById(id).then((res) => {
      const data = res.data.data;
      setForm({
        user_id: data.user_id || '',
        nama_produk: data.nama_produk || '',
        category_id: data.category_id || '',
        stok: data.stok || '',
        harga: data.harga || '',
        deskripsi: data.deskripsi || '',
        foto: null,
      });
      setPreview(data.foto ? `${import.meta.env.VITE_API_URL}/${data.foto}` : '');
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'foto') {
      setForm({ ...form, foto: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const formData = new FormData();
    formData.append('user_id', String(form.user_id));
    formData.append('nama_produk', form.nama_produk);
    formData.append('category_id', form.category_id);
    formData.append('stok', String(form.stok));
    formData.append('harga', String(form.harga));
    formData.append('deskripsi', form.deskripsi);
    if (form.foto) formData.append('foto', form.foto);

    try {
      const res = await updateProduct(id, formData);
      if (res.data.status === 'success') {
        setAlertMsg('Produk berhasil diupdate!');
        setTimeout(() => navigate('/utama'), 500);
      } else {
        setErrors(res.data.message || {});
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan saat update produk';
      setAlertMsg(`Error: ${msg}`);
    }
    setLoading(false);
  };

  const inputClass = 'border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="relative">
      <Alert message={alertMsg} onClose={() => setAlertMsg('')} />
      <div className="max-w-lg mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Edit Produk</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" encType="multipart/form-data">
          <input
            name="nama_produk"
            placeholder="Nama Produk"
            value={form.nama_produk}
            onChange={handleChange}
            className={inputClass}
          />
          {errors.nama_produk && <span className="text-red-500 text-sm">{errors.nama_produk}</span>}

          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            required
            className={inputClass + ' bg-white'}
          >
            <option value="">Pilih Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id_category} value={cat.id_category}>
                {cat.nama_category}
              </option>
            ))}
          </select>
          {errors.category_id && <span className="text-red-500 text-sm">{errors.category_id}</span>}

          <input
            name="stok"
            type="number"
            placeholder="Stok"
            value={form.stok}
            onChange={handleChange}
            className={inputClass}
          />
          {errors.stok && <span className="text-red-500 text-sm">{errors.stok}</span>}

          <input
            name="harga"
            type="number"
            placeholder="Harga"
            value={form.harga}
            onChange={handleChange}
            className={inputClass}
          />
          {errors.harga && <span className="text-red-500 text-sm">{errors.harga}</span>}

          <textarea
            name="deskripsi"
            placeholder="Deskripsi"
            value={form.deskripsi}
            onChange={handleChange}
            className={inputClass + ' h-24 resize-none'}
          />
          {errors.deskripsi && <span className="text-red-500 text-sm">{errors.deskripsi}</span>}

          <div>
            <label className="block mb-2 text-gray-700 font-medium">Foto Produk (opsional)</label>
            <input
              name="foto"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-white file:text-gray-700 hover:file:bg-gray-100"
            />
            {preview && (
              <div className="relative mt-3 w-40 h-40">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                  <span className="text-white text-sm">Preview Gambar</span>
                </div>
              </div>
            )}
            {errors.foto && <span className="text-red-500 text-sm">{errors.foto}</span>}
          </div>

          <button
            type="submit"
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Update Produk'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
