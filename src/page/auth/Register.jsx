import React, { useState } from 'react';
import { register } from '../../service/auth';
import Alert from '../../components/Alert';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [nama, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [provinsi, setProvinsi] = useState('');
  const [kabupaten, setKabupaten] = useState('');
  const [deskripsiAlamat, setDeskripsiAlamat] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    if (!nama || !email || !password || !provinsi || !kabupaten || !deskripsiAlamat) {
      setMessage('Semua field wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const res = await register(nama, email, password, provinsi, kabupaten, deskripsiAlamat);
      if (res.data.status === 'success') {
        setShowAlert(true);
        setMessage('Register berhasil, silakan cek email untuk verifikasi akun Anda.');
      } else {
        if (typeof res.data.message === 'object') {
          setMessage(Object.values(res.data.message).join(', '));
        } else {
          setMessage(res.data.message);
        }
      }
    } catch (error) {
      setMessage('Register gagal, silakan coba lagi. Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div
      className='min-h-screen flex items-center justify-center'
      style={{
        background: 'linear-gradient(135deg, #a6603a 0%, #8b4513 100%)',
      }}
    >
      {showAlert && (
        <Alert
          message='Register berhasil! Silakan cek email untuk verifikasi akun Anda.'
          onClose={() => setShowAlert(false)}
        />
      )}

      <form
        onSubmit={handleRegister}
        className='bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100'
      >
        <h2 className='text-3xl font-bold mb-6 text-center text-gray-800'>Daftar</h2>

        {message && (
          <p
            className={`text-center mb-4 p-3 rounded-lg font-medium ${
              message.toLowerCase().includes('berhasil') ||
              message.toLowerCase().includes('success')
                ? 'text-green-700 bg-green-100 border border-green-300'
                : 'text-red-700 bg-red-100 border border-red-300'
            }`}
          >
            {message}
          </p>
        )}

        <div className='mb-4'>
          <input
            type='text'
            placeholder='Nama'
            value={nama}
            onChange={(e) => setName(e.target.value)}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200'
          />
        </div>

        <div className='mb-4'>
          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200'
          />
        </div>

        <div className='mb-6 relative'>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200'
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600 transition-colors duration-200'
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className='mb-4'>
          <input
            type='text'
            placeholder='Provinsi'
            value={provinsi}
            onChange={(e) => setProvinsi(e.target.value)}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200'
          />
        </div>

        <div className='mb-4'>
          <input
            type='text'
            placeholder='Kabupaten/Kota'
            value={kabupaten}
            onChange={(e) => setKabupaten(e.target.value)}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200'
          />
        </div>

        <div className='mb-6'>
          <textarea
            placeholder='Deskripsi Alamat'
            value={deskripsiAlamat}
            onChange={(e) => setDeskripsiAlamat(e.target.value)}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200'
            rows='4'
          ></textarea>
        </div>

        <button
          type='submit'
          disabled={loading}
          className='w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
        >
          {loading ? 'Loading...' : 'Daftar'}
        </button>

        <p className='mt-4 text-center text-sm text-gray-600'>
          Sudah punya akun?{' '}
          <a
            href='/login'
            className='font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200'
          >
            Masuk
          </a>
        </p>
      </form>
    </div>
  );
};

export default Register;