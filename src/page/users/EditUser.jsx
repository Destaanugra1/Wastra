import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, updateUser } from '../../service/user';
import Alert from '../../components/Notification';
import Navbar from '../../components/Navbar';
import { decryptId, isValidToken } from '../../lib/idEncryption';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Validasi dan dekripsi ID
  const validatedId = useMemo(() => {
    if (!id) return null;
    
    // Jika ID adalah angka langsung (untuk backward compatibility)
    if (/^\d+$/.test(id)) {
      return parseInt(id);
    }
    
    // Jika ID adalah token terenkripsi
    if (isValidToken(id)) {
      return decryptId(id);
    }
    
    return null;
  }, [id]);

  useEffect(() => {
    if (!validatedId) {
      console.error('Invalid user token');
      navigate('/');
      return;
    }
  }, [validatedId, navigate]);

  const [form, setForm] = useState({
    nama: '',
    email: '',
    provinsi: '',
    kabupaten: '',
    deskripsi_alamat: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState('');

  // Fetch data user berdasarkan ID
  useEffect(() => {
    if (!validatedId) return;
    
    getUserById(validatedId).then((res) => {
      const data = res.data.data;
      setForm({
        nama: data.username || '',
        email: data.email || '',
        provinsi: data.provinsi || '',
        kabupaten: data.kabupaten || '',
        deskripsi_alamat: data.deskripsi_alamat || '',
      });
    }).catch((err) => {
      console.error('Error fetching user data:', err);
      if (err.response?.status === 404 || err.message?.includes('Invalid')) {
        navigate('/');
      }
    });
  }, [validatedId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await updateUser(validatedId, form);
      if (res.data.status === 'success') {
        setAlertMsg('Profil berhasil diupdate!');
        setTimeout(() => navigate('/users'), 500);
      } else {
        setErrors(res.data.message || {});
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Terjadi kesalahan saat update profil';
      setAlertMsg(`Error: ${msg}`);
    }
    setLoading(false);
  };

  const inputClass =
    'border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <>
    <Navbar />
      <div className='relative'>
        <Alert message={alertMsg} onClose={() => setAlertMsg('')} />
        <div className='max-w-lg mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg'>
          <h2 className='text-2xl font-semibold mb-5 text-gray-800'>
            Edit Profil
          </h2>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <input
              name='nama'
              placeholder='Nama'
              value={form.nama}
              onChange={handleChange}
              className={inputClass}
            />
            {errors.nama && (
              <span className='text-red-500 text-sm'>{errors.nama}</span>
            )}

            <input
              name='email'
              type='email'
              placeholder='Email'
              value={form.email}
              onChange={handleChange}
              className={inputClass}
            />
            {errors.email && (
              <span className='text-red-500 text-sm'>{errors.email}</span>
            )}

            <input
              name='provinsi'
              placeholder='Provinsi'
              value={form.provinsi}
              onChange={handleChange}
              className={inputClass}
            />
            {errors.provinsi && (
              <span className='text-red-500 text-sm'>{errors.provinsi}</span>
            )}

            <input
              name='kabupaten'
              placeholder='Kabupaten'
              value={form.kabupaten}
              onChange={handleChange}
              className={inputClass}
            />
            {errors.kabupaten && (
              <span className='text-red-500 text-sm'>{errors.kabupaten}</span>
            )}

            <textarea
              name='deskripsi_alamat'
              placeholder='Deskripsi Alamat'
              value={form.deskripsi_alamat}
              onChange={handleChange}
              className={inputClass + ' h-24 resize-none'}
            />
            {errors.deskripsi_alamat && (
              <span className='text-red-500 text-sm'>
                {errors.deskripsi_alamat}
              </span>
            )}

            <button
              type='submit'
              className='mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors duration-200 disabled:opacity-50'
              disabled={loading}>
              {loading ? 'Menyimpan...' : 'Update Profil'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditUser;
