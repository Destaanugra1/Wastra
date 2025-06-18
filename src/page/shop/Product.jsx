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
      {/* Hero Section dengan motif batik subtle */}
      <div className='relative bg-gradient-to-r from-amber-50 to-orange-50 overflow-hidden'>
        <div className='absolute inset-0 opacity-5'>
          <svg width="100%" height="100%" viewBox="0 0 200 200" className='repeat'>
            <defs>
              <pattern id="batik-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="#8B4513"/>
                <circle cx="10" cy="10" r="1" fill="#A0522D"/>
                <circle cx="30" cy="30" r="1" fill="#A0522D"/>
                <path d="M5,5 Q10,10 15,5 T25,5" stroke="#8B4513" strokeWidth="0.5" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#batik-pattern)"/>
          </svg>
        </div>
        
        <div className='container mx-auto px-4 py-12 relative z-10'>
          <div className='text-center'>
            <h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-4'>
              Koleksi Produk Kami
            </h1>
            <p className='text-lg text-amber-700 max-w-2xl mx-auto leading-relaxed'>
              Temukan keindahan tradisi dalam setiap produk berkualitas tinggi dengan sentuhan modern
            </p>
            <div className='mt-6 w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-600 mx-auto rounded-full'></div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8 min-h-screen'>
        {loading ? (
          <div className='text-center py-20'>
            <div className='relative'>
              <div className='animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-600 mx-auto'></div>
              <div className='absolute inset-0 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 opacity-20 animate-pulse'></div>
            </div>
            <p className='mt-6 text-lg font-medium text-amber-700'>Memuat koleksi terbaru...</p>
            <div className='mt-2 flex justify-center space-x-1'>
              <div className='w-2 h-2 bg-amber-400 rounded-full animate-bounce'></div>
              <div className='w-2 h-2 bg-amber-500 rounded-full animate-bounce' style={{animationDelay: '0.1s'}}></div>
              <div className='w-2 h-2 bg-amber-600 rounded-full animate-bounce' style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
            {products.map((item) => {
              const cartQuantity = getCartQuantity(item.id_product);
              return (
                <div key={item.id_product} className='group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-amber-100 hover:border-amber-200 transform hover:-translate-y-2'>
                  {/* Decorative corner */}
                  <div className='absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-amber-100 z-10'></div>
                  
                  <div className='relative overflow-hidden rounded-t-2xl'>
                    <img 
                      src={`${import.meta.env.VITE_API_URL}/${item.foto}`} 
                      alt={item.nama_produk} 
                      className='w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700' 
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                    
                    {cartQuantity > 0 && (
                      <div className='absolute top-3 left-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse'>
                        <span className='flex items-center gap-1'>
                          <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                            <path d='M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z'/>
                          </svg>
                          {cartQuantity}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className='p-6 flex-grow'>
                    <h2 className='text-xl font-bold text-gray-800 mb-2 group-hover:text-amber-700 transition-colors duration-300 line-clamp-1'>
                      {item.nama_produk}
                    </h2>
                    <div className='flex items-center gap-2 mb-3'>
                      <span className='text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent'>
                        {Number(item.harga).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <p className='text-gray-600 text-sm leading-relaxed line-clamp-2'>{item.deskripsi}</p>
                    
                    {/* Stock indicator */}
                    <div className='mt-3 flex items-center gap-2'>
                      <div className='flex items-center gap-1'>
                        <div className={`w-2 h-2 rounded-full ${item.stok > 10 ? 'bg-green-400' : item.stok > 0 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                        <span className='text-xs text-gray-500'>
                          {item.stok > 10 ? 'Stok tersedia' : item.stok > 0 ? `Sisa ${item.stok}` : 'Habis'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className='p-6 pt-0 space-y-3'>
                    <button
                      onClick={() => handleAdd(item)}
                      disabled={
                        item.stok === 0 ||
                        cartQuantity >= item.stok ||
                        addLoadingId === item.id_product
                      }
                      className='w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transform active:scale-95 shadow-lg hover:shadow-xl'
                    >
                      {addLoadingId === item.id_product ? (
                        <span className='flex items-center justify-center gap-2'>
                          <svg className='animate-spin w-4 h-4' fill='none' viewBox='0 0 24 24'>
                            <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' className='opacity-25'></circle>
                            <path fill='currentColor' d='m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' className='opacity-75'></path>
                          </svg>
                          Menambah...
                        </span>
                      ) : item.stok === 0 ? (
                        'Stok Habis'
                      ) : cartQuantity >= item.stok ? (
                        'Maksimal di Keranjang'
                      ) : (
                        <span className='flex items-center justify-center gap-2'>
                          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                            <path d='M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z'/>
                          </svg>
                          Tambah ke Keranjang
                        </span>
                      )}
                    </button>
                    
                    <Link 
                      to={`/product/${item.id_product}`} 
                      className='block text-center text-amber-700 hover:text-amber-800 font-medium text-sm py-2 hover:bg-amber-50 rounded-lg transition-all duration-300 border border-amber-200 hover:border-amber-300'
                    >
                      Lihat Detail →
                    </Link>
                  </div>
                  
                  {/* Subtle batik pattern overlay */}
                  <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200 opacity-50'></div>
                </div>
              );
            })}
          </div>
        )}
        
        {!loading && products.length === 0 && (
          <div className='text-center py-20'>
            <div className='w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center'>
              <svg className='w-12 h-12 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'/>
              </svg>
            </div>
            <h3 className='text-2xl font-bold text-gray-700 mb-2'>Belum Ada Produk</h3>
            <p className='text-gray-500'>Koleksi produk akan segera hadir untuk Anda</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Product;