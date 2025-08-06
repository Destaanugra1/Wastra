import React, { useState, useEffect, useCallback } from 'react';

// Ganti dengan cara Anda mendapatkan data ini
// const initialCartItems = [
//     { id: 'P001', name: 'Produk A', price: 10000, quantity: 1 },
//     { id: 'P002', name: 'Produk B', price: 20000, quantity: 2 },
// ];
// const initialTotalAmount = 50000;
// const initialUserId = 1; // ID user yang login
// const initialCustomerDetails = {
//     first_name: 'Budi',
//     last_name: 'Santoso',
//     email: 'budi.santoso@example.com',
//     phone: '081234567890'
// };


function CheckoutPage({ cartItems, totalAmount, userId, customerDetails }) { // Terima props ini
    const [snapToken, setSnapToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState('');

    const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    const MIDTRANS_ENV = import.meta.env.VITE_MIDTRANS_ENV || 'sandbox';
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

    useEffect(() => {
        console.log('cartItems:', cartItems);
    }, [cartItems]);

    const loadSnapScript = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (document.getElementById('midtrans-snap-script')) {
                resolve(); // Script sudah ada
                return;
            }
            const script = document.createElement('script');
            script.id = 'midtrans-snap-script';
            script.src = MIDTRANS_ENV === 'production'
                ? 'https://app.midtrans.com/snap/snap.js'
                : 'https://app.sandbox.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }, [MIDTRANS_CLIENT_KEY, MIDTRANS_ENV]);

    useEffect(() => {
        loadSnapScript().catch(error => {
            console.error("Failed to load Midtrans Snap script:", error);
            setPaymentMessage("Gagal memuat layanan pembayaran.");
        });
    }, [loadSnapScript]);

    const processPayment = async () => {
        if (!window.snap) {
            setPaymentMessage("Layanan pembayaran belum siap. Mohon tunggu atau refresh halaman.");
            return;
        }
        if (!cartItems || cartItems.length === 0 || !totalAmount || !userId || !customerDetails) {
            setPaymentMessage("Data pesanan tidak lengkap untuk melanjutkan pembayaran.");
            return;
        }

        setIsLoading(true);
        setPaymentMessage('Memproses permintaan pembayaran...');

        const orderData = {
            user_id: userId,
            items: cartItems,
            total_amount: totalAmount,
            customer_details: customerDetails,
        };
        console.log('Data dikirim ke backend:', orderData);

        try {
            const response = await fetch(`${API_BASE_URL}/api/payment/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const responseData = await response.json();

            if (!response.ok) {
                // responseData.messages.error (jika dari failValidationErrors CI4)
                // responseData.message (jika dari failServerError CI4)
                const errMsg = responseData.messages?.error || responseData.message || 'Gagal membuat transaksi.';
                throw new Error(errMsg);
            }

            if (responseData.snap_token) {
                setPaymentMessage('Membuka jendela pembayaran...');
                window.snap.pay(responseData.snap_token, {
                    onSuccess: (result) => {
                        setPaymentMessage(`Pembayaran Berhasil! Order ID: ${result.order_id}`);
                        console.log('Midtrans Success:', result);
                        // TODO: Redirect ke halaman status order atau update UI
                    },
                    onPending: (result) => {
                        setPaymentMessage(`Pembayaran Tertunda. Order ID: ${result.order_id}. Silakan selesaikan pembayaran.`);
                        console.log('Midtrans Pending:', result);
                        // TODO: Redirect ke halaman instruksi pembayaran
                    },
                    onError: (result) => {
                        setPaymentMessage(`Pembayaran Gagal: ${result.status_message || 'Terjadi kesalahan.'}`);
                        console.error('Midtrans Error:', result);
                    },
                    onClose: () => {
                        // Hanya tampilkan jika belum ada status success/pending/error dari callback lain
                        if (!paymentMessage.includes('Berhasil') && !paymentMessage.includes('Tertunda') && !paymentMessage.includes('Gagal')) {
                            setPaymentMessage('Anda menutup jendela pembayaran.');
                        }
                    },
                });
            } else {
                throw new Error('Token pembayaran tidak ditemukan dalam respons server.');
            }
        } catch (error) {
            console.error('Payment Process Error:', error);
            setPaymentMessage(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // --- ANDA PERLU MENGISI BAGIAN INI DENGAN LOGIKA APLIKASI ANDA ---
    // Contoh bagaimana Anda bisa mendapatkan props ini:
    // const { cartItems, totalAmount } = useCartStore(); // Jika pakai state management
    // const { user } = useAuthStore(); // Jika pakai state management
    // const customerDetails = user ? { first_name: user.name, email: user.email, phone: user.phone } : null;
    // const userId = user ? user.id : null;
    // --- AKHIR BAGIAN YANG PERLU DIISI ---

    return (
        <div>
            <h3>Ringkasan Pesanan</h3>
            {/* Tampilkan cartItems dan totalAmount di sini */}
            {cartItems && cartItems.map(item => (
                <div key={item.id}>
                    {item.name} x {item.quantity} = Rp {item.price * item.quantity}
                </div>
            ))}
            <p><strong>Total: Rp {totalAmount}</strong></p>

            <button onClick={processPayment} disabled={isLoading || !window.snap}>
                {isLoading ? 'Memproses...' : 'Lanjutkan ke Pembayaran'}
            </button>
            {paymentMessage && <p style={{ marginTop: '15px', color: paymentMessage.includes('Gagal') || paymentMessage.includes('Error') ? 'red' : 'green' }}>{paymentMessage}</p>}
        </div>
    );
}

export default CheckoutPage;