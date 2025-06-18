import React, { useEffect, useState } from 'react';
import { deleteProduct, listProduct } from '../../service/Product';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ProductFilter from '../../components/admin/Filter';
import ProductTable from '../../components/admin/TableProduct';

const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await listProduct();
      setProducts(res.data.data || []);
    } catch (err) {
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
      } catch (err) {
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

  const categories = [...new Set(products.map((product) => product.category))];

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 lg:ml-0'>
        <div className='p-4 lg:p-8'>
          <div className='mb-8 mt-16 lg:mt-0'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between'>
              <div>
                <h1 className='text-2xl lg:text-3xl font-bold text-gray-900 mb-2'>
                  Daftar Produk
                </h1>
                <p className='text-gray-600'>
                  Kelola semua produk Anda dengan mudah
                </p>
              </div>
              <Link
                to='/create'
                className='mt-4 lg:mt-0 inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm'>
                <Plus size={20} />
                <span>Tambah Produk</span>
              </Link>
            </div>
          </div>

          <ProductFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            categories={categories}
          />

          <ProductTable
            products={filteredProducts}
            loading={loading}
            onDelete={handleDelete}
          />

          {filteredProducts.length > 0 && (
            <div className='mt-6 text-sm text-gray-600'>
              Menampilkan {filteredProducts.length} dari {products.length}{' '}
              produk
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
