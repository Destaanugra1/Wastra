import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getProductById } from '../../service/Product';
import { useCart } from '../../context/CartContext';

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
  const [addingToCart, setAddingToCart] = useState(false);

  const { handleAddToCart, cartItems } = useCart();

  const VITE_API_URL = import.meta.env.VITE_API_URL;
  const VITE_MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
  const VITE_MIDTRANS_ENV = import.meta.env.VITE_MIDTRANS_ENV || 'sandbox';

  // Clean up URL parameters to prevent unwanted redirects
  useEffect(() => {
    const currentUrl = new URL(window.location);
    if (currentUrl.searchParams.has('order_id') || 
        currentUrl.searchParams.has('status_code') || 
        currentUrl.searchParams.has('transaction_status')) {
      // Clear any query parameters that might cause redirects
      currentUrl.search = '';
      window.history.replaceState({}, '', currentUrl.toString());
    }
  }, []);

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
  const updateProductStock = useCallback(
    async (productId, quantitySold) => {
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
    },
    [VITE_API_URL]
  );

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

  // Function to handle add to cart
  const handleAddToCartWithQuantity = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      // Gunakan quantity yang sudah dipilih user
      for (let i = 0; i < quantity; i++) {
        await handleAddToCart(product);
      }
      setPaymentMessage(`Berhasil menambahkan ${quantity} item ke keranjang!`);
      setTimeout(() => setPaymentMessage(''), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setPaymentMessage('Gagal menambahkan ke keranjang. Silakan coba lagi.');
      setTimeout(() => setPaymentMessage(''), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  // Function to get cart quantity for this product
  const getCartQuantity = () => {
    if (!product || !cartItems) return 0;
    const cartItem = cartItems.find(
      (item) => item.product_id === product.id_product
    );
    return cartItem ? Number(cartItem.jumlah) : 0;
  };

  // Function to handle redirect to success page
  const handleGoToSuccess = () => {
    if (paymentSuccess && orderId) {
      navigate(`/success?order_id=${orderId}`);
    }
  };

  // Function to handle buy now
  const handleBuyNow = async () => {
    // Reset payment success state when starting a new purchase
    if (!snapToken) {
      setPaymentSuccess(false);
    }

    // If payment was already successful, show option to go to success page
    if (paymentSuccess && orderId) {
      setPaymentMessage('Pembayaran telah berhasil! Klik "Lanjut ke Sukses" untuk melihat detail pesanan.');
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
      
      // Add a flag to track if payment window is still active
      let paymentWindowClosed = false;
      let redirectTimeout = null;
      
      window.snap.pay(snapToken, {
        onSuccess: async (result) => {
          // Only process if payment window wasn't closed manually
          if (!paymentWindowClosed) {
            // Only mark as successful if the transaction status is success/settlement/capture
            if (
              result.transaction_status === 'settlement' ||
              result.transaction_status === 'capture' ||
              result.transaction_status === 'success'
            ) {
              // Pastikan update stok dan status pembayaran dilakukan dengan benar
              await updateProductStock(product.id_product, quantity);
              setPaymentSuccess(true);
              setPaymentMessage(
                'Pembayaran berhasil! Stok produk telah diperbarui.'
              );
              // Auto redirect to success page after 2 seconds
              redirectTimeout = setTimeout(() => {
                if (!paymentWindowClosed) {
                  navigate(`/success?order_id=${result.order_id}`);
                }
              }, 2000);
            } else {
              // For pending payments
              setPaymentSuccess(false);
              setPaymentMessage(
                `Pembayaran masih dalam proses. Order ID: ${result.order_id}. Silakan selesaikan pembayaran Anda.`
              );
            }
          }
        },
        onPending: (result) => {
          // Only process if payment window wasn't closed manually
          if (!paymentWindowClosed) {
            // Menangani status pending
            setOrderId(result.order_id);
            setPaymentSuccess(false); // Make sure payment is marked as not successful
            setPaymentMessage(
              `Pembayaran Tertunda. Order ID: ${result.order_id}. Selesaikan pembayaran Anda dengan transfer ke nomor virtual account yang telah diberikan.`
            );
            // Tidak ada redirect, tetap di halaman produk
            console.log('Payment is pending, orderId saved:', result.order_id);
          }
        },
        onError: (result) => {
          // Only process if payment window wasn't closed manually
          if (!paymentWindowClosed) {
            setPaymentMessage(
              `Pembayaran Gagal: ${result.status_message || 'Silakan coba lagi.'}`
            );
            setSnapToken('');
            setOrderId(null);
          }
        },
        onClose: async () => {
          // Set flag to indicate payment window was closed manually
          paymentWindowClosed = true;
          
          // Clear any pending redirects
          if (redirectTimeout) {
            clearTimeout(redirectTimeout);
            redirectTimeout = null;
          }
          
          // Treat closing as a cancellation - reset everything
          setPaymentSuccess(false);
          setPaymentMessage(
            'Anda membatalkan pembayaran. Klik "Beli Sekarang" untuk mencoba lagi.'
          );
          
          // Always reset snapToken and orderId when user closes the window
          setSnapToken('');
          setOrderId(null);

          // No need to check status or redirect - just stay on the product page
          console.log('Payment cancelled by user (window closed)');
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
        is_direct_buy: true, // Menandai bahwa ini adalah pembelian langsung
      };

      console.log('Order Data:', orderData);

      try {
        const response = await fetch(`${VITE_API_URL}/api/payment/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        // Log the raw response for debugging
        const rawResponse = await response.text();
        console.log('Raw Server Response:', rawResponse);

        // Try to parse the response as JSON
        let responseData;
        try {
          responseData = JSON.parse(rawResponse);
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
          throw new Error(
            `Server returned invalid JSON response: ${rawResponse.substring(
              0,
              100
            )}...`
          );
        }

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
        console.error('API Request Error:', error);
        throw error;
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
      setPaymentSuccess(false); // Reset payment success state when opening payment window
      
      // Add a flag to track if payment window is still active
      let paymentWindowClosed = false;
      let redirectTimeout = null;
      
      window.snap.pay(snapToken, {
        onSuccess: (result) => {
          console.log('Pembayaran sukses, memproses konfirmasi...', result);
          
          // Only process if payment window wasn't closed manually
          if (!paymentWindowClosed) {
            // Only mark as successful if the transaction status is success/settlement/capture
            if (
              result.transaction_status === 'settlement' ||
              result.transaction_status === 'capture' ||
              result.transaction_status === 'success'
            ) {
              setPaymentSuccess(true);
              setPaymentMessage(
                'Pembayaran berhasil! Pesanan Anda akan segera diproses.'
              );
              // Update product stock
              if (product && product.id_product) {
                updateProductStock(product.id_product, quantity);
              }
              // Auto redirect to success page after 2 seconds
              redirectTimeout = setTimeout(() => {
                if (!paymentWindowClosed) {
                  navigate(`/success?order_id=${result.order_id}`);
                }
              }, 2000);
            } else {
              // For pending payments
              setPaymentSuccess(false);
              setPaymentMessage(
                `Pembayaran masih dalam proses. Order ID: ${result.order_id}. Silakan selesaikan pembayaran Anda.`
              );
            }
          }
        },
        onPending: (result) => {
          console.log('Payment Pending:', result);
          // Only process if payment window wasn't closed manually
          if (!paymentWindowClosed) {
            setOrderId(result.order_id);
            setPaymentSuccess(false); // Make sure payment is marked as not successful
            setPaymentMessage(
              `Pembayaran Tertunda. Order ID: ${result.order_id}. Silakan lakukan pembayaran dengan transfer ke nomor virtual account yang diberikan.`
            );
            // Don't redirect, stay on product page
            console.log('Payment is pending, orderId saved:', result.order_id);
          }
        },
        onError: (result) => {
          console.error('Payment Error:', result);
          // Only process if payment window wasn't closed manually
          if (!paymentWindowClosed) {
            setPaymentMessage(
              `Pembayaran Gagal: ${result.status_message || 'Silakan coba lagi.'}`
            );
            setSnapToken('');
            setOrderId(null);
          }
        },
        onClose: async () => {
          console.log(
            'Customer closed the popup without finishing the payment'
          );
          
          // Set flag to indicate payment window was closed manually
          paymentWindowClosed = true;
          
          // Clear any pending redirects
          if (redirectTimeout) {
            clearTimeout(redirectTimeout);
            redirectTimeout = null;
          }
          
          // Always assume payment is not successful when window is closed
          setPaymentSuccess(false);
          
          // Always reset everything when user closes the window
          setPaymentMessage(
            'Anda membatalkan pembayaran. Klik "Beli Sekarang" untuk mencoba lagi.'
          );
          setSnapToken('');
          setOrderId(null);
        },
      });
    }
  }, [snapToken, product, quantity, orderId, updateProductStock, VITE_API_URL, navigate]);

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
        <div className='bg-white border-b'></div>

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
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  Options
                </h3>
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
                      className='px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50'>
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
                      className='px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50'>
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='mb-6'>
                <div className='flex gap-3'>
                  <button
                    onClick={handleAddToCartWithQuantity}
                    disabled={
                      addingToCart ||
                      product.stok === 0 ||
                      quantity > product.stok
                    }
                    className='flex-1 bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-800 hover:to-yellow-800 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300'>
                    {addingToCart
                      ? 'Menambahkan...'
                      : product.stok === 0
                      ? 'STOK HABIS'
                      : quantity > product.stok
                      ? 'Melebihi Stok'
                      : `Tambah ke Keranjang${
                          getCartQuantity() > 0 ? ` (${getCartQuantity()})` : ''
                        }`}
                  </button>
                  <button
                    onClick={paymentSuccess ? handleGoToSuccess : handleBuyNow}
                    disabled={
                      isLoading ||
                      product.stok === 0 ||
                      !window.snap ||
                      !product.id_product ||
                      quantity > product.stok
                    }
                    className='flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed'>
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
                  Stok tersedia:{' '}
                  <span className='font-medium'>{product.stok}</span>
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
                  }`}>
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
