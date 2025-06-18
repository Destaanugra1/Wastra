const VITE_API_URL = import.meta.env.VITE_API_URL;

/**
 * Membuat transaksi pembayaran di backend.
 * @param {object} orderData - Data pesanan untuk dikirim ke server.
 * @returns {Promise<object>} - Respons dari server yang berisi snap_token.
 */
export const createPaymentTransaction = async (orderData) => {
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
      errMsg = typeof responseData.errors === 'object'
        ? Object.values(responseData.errors).join(', ')
        : responseData.errors;
    } else if (responseData.message) {
      errMsg = responseData.message;
    }
    throw new Error(errMsg);
  }

  if (!responseData.snap_token) {
    throw new Error('Token pembayaran tidak diterima dari server.');
  }

  return responseData;
};

/**
 * Mengupdate stok produk setelah penjualan.
 * @param {string} productId - ID produk yang terjual.
 * @param {number} quantitySold - Jumlah produk yang terjual.
 */
export const updateProductStock = async (productId, quantitySold) => {
  const response = await fetch(`${VITE_API_URL}/api/products/${productId}/stock`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quantity_sold: quantitySold,
    }),
  });

  if (!response.ok) {
    throw new Error('Gagal mengupdate stok produk.');
  }

  console.log('Stok produk berhasil diupdate');
  return await response.json();
};