import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');
  const [isDirectBuy, setIsDirectBuy] = useState(null);
  const [isConfirming, setIsConfirming] = useState(true);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // Check if this page was accessed directly from Midtrans redirect
    const transactionStatus = searchParams.get('transaction_status');
    const statusCode = searchParams.get('status_code');
    
    console.log('Payment success page accessed with params:', {
      orderId,
      transactionStatus,
      statusCode
    });

    const confirmPayment = async () => {
      if (!orderId) {
        console.log('No order ID found, redirecting to home');
        navigate('/');
        return;
      }

      // If this is a direct redirect from Midtrans with pending status, 
      // redirect back to product page instead of staying on success page
      if (transactionStatus === 'pending' && statusCode === '201') {
        console.log('Pending payment detected from Midtrans redirect, going back to home');
        navigate('/');
        return;
      }

      // Less strict validation: just check if order_id exists and has some length
      if (orderId.length < 5) {
        console.log('Invalid order ID format, redirecting to home');
        navigate('/');
        return;
      }

      try {
        setIsConfirming(true);
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/payment/confirm`;
        console.log('=== MAKING API REQUEST ===');
        console.log('API URL:', apiUrl);
        console.log('Order ID being sent:', orderId);
        console.log('Request payload:', JSON.stringify({ order_id: orderId }));
        
        const res = await fetch(
          apiUrl,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId }),
          }
        );

        const data = await res.json();
        console.log('=== PAYMENT CONFIRMATION DEBUG ===');
        console.log('Full fetch response object:', res);
        console.log('Response headers:', Object.fromEntries(res.headers.entries()));
        console.log('Response URL:', res.url);
        console.log('Response redirected:', res.redirected);
        console.log('API Response:', data);
        console.log('Response status:', res.status);
        console.log('Payment status from server:', data.status);
        console.log('Order details:', data);
        console.log('Is this the expected payment response structure?', {
          hasMessage: !!data.message,
          hasOrderId: !!data.order_id,
          hasTotal: !!data.total,
          hasProductData: !!(data.data && data.data.nama_produk)
        });
        console.log('=== END DEBUG ===');

        // Jika response tidak ok, redirect ke home
        if (!res.ok) {
          console.log('API request failed, redirecting to home');
          navigate('/');
          return;
        }

        // Accept both 'success' and 'pending' status
        if (data.status && (data.status === 'success' || data.status === 'pending')) {
          setPaymentData(data);
        } else {
          console.log('Invalid payment status, redirecting to home');
          navigate('/');
          return;
        }

        // Jika server mengembalikan info apakah pembelian langsung
        if (data.is_direct_buy !== undefined) {
          setIsDirectBuy(data.is_direct_buy);
        }
      } catch (err) {
        console.error('Failed to confirm payment status:', err);
        // Jika ada error, redirect ke home
        navigate('/');
        return;
      } finally {
        setIsConfirming(false);
        // Hapus auto-redirect, biarkan user yang memilih
      }
    };

    confirmPayment();
  }, [orderId, navigate, searchParams]);

  const handleBackToHome = () => {
    // Get user ID from localStorage to redirect to profile
    try {
      const storedUserData = localStorage.getItem('user');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        const userId = userData.id;
        if (userId) {
          navigate(`/user/detail/${userId}`);
          return;
        }
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
    // Fallback to home if no user data
    navigate('/');
  };

  const handleBackToShop = () => {
    navigate('/toko');
  };

  if (isConfirming) {
    const transactionStatus = searchParams.get('transaction_status');
    const statusCode = searchParams.get('status_code');
    
    // Show different loading message if this is a Midtrans redirect
    if (transactionStatus === 'pending' && statusCode === '201') {
      return (
        <div className='min-h-screen flex flex-col items-center justify-center text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500 mb-4'></div>
          <h1 className='text-2xl font-bold mb-4'>Pembayaran Tertunda</h1>
          <p className='text-gray-600 mb-2'>Mengarahkan Anda kembali...</p>
          <p className='text-sm text-gray-500'>Silakan selesaikan pembayaran melalui virtual account</p>
        </div>
      );
    }
    
    return (
      <div className='min-h-screen flex flex-col items-center justify-center text-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mb-4'></div>
        <h1 className='text-2xl font-bold mb-4'>Memverifikasi Pembayaran...</h1>
        <p>Mohon tunggu sebentar...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center text-center bg-gray-50 px-4'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8'>
        <div className='mb-6'>
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
            paymentData?.status === 'success' ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            {paymentData?.status === 'success' ? (
              <svg className='h-8 w-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'></path>
              </svg>
            ) : (
              <svg className='h-8 w-8 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'></path>
              </svg>
            )}
          </div>
          
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            {paymentData?.status === 'success' ? 'Pembayaran Sedang di proses...' : 'Pembayaran Tertunda'}
          </h1>
          
          <p className='text-gray-600 mb-4'>
            {paymentData?.status === 'success' 
              ? 'Terima kasih atas pembelian Anda' 
              : 'Silakan selesaikan pembayaran Anda'
            }
          </p>
          
          <div className='bg-gray-50 rounded-lg p-4 mb-6'>
            <p className='text-sm text-gray-600 mb-1'>Order ID:</p>
            <p className='font-mono text-sm font-medium text-gray-900'>{orderId}</p>
          </div>

          {paymentData && (
            <div className='text-sm text-gray-600 mb-6'>
              <p>Status: 
                <span className={`font-medium ml-1 ${
                  paymentData.status === 'success' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {paymentData.status === 'success' ? 'Berhasil' : 'Tertunda'}
                </span>
              </p>
              {paymentData.total && (
                <p>Total: <span className='font-medium'>Rp {Number(paymentData.total).toLocaleString('id-ID')}</span></p>
              )}
              {paymentData.status === 'pending' && (
                <div className='mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200'>
                  <p className='text-xs text-yellow-800'>
                    Silakan lakukan transfer ke nomor virtual account yang telah diberikan. 
                    Pembayaran akan dikonfirmasi otomatis setelah transfer berhasil.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className='space-y-3'>
          <button
            onClick={handleBackToHome}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200'>
            Kembali ke Beranda
          </button>
          
          <button
            onClick={handleBackToShop}
            className='w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200'>
            Lanjut Belanja
          </button>
        </div>

        <p className='text-xs text-gray-500 mt-6'>
          {paymentData?.status === 'success' 
            ? 'Anda akan menerima konfirmasi via email dalam beberapa menit'
            : 'Cek email Anda untuk detail pembayaran'
          }
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
