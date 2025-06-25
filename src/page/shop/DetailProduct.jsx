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
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='text-center p-8 bg-white rounded-lg shadow-lg'>
            <div className='w-16 h-16 mx-auto mb-4 border-4 border-red-500 border-t-transparent rounded-full animate-spin'></div>
            <p className='text-xl font-medium text-gray-700'>
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
      <div className='min-h-screen bg-gray-50'>
        {/* Breadcrumb */}
        <div className='bg-white border-b'>
        </div>

        <div className='max-w-7xl mx-auto px-4 py-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Product Image */}
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <div className='aspect-square bg-gray-100 rounded-lg mb-4'>
                <img
                  src={`${VITE_API_URL}/${product.foto}`}
                  alt={product.nama_produk}
                  className='w-full h-full object-cover rounded-lg'
                />
              </div>
            </div>

            {/* Product Info */}
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h1 className='text-2xl font-bold text-gray-900 mb-4'>
                {product.nama_produk}
              </h1>
              
              {/* Price */}
              <div className='mb-6'>
                <div className='flex items-center space-x-2 mb-2'>
                  <span className='text-sm text-red-500 line-through'>
                    IDR 599.000
                  </span>
                </div>
                <div className='text-2xl font-bold text-gray-900'>
                  {Number(product.harga).toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
              </div>

              {/* Options */}
              <div className='mb-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>Options</h3>
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Size
                  </label>
                  <select className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'>
                    <option>Select Size</option>
                    <option>S</option>
                    <option>M</option>
                    <option>L</option>
                    <option>XL</option>
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div className='mb-6'>
                <div className='flex items-center space-x-4'>
                  <span className='text-sm font-medium text-gray-700'>QTY</span>
                  <div className='flex items-center border border-gray-300 rounded-md'>
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className='px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50'
                    >
                      -
                    </button>
                    <input
                      type='number'
                      min='1'
                      max={product.stok}
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value) || 1)
                      }
                      className='w-16 px-2 py-1 text-center border-l border-r border-gray-300 focus:outline-none'
                    />
                    <button
                      onClick={increaseQuantity}
                      disabled={quantity >= product.stok}
                      className='px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50'
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleBuyNow}
                    disabled={
                      isLoading ||
                      product.stok === 0 ||
                      !window.snap ||
                      !product.id_product ||
                      quantity > product.stok
                    }
                    className='bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isLoading
                      ? 'Memproses...'
                      : product.stok === 0
                      ? 'STOK HABIS'
                      : quantity > product.stok
                      ? 'Melebihi Stok'
                      : paymentSuccess
                      ? 'Lanjut ke Sukses'
                      : snapToken
                      ? 'Lanjutkan Pembayaran'
                      : 'Beli Sekarang'}
                  </button>
                </div>
              </div>

              {/* Stock Info */}
              <div className='mb-6'>
                <p className='text-sm text-gray-600'>
                  Stok tersedia: <span className='font-medium'>{product.stok}</span>
                </p>
              </div>

              {/* Description */}
              {product.deskripsi && (
                <div className='mb-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                    Deskripsi Produk
                  </h3>
                  <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                    {product.deskripsi}
                  </p>
                </div>
              )}

              {/* Total Price Display */}
              <div className='bg-gray-50 p-4 rounded-lg'>
                <div className='flex justify-between items-center'>
                  <span className='text-lg font-semibold text-gray-900'>
                    Total Pembayaran:
                  </span>
                  <span className='text-xl font-bold text-gray-900'>
                    {totalPrice.toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className='text-sm text-gray-600 text-right mt-1'>
                  {quantity} ×{' '}
                  {Number(product.harga).toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
              </div>

              {/* Payment Message */}
              {paymentMessage && (
                <div
                  className={`mt-4 p-4 rounded-lg font-medium text-center ${
                    paymentMessage.includes('Gagal') ||
                    paymentMessage.includes('Error')
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : paymentMessage.includes('Berhasil')
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}
                >
                  {paymentMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailProduct;