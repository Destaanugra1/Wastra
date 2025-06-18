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
    (sum, item) => sum + Number(item.jumlah),
    0
  );
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.jumlah) * Number(item.harga),
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
    if (!cartId) {
      alert('Keranjang tidak valid. Silakan coba lagi.');
      return;
    }

    setIsCheckingOut(true); // Set state checkout menjadi true

    try {
      console.log('Memulai proses checkout untuk cart_id:', cartId);
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
            <div className='space-y-4'>
              {cartItems.map((item) => (
                <div
                  key={item.id_item}
                  className='flex items-center p-4 border rounded-lg hover:bg-gray-50'>
                  <img
                    src={`${VITE_API_URL}/${item.foto}`}
                    alt={item.nama_produk}
                    className='w-20 h-20 object-cover rounded-lg flex-shrink-0'
                  />
                  <div className='flex-1 ml-4'>
                    <h3 className='font-semibold text-lg mb-1'>
                      {item.nama_produk}
                    </h3>
                    <p className='text-[#5a3b24] font-medium'>
                      {Number(item.harga).toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      })}
                    </p>
                    <p className='text-sm text-gray-500'>Stok: {item.stok}</p>
                  </div>
                  <div className='flex items-center space-x-3 mr-4'>
                    <button
                      onClick={() =>
                        handleQuantityChange(item, Number(item.jumlah) - 1)
                      }
                      // Gunakan isCheckingOut juga untuk menonaktifkan tombol quantity
                      disabled={cartLoading || isCheckingOut}
                      className='w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'>
                      −
                    </button>
                    <span className='min-w-[2rem] text-center font-medium'>
                      {item.jumlah}
                    </span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item, Number(item.jumlah) + 1)
                      }
                      disabled={
                        Number(item.jumlah) >= Number(item.stok) ||
                        cartLoading ||
                        isCheckingOut
                      }
                      className='w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'>
                      +
                    </button>
                  </div>
                  <div className='text-right mr-4 min-w-[100px]'>
                    <p className='font-medium'>
                      {(item.jumlah * item.harga).toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id_item)}
                    disabled={cartLoading || isCheckingOut} // Gunakan isCheckingOut
                    className='text-red-500 hover:text-red-700 text-xl font-bold w-8 h-8 flex items-center justify-center disabled:opacity-50'
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
