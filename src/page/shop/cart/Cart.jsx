import React, { useCallback, useEffect, useState } from 'react'; // Import useState
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { useCart } from '../../../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    // loading dari useCart ini mungkin hanya untuk loading data keranjang awal
    // kita akan tambahkan loading state lokal untuk proses checkout
    handleRemoveItem,
    handleQuantityChange,
    handleClearCart,
    loading: cartLoading, // rename loading dari useCart agar tidak konflik
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false); // State baru untuk proses checkout
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  // Load Snap.js (Tidak ada perubahan, tapi penting untuk dipastikan hanya load sekali)
  const loadSnap = useCallback(() => {
    return new Promise((res, rej) => {
      // Pastikan script hanya ditambahkan sekali
      if (document.getElementById('midtrans-snap-script')) {
        console.log('Snap.js script already loaded.');
        return res();
      }
      const script = document.createElement('script');
      script.id = 'midtrans-snap-script';
      script.src =
        import.meta.env.VITE_MIDTRANS_ENV === 'production'
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.async = true;
      script.setAttribute(
        'data-client-key',
        import.meta.env.VITE_MIDTRANS_CLIENT_KEY
      );
      script.onload = () => {
        console.log('Snap.js loaded successfully.');
        res();
      };
      script.onerror = () => {
        console.error('Failed to load Snap.js');
        rej(new Error('Gagal load Snap.js'));
      };
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    loadSnap().catch((err) => {
      console.error(err);
      alert('Gagal memuat pembayaran');
    });
  }, [loadSnap]);

  const totalItems = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity ?? item.jumlah),
    0
  );
  const totalPrice = cartItems.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity ?? item.jumlah) * Number(item.price ?? item.harga),
    0
  );

  const handleCheckout = async (event) => {
    event.preventDefault(); // Mencegah perilaku default form submission jika tombol ada di dalam form

    if (isCheckingOut) {
      // Cek apakah proses checkout sedang berlangsung
      console.log('Checkout sudah sedang diproses. Mengabaikan klik ganda.');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!cartItems.length || !user) {
      alert('Keranjang kosong atau pengguna belum login.');
      return;
    }

    // Pastikan cartId valid
    const cartId = cartItems.length > 0 ? cartItems[0].cart_id : null;
    console.log('Cart ID:', cartId, 'Cart items:', cartItems);
    if (!cartId) {
      alert('Keranjang tidak valid. Silakan coba lagi.');
      return;
    }

    setIsCheckingOut(true); // Set state checkout menjadi true

    try {
      // Mapping cartItems: jumlah -> quantity, harga -> price, nama_produk -> name, product_id
      const itemsForBackend = cartItems.map((item) => ({
        id: item.product_id || item.id_item, // sesuaikan dengan backend
        price: item.harga,
        quantity: item.jumlah,
        name: item.nama_produk,
      }));

      console.log('Memulai proses checkout untuk cart_id:', cartId);
      console.log('cartItems sebelum checkout:', cartItems);
      const response = await fetch(`${VITE_API_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart_id: cartId,
          username: user.nama,
          email: user.email,
          provinsi: user.provinsi,
          kabupaten: user.kabupaten,
          deskripsi_alamat: user.deskripsi_alamat,
          items: itemsForBackend,
          total_amount: itemsForBackend.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        }),
      });

      const data = await response.json();
      console.log('Respons dari backend:', data);

      if (!response.ok) {
        // Cek status respons HTTP
        throw new Error(
          data.messages?.error ||
            'Gagal mendapatkan token pembayaran dari server.'
        );
      }

      if (!data.snapToken) {
        throw new Error(
          'Respons tidak memiliki snapToken. Gagal mendapatkan token pembayaran.'
        );
      }

      console.log('Membuka Midtrans Snap dengan token:', data.snapToken);
      window.snap.pay(data.snapToken, {
        onSuccess: function (result) {
          console.log('Midtrans onSuccess:', result);

          // Update stock setelah pembayaran berhasil
          fetch(`${VITE_API_URL}/api/payment/success`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: data.order_id,
              items: itemsForBackend,
            }),
          })
            .then((response) => response.json())
            .then((data) =>
              console.log('Pembayaran berhasil diproses server:', data)
            )
            .catch((err) => console.error('Error update stok:', err));

          alert('Pembayaran berhasil!');
          handleClearCart(); // Bersihkan keranjang setelah sukses
          navigate('/success');
        },
        onPending: function (result) {
          console.log('Midtrans onPending:', result);
          alert('Transaksi sedang diproses!');
          handleClearCart(); // Bersihkan keranjang meskipun pending
          navigate('/success'); // Mungkin arahkan ke halaman status pending
        },
        onError: function (result) {
          console.log('Midtrans onError:', result);
          alert('Pembayaran gagal!');
        },
        onClose: function () {
          // Pengguna menutup pop-up Midtrans tanpa menyelesaikan transaksi
          console.log('Midtrans pop-up ditutup oleh pengguna.');
          // Anda bisa tambahkan logika di sini jika perlu, misal tidak clear cart
        },
      });
    } catch (error) {
      console.error('Gagal checkout:', error.message); // Tampilkan pesan error yang lebih spesifik
      alert(`Gagal memproses pembayaran: ${error.message}`);
    } finally {
      setIsCheckingOut(false); // Pastikan state kembali false setelah proses selesai (berhasil/gagal)
    }
  };

  if (cartLoading) {
    // Gunakan cartLoading untuk loading data keranjang awal
    return (
      <>
        <Navbar />
        <div className='container mx-auto text-center py-10'>
          <div className='animate-spin w-12 h-12 border-b-2 border-[#5a3b24] mx-auto' />
          <p className='mt-2'>Memuat keranjang…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className='container mx-auto mt-8 px-4 pb-8 flex flex-col lg:flex-row gap-8'>
        <div className='lg:w-2/3 bg-white rounded shadow p-6'>
          <h2 className='text-2xl font-bold mb-4'>
            Keranjang ({totalItems} item{totalItems !== 1 ? 's' : ''})
          </h2>
          {cartItems.length === 0 ? (
            <div className='text-center py-8'>
              <p className='text-gray-500 mb-4'>Keranjang Anda kosong</p>
              <Link
                to='/toko'
                className='inline-block bg-[#5a3b24] text-white px-6 py-2 rounded hover:bg-[#4a2f1f]'>
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {cartItems.map((item, idx) => (
                <div
                  key={item.id_item ?? item.id ?? idx}
                  className='bg-white rounded-xl shadow-lg p-4 flex flex-col items-center border border-gray-200 hover:shadow-xl transition-shadow'>
                  <img
                    src={`${VITE_API_URL}/${item.foto ?? ''}`}
                    alt={item.name ?? item.nama_produk ?? ''}
                    className='w-28 h-28 object-cover rounded-lg mb-3'
                  />
                  <h3 className='font-semibold text-lg mb-1 text-center'>
                    {item.name ?? item.nama_produk}
                  </h3>
                  <p className='text-[#5a3b24] font-bold text-lg mb-1'>
                    {Number(item.price ?? item.harga).toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    })}
                  </p>
                  <p className='text-sm text-gray-500 mb-2'>
                    Stok: {item.stok ?? '-'}
                  </p>
                  <div className='flex items-center justify-center gap-3 mb-2'>
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          item,
                          Number(item.quantity ?? item.jumlah) - 1
                        )
                      }
                      disabled={cartLoading || isCheckingOut}
                      className='w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full bg-gray-50 text-xl font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'>
                      −
                    </button>
                    <span className='min-w-[2rem] text-center font-bold text-lg'>
                      {item.quantity ?? item.jumlah}
                    </span>
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          item,
                          Number(item.quantity ?? item.jumlah) + 1
                        )
                      }
                      disabled={
                        Number(item.quantity ?? item.jumlah) >=
                          Number(item.stok ?? 9999) ||
                        cartLoading ||
                        isCheckingOut
                      }
                      className='w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full bg-gray-50 text-xl font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'>
                      +
                    </button>
                  </div>
                  <p className='font-bold text-[#5a3b24] text-lg mb-2'>
                    {(
                      Number(item.quantity ?? item.jumlah) *
                      Number(item.price ?? item.harga)
                    ).toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    })}
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item.id_item ?? item.id)}
                    disabled={cartLoading || isCheckingOut}
                    className='w-10 h-10 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl font-bold hover:bg-red-200 disabled:opacity-50 mt-2'
                    title='Hapus item'>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='lg:w-1/3'>
          <div className='bg-white rounded shadow p-6 sticky top-24'>
            <h3 className='text-xl font-bold mb-4'>Ringkasan Pesanan</h3>
            <div className='space-y-2 mb-4'>
              <div className='flex justify-between'>
                <span>
                  Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})
                </span>
                <span className='font-medium'>
                  {totalPrice.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  })}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Ongkos Kirim</span>
                <span className='text-green-600 font-medium'>Gratis</span>
              </div>
              <hr className='my-2' />
              <div className='flex justify-between text-lg font-bold'>
                <span>Total</span>
                <span className='text-[#5a3b24]'>
                  {totalPrice.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  })}
                </span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={!cartItems.length || cartLoading || isCheckingOut} // Tambahkan isCheckingOut
              className='w-full bg-[#5a3b24] text-white py-3 rounded-lg hover:bg-[#4a2f1f] disabled:opacity-50 disabled:cursor-not-allowed font-medium mb-4'>
              {isCheckingOut
                ? 'Memproses Pembayaran...'
                : 'Lanjut ke Pembayaran'}{' '}
              {/* Ubah teks tombol */}
            </button>
            <Link
              to='/toko'
              className='block w-full text-center text-[#5a3b24] border border-[#5a3b24] py-3 rounded-lg hover:bg-[#5a3b24] hover:text-white transition-colors'>
              Lanjut Belanja
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
