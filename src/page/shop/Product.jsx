import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { listProduct } from '../../service/Product';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingCart } from 'lucide-react';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addLoadingId, setAddLoadingId] = useState(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);

  const { handleAddToCart, cartItems } = useCart();

  // Carousel banners
  const banners = [
    {
      id: 1,
      title: 'Koleksi Terbaru',
      subtitle: 'Temukan produk eksklusif dengan kualitas terbaik',
      image:
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
      bgColor: 'from-amber-800 to-yellow-800',
    },
    {
      id: 2,
      title: 'Promo Spesial',
      subtitle: 'Diskon hingga 50% untuk produk pilihan',
      image:
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
      bgColor: 'from-yellow-800 to-amber-900',
    },
    {
      id: 3,
      title: 'Kualitas Premium',
      subtitle: 'Produk berkualitas tinggi dengan harga terjangkau',
      image:
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=400&fit=crop',
      bgColor: 'from-amber-900 to-yellow-900',
    },
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await listProduct();
        const productsData = res.data.data || [];
        setProducts(productsData);

        // Set max price for range slider
        if (productsData.length > 0) {
          const maxPriceValue = Math.max(
            ...productsData.map((p) => Number(p.harga))
          );
          setMaxPrice(maxPriceValue);
          setPriceRange([0, maxPriceValue]);
        }
      } catch (err) {
        console.log(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Filter by category (PASTIKAN FIELDNYA SAMA DENGAN YANG DI ADMIN, misal 'category' atau 'nama_category')
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (product) =>
          (product.category || product.nama_category) &&
          ((product.category &&
            product.category.toLowerCase() ===
              selectedCategory.toLowerCase()) ||
            (product.nama_category &&
              product.nama_category.toLowerCase() ===
                selectedCategory.toLowerCase()))
      );
    }

    // Filter by price range
    filtered = filtered.filter((product) => {
      const price = Number(product.harga);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return Number(a.harga) - Number(b.harga);
        case 'price-high':
          return Number(b.harga) - Number(a.harga);
        case 'name':
          return a.nama_produk.localeCompare(b.nama_produk);
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, priceRange, sortBy]);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const getCartQuantity = (productId) => {
    const cartItem = cartItems.find((item) => item.product_id === productId);
    return cartItem ? Number(cartItem.jumlah) : 0;
  };

  const handleAdd = async (item) => {
    if (addLoadingId === item.id_product) return;
    setAddLoadingId(item.id_product);
    await handleAddToCart(item);
    setAddLoadingId(null);
  };

  // Get unique categories (PASTIKAN FIELDNYA SAMA DENGAN YANG DI ADMIN)
  const categories = [
    'all',
    ...Array.from(
      new Set(
        products.map((p) => p.category || p.nama_category).filter(Boolean)
      )
    ),
  ];

  const formatPrice = (price) => {
    return Number(price).toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <>
      <Navbar />

      {/* Hero Carousel */}
      <div className='relative h-96 overflow-hidden'>
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
              index === currentSlide
                ? 'translate-x-0'
                : index < currentSlide
                ? '-translate-x-full'
                : 'translate-x-full'
            }`}>
            <div
              className={`w-full h-full bg-gradient-to-r ${banner.bgColor} relative`}>
              <div
                className='absolute inset-0 bg-cover bg-center opacity-30'
                style={{ backgroundImage: `url(${banner.image})` }}
              />
              <div className='relative z-10 container mx-auto px-4 h-full flex items-center'>
                <div className='text-white max-w-2xl'>
                  <h1 className='text-5xl font-bold mb-4'>{banner.title}</h1>
                  <p className='text-xl mb-8 opacity-90'>{banner.subtitle}</p>
                  <button className='bg-white text-amber-900 px-8 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors'>
                    Jelajahi Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Indicators */}
        <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2'>
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Carousel Navigation */}
        <button
          onClick={() =>
            setCurrentSlide(
              (prev) => (prev - 1 + banners.length) % banners.length
            )
          }
          className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors'>
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M15 19l-7-7 7-7'
            />
          </svg>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
          className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors'>
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M9 5l7 7-7 7'
            />
          </svg>
        </button>
      </div>

      <div className='container mx-auto px-4 py-8'>
        {/* Filters Section */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-8 border border-amber-100'>
          <div className='flex flex-wrap items-center gap-6'>
            {/* Category Filter */}
            <div className='flex-1 min-w-64'>
              <label className='block text-sm font-medium text-amber-900 mb-2'>
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className='w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600'>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Semua Kategori' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className='flex-1 min-w-64'>
              <label className='block text-sm font-medium text-amber-900 mb-2'>
                Range Harga: {formatPrice(priceRange[0])} -{' '}
                {formatPrice(priceRange[1])}
              </label>
              <div className='px-2'>
                <input
                  type='range'
                  min='0'
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
                  className='w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer slider'
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className='flex-1 min-w-48'>
              <label className='block text-sm font-medium text-amber-900 mb-2'>
                Urutkan
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className='w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600'>
                <option value='name'>Nama A-Z</option>
                <option value='price-low'>Harga Terendah</option>
                <option value='price-high'>Harga Tertinggi</option>
                <option value='newest'>Terbaru</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className='flex items-center space-x-2'>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid'
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-gray-400 hover:text-gray-600'
                }`}>
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'>
                  <path d='M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list'
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-gray-400 hover:text-gray-600'
                }`}>
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className='flex justify-between items-center mb-6'>
          <p className='text-gray-600'>
            Menampilkan {filteredProducts.length} dari {products.length} produk
          </p>
          <div className='text-sm text-gray-500'>
            {selectedCategory !== 'all' && `Kategori: ${selectedCategory} • `}
            {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className='text-center py-20'>
            <div className='relative'>
              <div className='animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-800 mx-auto'></div>
              <div className='absolute inset-0 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 opacity-20 animate-pulse'></div>
            </div>
            <p className='mt-6 text-lg font-medium text-amber-800'>
              Memuat koleksi terbaru...
            </p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
                : 'space-y-4'
            }>
            {filteredProducts.map((item) => {
              const cartQuantity = getCartQuantity(item.id_product);

              if (viewMode === 'list') {
                return (
                  <div
                    key={item.id_product}
                    className='bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-100 flex'>
                    <div className='w-48 h-48 flex-shrink-0'>
                      <img
                        src={`${import.meta.env.VITE_API_URL}/${item.foto}`}
                        alt={item.nama_produk}
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <div className='flex-1 p-6 flex flex-col justify-between'>
                      <div>
                        <h3 className='text-xl font-bold text-gray-800 mb-2'>
                          {item.nama_produk}
                        </h3>
                        <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                          {item.deskripsi}
                        </p>
                        <div className='flex items-center gap-4 mb-4'>
                          <span className='text-2xl font-bold text-amber-800'>
                            {formatPrice(item.harga)}
                          </span>
                          <div className='flex items-center gap-1'>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                item.stok > 10
                                  ? 'bg-green-400'
                                  : item.stok > 0
                                  ? 'bg-yellow-400'
                                  : 'bg-red-400'
                              }`}></div>
                            <span className='text-xs text-gray-500'>
                              {item.stok > 10
                                ? 'Tersedia'
                                : item.stok > 0
                                ? `Sisa ${item.stok}`
                                : 'Habis'}
                            </span>
                          </div>
                          {cartQuantity > 0 && (
                            <span className='bg-amber-100 text-amber-900 text-xs px-2 py-1 rounded-full'>
                              {cartQuantity} di keranjang
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='flex gap-3'>
                        <button
                          onClick={() => handleAdd(item)}
                          disabled={
                            item.stok === 0 ||
                            cartQuantity >= item.stok ||
                            addLoadingId === item.id_product
                          }
                          className='flex-1 bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-800 hover:to-yellow-800 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed'>
                          {addLoadingId === item.id_product
                            ? 'Menambah...'
                            : item.stok === 0
                            ? 'Habis'
                            : cartQuantity >= item.stok
                            ? 'Maksimal'
                            : 'Tambah ke Keranjang'}
                        </button>
                        <Link
                          to={`/product/${item.id_product}`}
                          className='px-4 py-2 border border-amber-700 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors'>
                          Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }
              // Grid view (original card design with minor updates)
              return (
                <div
                  key={item.id_product}
                  className='group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-amber-100 hover:border-amber-200 transform hover:-translate-y-2'>
                  <div className='absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-amber-100 z-10'></div>

                  <div className='relative overflow-hidden rounded-t-2xl'>
                    <img
                      src={`${import.meta.env.VITE_API_URL}/${item.foto}`}
                      alt={item.nama_produk}
                      className='w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                    {cartQuantity > 0 && (
                      <div className='absolute top-3 left-3 bg-gradient-to-r from-amber-700 to-yellow-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse'>
                        <span className='flex items-center gap-1'>
                          <svg
                            className='w-3 h-3'
                            fill='currentColor'
                            viewBox='0 0 20 20'>
                            <path d='M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' />
                          </svg>
                          {cartQuantity}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className='p-6 flex-grow'>
                    <h2 className='text-xl font-bold text-gray-800 mb-2 group-hover:text-amber-800 transition-colors duration-300 line-clamp-1'>
                      {item.nama_produk}
                    </h2>
                    <div className='flex items-center gap-2 mb-3'>
                      <span className='text-2xl font-bold bg-gradient-to-r from-amber-800 to-yellow-800 bg-clip-text text-transparent'>
                        {formatPrice(item.harga)}
                      </span>
                    </div>
                    <p className='text-gray-600 text-sm leading-relaxed line-clamp-2'>
                      {item.deskripsi}
                    </p>

                    <div className='mt-3 flex items-center gap-2'>
                      <div className='flex items-center gap-1'>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.stok > 10
                              ? 'bg-green-400'
                              : item.stok > 0
                              ? 'bg-yellow-400'
                              : 'bg-red-400'
                          }`}></div>
                        <span className='text-xs text-gray-500'>
                          {item.stok > 10
                            ? 'Stok tersedia'
                            : item.stok > 0
                            ? `Sisa ${item.stok}`
                            : 'Habis'}
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
                      className='w-full bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-800 hover:to-yellow-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transform active:scale-95 shadow-lg hover:shadow-xl'>
                      {addLoadingId === item.id_product ? (
                        <span className='flex items-center justify-center gap-2'>
                          <svg
                            className='animate-spin w-4 h-4'
                            fill='none'
                            viewBox='0 0 24 24'>
                            <circle
                              cx='12'
                              cy='12'
                              r='10'
                              stroke='currentColor'
                              strokeWidth='4'
                              className='opacity-25'></circle>
                            <path
                              fill='currentColor'
                              d='m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                              className='opacity-75'></path>
                          </svg>
                          Menambah...
                        </span>
                      ) : item.stok === 0 ? (
                        'Stok Habis'
                      ) : cartQuantity >= item.stok ? (
                        'Maksimal di Keranjang'
                      ) : (
                        <span className='flex items-center justify-center gap-2'>
                          <ShoppingCart />
                        </span>
                      )}
                    </button>

                    <Link
                      to={`/product/${item.id_product}`}
                      className='block text-center text-amber-800 hover:text-amber-900 font-medium text-sm py-2 hover:bg-amber-50 rounded-lg transition-all duration-300 border border-amber-300 hover:border-amber-400'>
                      Lihat Detail →
                    </Link>
                  </div>

                  <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 opacity-50'></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className='text-center py-20'>
            <div className='w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center'>
              <svg
                className='w-12 h-12 text-amber-800'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
            <h3 className='text-2xl font-bold text-gray-700 mb-2'>
              Tidak Ada Produk
            </h3>
            <p className='text-gray-500 mb-4'>
              Tidak ditemukan produk dengan filter yang dipilih
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setPriceRange([0, maxPrice]);
              }}
              className='px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors'>
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Custom CSS for range slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #92400e;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #92400e;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  );
};

export default Product;