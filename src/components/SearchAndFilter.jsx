import React, { useState, useRef } from 'react';

const SearchAndFilter = ({
  onSearch,
  onCategoryFilter,
  onClearAll,
  categories = [],
  isLoading = false,
  initialSearch = '',
  initialCategory = '',
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const hasInitialized = useRef(false);

  // Initialize only once when component mounts
  if (!hasInitialized.current) {
    hasInitialized.current = true;
    if (initialSearch !== searchTerm) {
      setSearchTerm(initialSearch);
    }
    if (initialCategory !== selectedCategory) {
      setSelectedCategory(initialCategory);
    }
  }

  // Handle search
  const handleSearch = () => {
    onSearch(searchTerm);
  };

  // Handle search on Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    onCategoryFilter(categoryId);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    if (onClearAll) {
      onClearAll(); // Clear everything including URL
    } else {
      onSearch('');
      onCategoryFilter('');
    }
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    // Don't auto search on clear, let user decide
  };

  return (
    <div
      className={`bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Single Row Layout: Search Left, Category Right */}
      <div className='flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch lg:items-center'>
        {/* Left Side - Search */}
        <div className='flex gap-2 lg:flex-1 lg:max-w-lg'>
          <div className='flex-1 relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <svg
                className='h-4 w-4 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
            <input
              type='text'
              placeholder='Cari produk...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className='block w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200'
              disabled={isLoading}
            />
            {searchTerm && (
              <button
                onClick={handleSearchClear}
                className='absolute inset-y-0 right-0 pr-2 flex items-center'>
                <svg
                  className='h-3 w-3 text-gray-400 hover:text-gray-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isLoading || !searchTerm.trim()}
            className='px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 min-w-[70px] justify-center'>
            {isLoading ? (
              <div className='w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
            ) : (
              <svg
                className='w-3 h-3'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            )}
            <span className='text-sm'>{isLoading ? 'Cari...' : 'Cari'}</span>
          </button>
        </div>

        {/* Right Side - Category Filter and Reset */}
        <div className='flex gap-2 lg:flex-shrink-0'>
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className='flex-1 lg:w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200'
            disabled={isLoading}>
            <option value=''>Semua Kategori</option>
            {categories.map((category) => (
              <option key={category.id_category} value={category.id_category}>
                {category.nama_category}
              </option>
            ))}
          </select>

          {/* Reset Button */}
          {(searchTerm || selectedCategory) && (
            <button
              onClick={handleClearFilters}
              disabled={isLoading}
              className='px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 min-w-[70px] justify-center'>
              <svg
                className='w-3 h-3'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
              <span className='text-sm'>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display - Compact */}
      {(searchTerm || selectedCategory) && (
        <div className='mt-3 flex flex-wrap gap-2'>
          <span className='text-xs text-gray-500'>Filter aktif:</span>
          {searchTerm && (
            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
              "{searchTerm}"
              <button
                onClick={handleSearchClear}
                className='ml-1 inline-flex items-center justify-center w-3 h-3 rounded-full hover:bg-blue-200 text-xs'>
                ×
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800'>
              {
                categories.find((c) => c.id_category == selectedCategory)
                  ?.nama_category
              }
              <button
                onClick={() => handleCategoryChange('')}
                className='ml-1 inline-flex items-center justify-center w-3 h-3 rounded-full hover:bg-purple-200 text-xs'>
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;
