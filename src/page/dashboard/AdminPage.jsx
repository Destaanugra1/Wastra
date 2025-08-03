import React, { useEffect, useState } from 'react';
import { deleteProduct, listProduct } from '../../service/Product';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ProductFilter from '../../components/admin/Filter';
import ProductTable from '../../components/admin/TableProduct';
import Pagination from '../../components/admin/Pagination';

const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await listProduct();
      setProducts(res.data.data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus produk ini?')) {
      try {
        await deleteProduct(id);
        alert('Produk berhasil dihapus!');
        fetchData();
      } catch {
        alert('Gagal menghapus produk!');
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchTerm
      ? product.nama_produk?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesCategory = filterCategory
      ? String(product.category_id) === String(filterCategory) // Pastikan perbandingan string
      : true;

    return matchesSearch && matchesCategory;
  });

  // Hitung total halaman
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Ambil data untuk halaman saat ini
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handler untuk mengubah halaman
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll ke atas saat pindah halaman
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset ke halaman 1 saat filter berubah
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value) => {
    setFilterCategory(value);
    setCurrentPage(1);
  };

  const categories = [...new Set(products.map((product) => product.category))];

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 lg:ml-0'>
        <div className='p-3 sm:p-4 lg:p-8'>
          <div className='mb-6 lg:mb-8 mt-16 lg:mt-0'>
            <div className='flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between'>
              <div>
                <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 lg:mb-2'>
                  Daftar Produk
                </h1>
                <p className='text-sm lg:text-base text-gray-600'>
                  Kelola semua produk Anda dengan mudah
                </p>
              </div>
              <Link
                to='/create'
                className='inline-flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 lg:px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm lg:text-base'>
                <Plus size={18} className='lg:hidden' />
                <Plus size={20} className='hidden lg:block' />
                <span>Tambah Produk</span>
              </Link>
            </div>
          </div>

          <ProductFilter
            searchTerm={searchTerm}
            setSearchTerm={handleSearchChange}
            filterCategory={filterCategory}
            setFilterCategory={handleCategoryChange}
            categories={categories}
          />

          <ProductTable
            products={currentProducts}
            loading={loading}
            onDelete={handleDelete}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />

          {/* Pagination Component */}
          {filteredProducts.length > 0 && (
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 mt-4 overflow-hidden'>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
