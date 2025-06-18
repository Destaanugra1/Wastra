import React, { useState } from 'react';
import { login } from '../../service/auth';
import Alert from '../../components/Alert';
import Button from '../../components/Button';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!email && !password) {
      setMessage('email & password wajib di isi');
      setLoading(false);
      return;
    } else if (!email) {
      setMessage('email wajib di isi');
      setLoading(false);
      return;
    } else if (!password) {
      setMessage('password wajib di isi');
      setLoading(false);
      return;
    }
    try {
      const res = await login(email, password);
      if (res.data.status === 'success') {
        setShowAlert(true);
        setTimeout(() => {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          localStorage.setItem('id', res.data.user.id);
          window.location.href = '/';
        }, 1500);
      } else {
        setMessage(res.data.message);
      }
    } catch (error) {
      setMessage('Login gagal. Silakan coba lagi.', error);
    }
    setLoading(false);
  };

  return (
    <div 
      className='min-h-screen flex items-center justify-center'
      style={{
        background: 'linear-gradient(135deg, #a6603a 0%, #8b4513 100%)'
      }}
    >
      
      {showAlert && (
        <Alert
          message='Login berhasil! Anda akan diarahkan ke halaman utama.'
          onClose={() => setShowAlert(false)}
        />
      )}
      
      <form
        onSubmit={handleLogin}
        className='bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100'
      >
          <h2 
            className='text-3xl font-bold mb-6 text-center text-gray-800'
          >
            Masuk
          </h2>
          
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
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600 transition-colors duration-200"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
          
          <Button 
            type='submit' 
            label='Masuk' 
            loading={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          />
          
          <p className='mt-4 text-center text-sm text-gray-600'>
            Belum punya akun?{' '}
            <a 
              href='/register' 
              className='font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200'
            >
              Daftar
            </a>
          </p>
      </form>
    </div>
  );
};

export default Login;