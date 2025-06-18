import { useState, useEffect, useCallback } from 'react';

const VITE_MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
const VITE_MIDTRANS_ENV = import.meta.env.VITE_MIDTRANS_ENV || 'sandbox';

const useMidtransSnap = () => {
  const [isSnapReady, setIsSnapReady] = useState(false);
  const [error, setError] = useState(null);

  const loadSnapScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('midtrans-snap-script')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'midtrans-snap-script';
      script.src =
        VITE_MIDTRANS_ENV === 'production'
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', VITE_MIDTRANS_CLIENT_KEY);
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    loadSnapScript()
      .then(() => setIsSnapReady(true))
      .catch((err) => {
        console.error('Gagal memuat skrip Midtrans Snap:', err);
        setError('Gagal memuat layanan pembayaran.');
      });
  }, [loadSnapScript]);

  return { isSnapReady, error };
};

export default useMidtransSnap;