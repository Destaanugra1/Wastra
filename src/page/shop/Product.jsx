import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { generateProductSlug } from '../../lib/productSlug';

import Pagination from '../../components/Pagination';
import SearchAndFilter from '../../components/SearchAndFilter';
import {
  listProductPaginated,
  getProductCategories,
} from '../../service/Product';
import { Component } from '../../components/Banner';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 12,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  });

  const [searchParams, setSearchParams] = useSearchParams();

  // Memoized function to update URL params
  const updateUrlParams = useCallback(
    (page, search, category_id) => {
      const params = new URLSearchParams();
      if (page > 1) params.set('page', page.toString());
      if (search) params.set('search', search);
      if (category_id) params.set('category_id', category_id);

      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  const [filters, setFilters] = useState(() => {
    const searchParam = searchParams.get('search') || '';
    const categoryParam = searchParams.get('category_id') || '';

    return {
      page: parseInt(searchParams.get('page')) || 1,
      per_page: 8,
      search: searchParam,
      category_id: categoryParam,
      randomize: true, // Selalu acak setiap refresh
    };
  });

  const VITE_API_URL = import.meta.env.VITE_API_URL;

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getProductCategories();
        if (response.data && response.data.status === 'success') {
          setCategories(response.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await listProductPaginated(filters);
        console.log('Products response:', response.data);

        if (response.data && response.data.status === 'success') {
          setProducts(response.data.data || []);
          setPagination(response.data.pagination || {});
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
  }, [filters]);

  // Handler functions (simplified without URL update)
  const handlePageChange = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearch = useCallback((search) => {
    setFilters((prev) => ({ ...prev, search, page: 1, randomize: true }));
  }, []);

  const handleCategoryFilter = useCallback((category_id) => {
    setFilters((prev) => ({
      ...prev,
      category_id,
      page: 1,
      randomize: true,
    }));
  }, []);

  const handleClearAll = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      search: '',
      category_id: '',
      page: 1,
      randomize: true,
    }));
    // Clear URL completely
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Update URL when filters change
  useEffect(() => {
    updateUrlParams(filters.page, filters.search, filters.category_id);
  }, [filters.page, filters.search, filters.category_id, updateUrlParams]);

  // Clear search params if they are empty on component mount
  useEffect(() => {
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category_id');

    // If there are empty search/category params in URL, remove them
    if (
      (searchParam === '' || !searchParam) &&
      (categoryParam === '' || !categoryParam)
    ) {
      const pageParam = searchParams.get('page');
      const params = new URLSearchParams();
      if (pageParam && pageParam !== '1') {
        params.set('page', pageParam);
      }
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]); // Run when URL params change

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
          {/* Banner Carousel */}

          <Component />
          
          <h1
            className='text-3xl font-bold text-gray-900 mb-8'
            data-aos='fade-up'>
            Toko Produk
          </h1>

          {/* Search and Filter */}
          <SearchAndFilter
            onSearch={handleSearch}
            onCategoryFilter={handleCategoryFilter}
            onClearAll={handleClearAll}
            categories={categories}
            isLoading={isLoading}
            initialSearch={searchParams.get('search') || ''}
            initialCategory={searchParams.get('category_id') || ''}
            className='mb-8'
          />

          {/* Results Info */}
          {!isLoading && !error && (
            <div className='mb-6' data-aos='fade-up'>
              <p className='text-gray-600'>
                Menampilkan {products.length} dari {pagination.total} produk
                {filters.search && ` untuk "${filters.search}"`}
                {filters.category_id &&
                  categories.length > 0 &&
                  ` dalam kategori "${
                    categories.find((c) => c.id_category == filters.category_id)
                      ?.nama_category
                  }"`}
              </p>
            </div>
          )}

          {products.length === 0 && !isLoading && !error ? (
            <div className='text-center py-12' data-aos='fade-up'>
              <div className='max-w-md mx-auto'>
                <svg
                  className='mx-auto h-12 w-12 text-gray-400 mb-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.54-.94-6.159-2.47C7.84 10.452 9.8 9 12 9s4.16 1.452 6.159 3.53A7.962 7.962 0 0112 15z'
                  />
                </svg>
                <p className='text-gray-600 text-lg mb-2'>
                  {filters.search || filters.category_id
                    ? 'Tidak ada produk yang sesuai dengan kriteria pencarian'
                    : 'Belum ada produk tersedia'}
                </p>
                {(filters.search || filters.category_id) && (
                  <button
                    onClick={() => {
                      // Clear filters and URL params completely
                      setFilters((prev) => ({
                        ...prev,
                        search: '',
                        category_id: '',
                        page: 1,
                        randomize: true,
                      }));
                      // Clear URL completely (no search params)
                      setSearchParams({}, { replace: true });
                    }}
                    className='text-blue-600 hover:text-blue-800 font-medium'>
                    Hapus filter dan lihat semua produk
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8'>
                {products.map((product, index) => (
                  <div
                    key={product.id_product}
                    className='bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300'
                    data-aos='fade-up'
                    data-aos-delay={index * 100}>
                    <Link to={`/product/${generateProductSlug(product.nama_produk, product.id_product)}`}>
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
                          <span
                            className={`font-medium ${
                              product.stok > 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                            Stok: {product.stok}
                          </span>
                          <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs'>
                            {product.kategori || 'Umum'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                onPageChange={handlePageChange}
                hasNext={pagination.has_next}
                hasPrev={pagination.has_prev}
                className='mt-8'
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Product;
