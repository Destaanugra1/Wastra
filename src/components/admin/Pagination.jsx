import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}) => {
  // Hitung range data yang ditampilkan
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers untuk ditampilkan
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Jika total halaman <= 5, tampilkan semua
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Jika total halaman > 5, tampilkan dengan logic
      if (currentPage <= 3) {
        // Di awal
        pageNumbers.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Di akhir
        pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Di tengah
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pageNumbers;
  };

  if (totalPages <= 1) {
    return null; // Tidak perlu pagination jika hanya 1 halaman atau kurang
  }

  return (
    <div className="bg-white px-3 sm:px-6 py-3 border-t border-gray-200">
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row justify-between items-start sm:items-center">
        {/* Info */}
        <div className="text-xs sm:text-sm text-gray-700 order-2 sm:order-1">
          Menampilkan{' '}
          <span className="font-medium">{startIndex}</span>
          {' '}sampai{' '}
          <span className="font-medium">{endIndex}</span>
          {' '}dari{' '}
          <span className="font-medium">{totalItems}</span>
          {' '}produk
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center sm:justify-end w-full sm:w-auto order-1 sm:order-2">
          <div className="flex items-center space-x-1">
            {/* Previous Button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`
                inline-flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md
                ${currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
                transition-colors duration-150
              `}
            >
              <ChevronLeft size={14} className="sm:mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {/* Mobile: Show current page info */}
              <div className="sm:hidden px-2 py-2 text-xs text-gray-700 bg-gray-100 rounded-md">
                {currentPage} / {totalPages}
              </div>
              
              {/* Desktop: Show page numbers */}
              <div className="hidden sm:flex items-center space-x-1">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => onPageChange(page)}
                        className={`
                          px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors duration-150
                          ${currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`
                inline-flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md
                ${currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
                transition-colors duration-150
              `}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={14} className="sm:ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
