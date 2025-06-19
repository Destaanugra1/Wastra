import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../../service/Category';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ nama_category: '' });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await listCategories();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (mode, category = null) => {
    setModalMode(mode);
    setSelectedCategory(category);
    setFormData({ nama_category: category ? category.nama_category : '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setFormData({ nama_category: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await createCategory(formData);
      } else {
        await updateCategory(selectedCategory.id_category, formData);
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Gagal menyimpan kategori!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus kategori ini?')) {
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
        alert('Gagal menghapus kategori!');
      }
    }
  };

  const filteredCategories = categories.filter(category =>
    category.nama_category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1'>
        <div className='p-8'>
          <div className='mb-8'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>Kategori Produk</h1>
                <p className='text-gray-600'>Kelola kategori produk Anda</p>
              </div>
              <button
                onClick={() => handleOpenModal('add')}
                className='mt-4 lg:mt-0 inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm'
              >
                <Plus size={20} />
                <span>Tambah Kategori</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className='mb-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
              <input
                type='text'
                placeholder='Cari kategori...'
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Categories Table */}
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    No
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Nama Kategori
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {loading ? (
                  <tr>
                    <td colSpan='3' className='px-6 py-4 text-center'>
                      <div className='flex justify-center'>
                        <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500'></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan='3' className='px-6 py-4 text-center text-gray-500'>
                      Tidak ada kategori ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category, index) => (
                    <tr key={category.id_category} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {index + 1}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {category.nama_category}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <button
                          onClick={() => handleOpenModal('edit', category)}
                          className='text-blue-600 hover:text-blue-900 mr-4'
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id_category)}
                          className='text-red-600 hover:text-red-900'
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 z-50 overflow-y-auto'>
          <div className='flex items-center justify-center min-h-screen px-4'>
            <div className='fixed inset-0 bg-black opacity-30'></div>
            <div className='relative bg-white rounded-lg shadow-xl max-w-md w-full'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium text-gray-900'>
                    {modalMode === 'add' ? 'Tambah Kategori' : 'Edit Kategori'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className='text-gray-400 hover:text-gray-500'
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit}>
                <div className='px-6 py-4'>
                  <div className='mb-4'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Nama Kategori
                    </label>
                    <input
                      type='text'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      value={formData.nama_category}
                      onChange={(e) => setFormData({ ...formData, nama_category: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className='px-6 py-4 bg-gray-50 text-right'>
                  <button
                    type='button'
                    onClick={handleCloseModal}
                    className='mr-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md'
                  >
                    Batal
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md'
                  >
                    {modalMode === 'add' ? 'Tambah' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;