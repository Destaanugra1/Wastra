import React from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
  className = '',
}) => {
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
          hasPrev
            ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
        }`}>
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M15 19l-7-7 7-7'
          />
        </svg>
      </button>

      {/* First page if not visible */}
      {generatePageNumbers()[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className='px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200'>
            1
          </button>
          {generatePageNumbers()[0] > 2 && (
            <span className='px-2 py-2 text-gray-500'>...</span>
          )}
        </>
      )}

      {/* Page Numbers */}
      {generatePageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            page === currentPage
              ? 'bg-blue-600 text-white border border-blue-600'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
          }`}>
          {page}
        </button>
      ))}

      {/* Last page if not visible */}
      {generatePageNumbers()[generatePageNumbers().length - 1] < totalPages && (
        <>
          {generatePageNumbers()[generatePageNumbers().length - 1] <
            totalPages - 1 && (
            <span className='px-2 py-2 text-gray-500'>...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className='px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200'>
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
          hasNext
            ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
        }`}>
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 5l7 7-7 7'
          />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
