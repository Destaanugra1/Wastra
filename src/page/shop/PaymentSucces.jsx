import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const confirmPayment = async () => {
      if (!orderId) {
        navigate('/');
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderId }),
        });

        const data = await res.json();
        console.log('Confirm status:', data);
      } catch (err) {
        console.error('Failed to confirm payment status:', err);
      } finally {
        setTimeout(() => navigate('/'), 2000); // redirect to home after 2s
      }
    };

    confirmPayment();
  }, [orderId, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold mb-4">Pembayaran Berhasil!</h1>
      <p>Order ID: {orderId}</p>
      <p>Mengarahkan Anda kembali ke beranda...</p>
    </div>
  );
};

export default PaymentSuccess;
