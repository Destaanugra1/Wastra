import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { listProduct } from '../../service/Product';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const VITE_API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await listProduct();
        console.log('Products response:', response.data);

        if (response.data && response.data.status === 'success') {
          setProducts(response.data.data || []);
        } else {
          throw new Error(
            response.data?.message || 'Gagal mengambil daftar produk'
          );
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='text-center p-8 bg-white rounded-lg shadow-lg'>
            <div className='w-16 h-16 mx-auto mb-4 border-4 border-red-500 border-t-transparent rounded-full animate-spin'></div>
            <p className='text-xl font-medium text-gray-700'>
              Memuat produk...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='text-center p-8 bg-white rounded-lg shadow-lg'>
            <p className='text-xl font-medium text-red-600'>Error: {error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className='min-h-screen bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          <h1
            className='text-3xl font-bold text-gray-900 mb-8'
            data-aos='fade-up'>
            Toko Produk
          </h1>

          {products.length === 0 ? (
            <div className='text-center py-12' data-aos='fade-up'>
              <p className='text-gray-600 text-lg'>Belum ada produk tersedia</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {products.map((product, index) => (
                <div
                  key={product.id_product}
                  className='bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300'
                  data-aos='fade-up'
                  data-aos-delay={index * 100}>
                  <Link to={`/product/${product.id_product}`}>
                    <div className='aspect-square bg-gray-100 rounded-t-lg overflow-hidden'>
                      <img
                        src={`${VITE_API_URL}/${product.foto}`}
                        alt={product.nama_produk}
                        className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    <div className='p-4'>
                      <h3 className='font-semibold text-gray-900 mb-2 line-clamp-2'>
                        {product.nama_produk}
                      </h3>
                      <p className='text-2xl font-bold text-gray-900 mb-2'>
                        {Number(product.harga).toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </p>
                      <div className='flex justify-between items-center text-sm text-gray-600'>
                        <span>Stok: {product.stok}</span>
                        <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                          {product.kategori || 'Umum'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Product;
