import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getProductById } from '../../service/Product';

const DetailProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [snapToken, setSnapToken] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const VITE_API_URL = import.meta.env.VITE_API_URL;
  const VITE_MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
  const VITE_MIDTRANS_ENV = import.meta.env.VITE_MIDTRANS_ENV || 'sandbox';

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
  }, [VITE_MIDTRANS_CLIENT_KEY, VITE_MIDTRANS_ENV]);

  useEffect(() => {
    loadSnapScript().catch((error) => {
      console.error('Gagal memuat skrip Midtrans Snap:', error);
      setPaymentMessage('Gagal memuat layanan pembayaran.');
    });
  }, [loadSnapScript]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) {
        setPaymentMessage('ID produk tidak valid.');
        return;
      }
      try {
        setIsLoading(true);
        const res = await getProductById(id);
        console.log('Respons dari backend:', res.data);
        if (res.data && res.data.status === 'success') {
          setProduct(res.data.data || null);
        } else {
          throw new Error(res.data.message || 'Produk tidak ditemukan.');
        }
      } catch (err) {
        console.error('Gagal mengambil detail produk:', err);
        setProduct(null);
        setPaymentMessage(`Gagal mengambil detail produk: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // Function to update product stock
  const updateProductStock = async (productId, quantitySold) => {
    try {
      const response = await fetch(
        `${VITE_API_URL}/api/products/${productId}/stock`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quantity_sold: quantitySold,
          }),
        }
      );

      if (!response.ok) {
        console.error('Gagal mengupdate stok produk');
        setPaymentMessage('Gagal mengupdate stok produk.');
      } else {
        console.log('Stok produk berhasil diupdate');
        setProduct((prevProduct) => ({
          ...prevProduct,
          stok: prevProduct.stok - quantitySold,
        }));
      }
    } catch (error) {
      console.error('Error mengupdate stok:', error);
      setPaymentMessage('Terjadi kesalahan saat mengupdate stok.');
    }
  };

  // Function to handle quantity change
  const handleQuantityChange = (value) => {
    if (product && value >= 1 && value <= product.stok) {
      setQuantity(value);
    }
  };

  // Function to decrease quantity
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Function to increase quantity
  const increaseQuantity = () => {
    if (product && quantity < product.stok) {
      setQuantity(quantity + 1);
    }
  };

  // Function to handle buy now
  const handleBuyNow = async () => {
    // If payment was already successful, go directly to success page
    if (paymentSuccess && orderId) {
      setPaymentMessage('Mengarahkan ke halaman sukses...');
      setTimeout(() => navigate(`/success?order_id=${orderId}`), 1000);
      return;
    }

    if (!product) {
      setPaymentMessage('Detail produk tidak tersedia.');
      return;
    }
    if (!window.snap) {
      setPaymentMessage(
        'Layanan pembayaran belum siap. Mohon refresh halaman.'
      );
      return;
    }
    if (!product.id_product) {
      setPaymentMessage('ID produk tidak tersedia.');
      return;
    }
    if (quantity > product.stok) {
      setPaymentMessage('Jumlah yang dipilih melebihi stok yang tersedia.');
      return;
    }

    // If snapToken exists, reuse it
    if (snapToken) {
      setIsLoading(false);
      setPaymentMessage('Membuka kembali jendela pembayaran...');
      window.snap.pay(snapToken, {
        onSuccess: async (result) => {
          // Pastikan update stok dan status pembayaran dilakukan dengan benar
          await updateProductStock(product.id_product, quantity);
          setPaymentSuccess(true);
          setPaymentMessage(
            'Pembayaran berhasil! Stok produk telah diperbarui. Akan dialihkan...'
          );
          setTimeout(
            () => navigate(`/success?order_id=${result.order_id}`),
            2000
          );
        },
        onPending: (result) => {
          // Menangani status pending
          setOrderId(result.order_id);
          setPaymentMessage(
            `Pembayaran Tertunda. Order ID: ${result.order_id}. Selesaikan pembayaran Anda.`
          );
        },
        onError: (result) => {
          setPaymentMessage(
            `Pembayaran Gagal: ${result.status_message || 'Silakan coba lagi.'}`
          );
          setSnapToken('');
          setOrderId(null);
        },
        onClose: async () => {
          if (orderId) {
            setPaymentMessage(
              `Anda menutup jendela pembayaran. Order ID: ${orderId}. Klik "Beli Sekarang" untuk melanjutkan.`
            );
          } else {
            setPaymentMessage('Anda menutup jendela pembayaran.');
            setSnapToken('');
            setOrderId(null);
          }
        },
      });
      return;
    }

    setIsLoading(true);
    setPaymentMessage('Memproses permintaan pembayaran...');

    let userId = null;
    let username = null;
    let email = null;
    let customerDetails = null;

    try {
      const storedUserData = localStorage.getItem('user');
      if (!storedUserData) {
        setPaymentMessage('Anda harus login untuk melanjutkan pembelian.');
        setIsLoading(false);
        return;
      }

      const parsedUserData = JSON.parse(storedUserData);
      userId = parsedUserData.id;
      username = parsedUserData.nama;
      email = parsedUserData.email;
      customerDetails = {
        first_name: username || 'Pengguna',
        last_name: '',
        email: email,
      };

      if (!userId || !username || !email || !customerDetails.first_name) {
        setPaymentMessage(
          'Informasi pelanggan tidak lengkap. Mohon periksa profil Anda.'
        );
        setIsLoading(false);
        return;
      }

      const totalAmount = Number(product.harga) * quantity;

      const orderData = {
        user_id: userId,
        username: username,
        email: email,
        items: [
          {
            id: product.id_product,
            price: Number(product.harga),
            quantity: quantity,
            name: product.nama_produk,
          },
        ],
        total_amount: totalAmount,
        customer_details: customerDetails,
      };

      console.log('Order Data:', orderData);

      const response = await fetch(`${VITE_API_URL}/api/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        let errMsg = 'Gagal membuat transaksi.';
        if (responseData.errors) {
          if (typeof responseData.errors === 'object') {
            errMsg = Object.values(responseData.errors).join(', ');
          } else {
            errMsg = responseData.errors;
          }
        } else if (responseData.message) {
          errMsg = responseData.message;
        }
        throw new Error(errMsg);
      }

      if (responseData.snap_token && responseData.order_id) {
        setSnapToken(responseData.snap_token);
        setOrderId(responseData.order_id);
      } else {
        throw new Error(
          'Token pembayaran atau order ID tidak diterima dari server.'
        );
      }
    } catch (error) {
      console.error('Buy Now Error:', error);
      setPaymentMessage(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (snapToken && window.snap) {
      setIsLoading(false);
      setPaymentMessage('Menunggu pembayaran...');
      window.snap.pay(snapToken, {
        onSuccess: (result) => {
          console.log(
            'Pembayaran sukses, mengarahkan ke halaman konfirmasi...',
            result
          );
          setPaymentSuccess(true);
          setPaymentMessage(
            'Pembayaran berhasil! Mengarahkan ke halaman konfirmasi...'
          );
          // Langsung arahkan ke halaman sukses, biarkan backend yang bekerja
          navigate(`/success?order_id=${result.order_id}`);
        },
        onPending: (result) => {
          console.log('Payment Pending:', result);
          setOrderId(result.order_id);
          setPaymentMessage(
            `Pembayaran Tertunda. Order ID: ${result.order_id}. Selesaikan pembayaran Anda.`
          );
        },
        onError: (result) => {
          console.error('Payment Error:', result);
          setPaymentMessage(
            `Pembayaran Gagal: ${result.status_message || 'Silakan coba lagi.'}`
          );
          setSnapToken('');
          setOrderId(null);
        },
        onClose: async () => {
          console.log(
            'Customer closed the popup without finishing the payment'
          );
          if (orderId) {
            setPaymentMessage(
              `Anda menutup jendela pembayaran. Order ID: ${orderId}. Klik "Beli Sekarang" untuk melanjutkan.`
            );
          } else {
            setPaymentMessage('Anda menutup jendela pembayaran.');
            setSnapToken('');
            setOrderId(null);
          }
        },
      });
    }
  }, [snapToken, product, quantity, orderId, navigate]);

  // Calculate total price
  const totalPrice = product ? Number(product.harga) * quantity : 0;

  // Render loading state or error message if product is not found/loading
  if (isLoading || !product) {
    return (
      <>
        <Navbar />
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-neutral-50 to-slate-50'>
          <div className='text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-200 shadow-lg'>
            <div className='w-16 h-16 mx-auto mb-4 border-4 border-amber-800 border-t-transparent rounded-full animate-spin'></div>
            <p className='text-xl font-medium text-stone-700'>
              {isLoading
                ? 'Memuat detail produk...'
                : paymentMessage || 'Produk tidak ditemukan.'}
            </p>
          </div>
        </div>
      </>
    );
  }

  // Main render logic for when product data is available
  return (
    <>
      <Navbar />
      <div className='min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-slate-50 py-8'>
        {/* Subtle Batik Pattern Background */}
        <div className='fixed inset-0 opacity-[0.02] pointer-events-none'>
          <div
            className='absolute inset-0 bg-repeat'
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23451a03' fill-opacity='0.4'%3E%3Cpath d='M60 60c0-16.569-13.431-30-30-30s-30 13.431-30 30 13.431 30 30 30 30-13.431 30-30zm30-30c0 16.569 13.431 30 30 30s30-13.431 30-30-13.431-30-30-30-30 13.431-30 30zm0 60c0-16.569-13.431-30-30-30s-30 13.431-30 30 13.431 30 30 30 30-13.431 30-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '120px 120px',
            }}
          />
        </div>

        <div className='relative max-w-2xl mx-auto p-6'>
          {/* Main Product Card */}
          <div className='bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-stone-200'>
            {/* Elegant Header with Batik-inspired Pattern */}
            <div className='h-2 bg-gradient-to-r from-amber-900 via-stone-800 to-amber-900 relative'>
              <div
                className='absolute inset-0 opacity-40'
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='8' viewBox='0 0 20 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z' fill='%23fbbf24'/%3E%3C/svg%3E")`,
                  backgroundSize: '20px 8px',
                }}
              />
            </div>

            <div className='p-8'>
              {/* Product Image */}
              <div className='relative mb-8 group'>
                <div className='relative bg-gradient-to-br from-stone-100 to-neutral-100 rounded-xl p-3 shadow-inner'>
                  <img
                    src={`${VITE_API_URL}/${product.foto}`}
                    alt={product.nama_produk}
                    className='w-full h-80 object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-[1.02]'
                  />
                  {/* Subtle Corner Decoration */}
                  <div className='absolute top-6 right-6 w-3 h-3 bg-amber-800 rounded-full opacity-60'></div>
                  <div className='absolute top-8 right-8 w-2 h-2 bg-stone-600 rounded-full opacity-40'></div>
                </div>
              </div>

              {/* Product Title */}
              <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold text-stone-800 mb-3 tracking-wide'>
                  {product.nama_produk}
                </h1>
                <div className='w-20 h-px bg-gradient-to-r from-transparent via-amber-800 to-transparent mx-auto'></div>
              </div>

              {/* Price & Stock */}
              <div className='flex justify-between items-center mb-8 p-5 bg-gradient-to-r from-stone-100 to-neutral-100 rounded-xl border border-stone-200'>
                <div>
                  <p className='text-sm text-stone-600 font-medium mb-1'>
                    Harga
                  </p>
                  <p className='text-2xl font-bold text-stone-800'>
                    {Number(product.harga).toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-sm text-stone-600 font-medium mb-1'>
                    Stok Tersedia
                  </p>
                  <p className='text-2xl font-bold text-amber-800'>
                    {product.stok}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className='mb-8 p-6 bg-gradient-to-br from-stone-50 to-neutral-50 rounded-xl border border-stone-150'>
                <h3 className='text-lg font-semibold text-stone-800 mb-4 text-center'>
                  Deskripsi Produk
                </h3>
                <p className='text-stone-700 leading-relaxed whitespace-pre-wrap text-center'>
                  {product.deskripsi}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className='mb-8'>
                <label className='block text-stone-800 text-lg font-semibold mb-4 text-center'>
                  Pilih Jumlah
                </label>
                <div className='flex items-center justify-center space-x-4 mb-2'>
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className='w-11 h-11 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-lg shadow-md transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'>
                    −
                  </button>
                  <input
                    type='number'
                    min='1'
                    max={product.stok}
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(parseInt(e.target.value) || 1)
                    }
                    className='w-20 h-11 text-center text-lg font-semibold border-2 border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-amber-800 bg-white text-stone-800'
                  />
                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stok}
                    className='w-11 h-11 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-lg shadow-md transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'>
                    +
                  </button>
                </div>
                <p className='text-sm text-stone-600 text-center font-medium'>
                  Maksimal: {product.stok} item
                </p>
              </div>

              {/* Total Price */}
              <div className='mb-8 p-6 bg-gradient-to-r from-amber-900 to-stone-800 rounded-xl shadow-lg'>
                <div className='flex justify-between items-center text-white'>
                  <span className='text-lg font-semibold'>
                    Total Pembayaran:
                  </span>
                  <span className='text-2xl font-bold'>
                    {totalPrice.toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className='text-amber-100 text-center mt-2 font-medium'>
                  {quantity} ×{' '}
                  {Number(product.harga).toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
              </div>

              {/* Buy Button */}
              <button
                onClick={handleBuyNow}
                disabled={
                  isLoading ||
                  product.stok === 0 ||
                  !window.snap ||
                  !product.id_product ||
                  quantity > product.stok
                }
                className='w-full bg-gradient-to-r from-amber-800 to-stone-800 hover:from-amber-700 hover:to-stone-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transform hover:scale-[1.01] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-800/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg'>
                {isLoading
                  ? '⏳ Memproses Pesanan...'
                  : product.stok === 0
                  ? '😞 Stok Habis'
                  : quantity > product.stok
                  ? '⚠️ Jumlah Melebihi Stok'
                  : paymentSuccess
                  ? '✅ Lanjut ke Halaman Sukses'
                  : snapToken
                  ? '🛒 Lanjutkan Pembayaran'
                  : '🛒 Beli Sekarang'}
              </button>

              {/* Payment Message */}
              {paymentMessage && (
                <div
                  className={`mt-6 p-4 rounded-xl font-medium text-center shadow-md border ${
                    paymentMessage.includes('Gagal') ||
                    paymentMessage.includes('Error')
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : paymentMessage.includes('Berhasil')
                      ? 'bg-green-50 text-green-800 border-green-200'
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}>
                  {paymentMessage}
                </div>
              )}
            </div>

            {/* Elegant Footer */}
            <div className='h-2 bg-gradient-to-r from-stone-800 via-amber-900 to-stone-800 relative'>
              <div
                className='absolute inset-0 opacity-40'
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='8' viewBox='0 0 20 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z' fill='%23fbbf24'/%3E%3C/svg%3E")`,
                  backgroundSize: '20px 8px',
                }}
              />
            </div>
          </div>

          {/* Subtle Decorative Elements */}
          <div className='absolute -top-2 -left-2 w-4 h-4 bg-amber-800 rounded-full opacity-20'></div>
          <div className='absolute -top-1 -right-3 w-3 h-3 bg-stone-600 rounded-full opacity-15'></div>
          <div className='absolute -bottom-2 -left-3 w-3 h-3 bg-amber-800 rounded-full opacity-15'></div>
          <div className='absolute -bottom-1 -right-2 w-4 h-4 bg-stone-600 rounded-full opacity-20'></div>
        </div>
      </div>
    </>
  );
};

export default DetailProduct;
