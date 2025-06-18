import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Mail, Loader2, ArrowRight } from 'lucide-react';

const Verify = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Memverifikasi akun...');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let timer;
    const verifyAccount = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/home/verify/${token}`
        );
        if (res.data.status === 'success') {
          setStatus('success');
          setMessage('Verifikasi berhasil! Anda akan diarahkan ke halaman login.');
          timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate('/login');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setStatus('error');
          setMessage(res.data.message || 'Verifikasi gagal.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Terjadi kesalahan saat verifikasi.');
      }
    };
    verifyAccount();
    return () => clearInterval(timer);
  }, [token, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500 animate-pulse" />;
      default:
        return <Mail className="w-16 h-16 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'from-blue-400 to-blue-600';
      case 'success':
        return 'from-green-400 to-green-600';
      case 'error':
        return 'from-red-400 to-red-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main card */}
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20 text-center transform transition-all duration-500 hover:scale-105">
          {/* Header */}
          <div className="mb-8">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${getStatusColor()} p-1 shadow-lg`}>
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                {getIcon()}
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Verifikasi Email
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          {/* Status message */}
          <div className="mb-8">
            <p className="text-gray-600 text-lg leading-relaxed">
              {message}
            </p>
            
            {status === 'success' && countdown > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded-2xl border border-green-200">
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <ArrowRight className="w-5 h-5" />
                  <span className="font-medium">
                    Mengalihkan dalam {countdown} detik...
                  </span>
                </div>
                <div className="mt-3 w-full bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                    style={{
                      width: `${((3 - countdown) / 3) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            {status === 'success' && (
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Lanjut ke Login</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            
            {status === 'error' && (
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Coba Lagi
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Kembali ke Registrasi
                </button>
              </div>
            )}
          </div>

          {/* Loading indicator */}
          {status === 'loading' && (
            <div className="mt-6">
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">
            Butuh bantuan? <span className="text-indigo-600 hover:text-indigo-800 cursor-pointer font-medium">Hubungi Support</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify;