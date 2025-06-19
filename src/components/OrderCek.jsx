import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Package, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  const fetchPurchases = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/history?page=${page}&limit=${pagination.per_page}`
      );
      if (response.data.status === 'success') {
        setPurchases(response.data.data);
         console.log('[FETCH] Received', response.data.data.length, 'items from server');
        setPagination(response.data.pagination);
      }
    } catch (err) {
      
      setError(err.message);
      console.error('[Fetch] error', err)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleShippingStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:8080/api/history/${id}/shipping`, {
        is_shipped: status,
      });
      fetchPurchases(pagination.current_page); // Refresh current page
    } catch (err) {
      console.error('Failed to update shipping status:', err);
    }
  };

  const ItemsModal = ({ items, onClose }) => (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 max-w-2xl w-full mx-4'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-semibold'>Order Items</h3>
          <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded'>
            <X className='h-5 w-5' />
          </button>
        </div>
        <div className='max-h-96 overflow-y-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                  Product
                </th>
                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                  Quantity
                </th>
                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                  Price
                </th>
                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className='px-4 py-2'>{item.nama_product || item.name}</td>
                  <td className='px-4 py-2'>{item.quantity}</td>
                  <td className='px-4 py-2'>
                    Rp {parseInt(item.price).toLocaleString('id-ID')}
                  </td>
                  <td className='px-4 py-2'>
                    Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPagination = () => (
    <div className='flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6'>
      <div className='flex flex-1 justify-between sm:hidden'>
        <button
          onClick={() => fetchPurchases(pagination.current_page - 1)}
          disabled={pagination.current_page === 1}
          className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
            pagination.current_page === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50'
          }`}>
          Previous
        </button>
        <button
          onClick={() => fetchPurchases(pagination.current_page + 1)}
          disabled={pagination.current_page === pagination.last_page}
          className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
            pagination.current_page === pagination.last_page
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50'
          }`}>
          Next
        </button>
      </div>
      <div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-between'>
        <div>
          <p className='text-sm text-gray-700'>
            Showing{' '}
            <span className='font-medium'>
              {(pagination.current_page - 1) * pagination.per_page + 1}
            </span>{' '}
            to{' '}
            <span className='font-medium'>
              {Math.min(
                pagination.current_page * pagination.per_page,
                pagination.total
              )}
            </span>{' '}
            of <span className='font-medium'>{pagination.total}</span> results
          </p>
        </div>
        <div>
          <nav
            className='isolate inline-flex -space-x-px rounded-md shadow-sm'
            aria-label='Pagination'>
            <button
              onClick={() => fetchPurchases(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                pagination.current_page === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}>
              <ChevronLeft className='h-5 w-5' />
            </button>
            {/* Page numbers */}
            {[...Array(pagination.last_page)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => fetchPurchases(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  pagination.current_page === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}>
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => fetchPurchases(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                pagination.current_page === pagination.last_page
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}>
              <ChevronRight className='h-5 w-5' />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className='flex justify-center items-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  if (error) {
    return <div className='p-4 bg-red-50 text-red-500 rounded-lg'>{error}</div>;
  }

  return (
    <div className='bg-white rounded-lg shadow'>
      <div className='p-6'>
        <h2 className='text-xl font-semibold mb-4'>Purchase History</h2>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  No
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Customer
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Items
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Address
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Total
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Shipped
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {purchases.map((purchase, index) => (
                <tr key={purchase.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {(pagination.current_page - 1) * pagination.per_page +
                      index +
                      1}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>
                      {purchase.username}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {purchase.email}
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <button
                      onClick={() => setSelectedItems(purchase.items)}
                      className='inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100'>
                      <Eye className='h-4 w-4 mr-1' />
                      View Items
                    </button>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {purchase.deskripsi_alamat}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {purchase.kabupaten}, {purchase.provinsi}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    Rp {parseInt(purchase.total).toLocaleString('id-ID')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        purchase.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <input
                      type='checkbox'
                      className='form-checkbox h-5 w-5 text-blue-600 rounded cursor-pointer'
                      checked={purchase.is_shipped === '1'}
                      onChange={(e) =>
                        handleShippingStatus(purchase.id, e.target.checked)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </div>

      {selectedItems && (
        <ItemsModal
          items={selectedItems}
          onClose={() => setSelectedItems(null)}
        />
      )}
    </div>
  );
};

export default PurchaseHistory;
