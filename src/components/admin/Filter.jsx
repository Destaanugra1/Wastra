import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import axios from 'axios';

const ProductFilter = ({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
}) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/category/`)
      .then((res) => {
        console.log('Data kategori:', res.data.data); // Debug data dari backend
        setCategories(res.data.data || []);
      })
      .catch((err) => {
        console.error('Gagal mengambil kategori:', err);
        setCategories([]); // Set default jika gagal
      });
  }, []);

  const validCategories = Array.isArray(categories)
    ? categories.filter(
        (category) => category && category.id_category && category.nama_category
      )
    : [];

  // Debug log untuk melihat kategori dan filter yang dipilih
  console.log('Valid Categories:', validCategories);
  console.log('Current Filter Category:', filterCategory);

  return (
    <div className='mb-6 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4'>
      {/* Input pencarian */}
      <div className='relative flex-1 lg:max-w-md'>
        <Search
          className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
          size={20}
        />
        <input
          type='text'
          placeholder='Cari produk...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200'
        />
      </div>

      {/* Dropdown filter kategori */}
      <div className='relative'>
        <Filter
          className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
          size={20}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className='pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white min-w-[200px] appearance-none'>
          <option value=''>Semua Kategori</option>
          {validCategories.map((category) => (
            <option key={category.id_category} value={category.id_category}>
              {category.nama_category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ProductFilter;
