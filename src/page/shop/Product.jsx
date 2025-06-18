import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { listProduct } from '../../service/Product';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Tambahkan loading per produk
  const [addLoadingId, setAddLoadingId] = useState(null);

  const { handleAddToCart, cartItems } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await listProduct();
        setProducts(res.data.data || []);
      } catch (err) {
        console.log(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, []);

  const getCartQuantity = (productId) => {
    const cartItem = cartItems.find((item) => item.product_id === productId);
    return cartItem ? Number(cartItem.jumlah) : 0;
  };

  const handleAdd = async (item) => {
    if (addLoadingId === item.id_product) return; // cegah double klik
    setAddLoadingId(item.id_product);
    await handleAddToCart(item);
    setAddLoadingId(null);
  };

  return (
    <>
      <Navbar />
      <div className='container mx-auto px-4 py-8 min-h-screen'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>Produk Kami</h1>
          <p className='text-gray-600'>
            Temukan berbagai produk berkualitas untuk kebutuhan Anda
          </p>
        </div>

        {loading ? (
          <div className='text-center py-20'>
            <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-[#5a3b24] mx-auto'></div>
            <p className='mt-4 text-lg font-semibold text-gray-600'>Memuat produk...</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {products.map((item) => {
              const cartQuantity = getCartQuantity(item.id_product);
              return (
                <div key={item.id_product} className='bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col'>
                  <div className='relative overflow-hidden'>
                    <img src={`${import.meta.env.VITE_API_URL}/${item.foto}`} alt={item.nama_produk} className='w-full h-48 object-cover hover:scale-105 transition-transform duration-300' />
                    {cartQuantity > 0 && (
                      <div className='absolute top-2 right-2 bg-[#5a3b24] text-white text-xs font-semibold px-2 py-1 rounded-full'>
                        {cartQuantity} di keranjang
                      </div>
                    )}
                  </div>
                  <div className='p-4 flex-grow'>
                    <h2 className='text-lg font-bold text-gray-800 truncate'>{item.nama_produk}</h2>
                    <p className='text-[#5a3b24] font-semibold text-lg'>
                      {Number(item.harga).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <p className='text-gray-600 text-sm mt-1'>{item.deskripsi}</p>
                  </div>
                  <div className='p-4 border-t border-gray-200 flex items-center justify-between mt-auto'>
                    <button
                      onClick={() => handleAdd(item)}
                      disabled={
                        item.stok === 0 ||
                        cartQuantity >= item.stok ||
                        addLoadingId === item.id_product // <-- Loading per produk
                      }
                      className='bg-[#5a3b24] text-white px-4 py-2 rounded-lg hover:bg-[#4a2f1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {addLoadingId === item.id_product
                        ? 'Menambah...'
                        : item.stok === 0
                        ? 'Stok Habis'
                        : cartQuantity >= item.stok
                        ? 'Maks. di Keranjang'
                        : 'Tambahkan ke Keranjang'}
                    </button>
                    <Link to={`/product/${item.id_product}`} className='text-[#5a3b24] hover:underline text-sm'>
                      Detail Produk
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Product;
