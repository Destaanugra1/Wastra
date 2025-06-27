import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Eye, Package, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState(null);
  const [editingTracking, setEditingTracking] = useState(null);
  const [trackingData, setTrackingData] = useState({});
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  const fetchPurchases = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8080/api/history?page=${page}&limit=${pagination.per_page}`
        );
        if (response.data.status === 'success') {
          const filteredPurchases = response.data.data.filter(
            (purchase) => purchase.status === 'success' // Filter hanya status "success"
          );
          setPurchases(filteredPurchases);
          console.log(
            '[FETCH] Received',
            filteredPurchases.length,
            'successful items from server'
          );
          setPagination(response.data.pagination);
        }
      } catch (err) {
        setError(err.message);
        console.error('[Fetch] error', err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.per_page]
  ); // Menambahkan dependency untuk useCallback

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]); // Menambahkan fetchPurchases sebagai dependency

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

  const handleTrackingUpdate = async (id) => {
    const data = trackingData[id];
    if (!data || (!data.tracking_number && !data.shipping_service)) {
      console.error('Please fill in tracking information');
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/history/${id}/tracking`, {
        tracking_number: data.tracking_number,
        shipping_service: data.shipping_service,
      });
      setEditingTracking(null);
      setTrackingData((prev) => ({
        ...prev,
        [id]: { tracking_number: '', shipping_service: '' },
      }));
      fetchPurchases(pagination.current_page); // Refresh current page
    } catch (err) {
      console.error('Failed to update tracking information:', err);
    }
  };

  const handleTrackingInputChange = (id, field, value) => {
    setTrackingData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const ItemsModal = ({ items, onClose }) => (
  <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4'>
    <div className='bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
      <div className='flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50'>
        <h3 className='text-xl font-bold text-gray-900'>Order Items</h3>
        <button 
          onClick={onClose} 
          className='p-2 hover:bg-white hover:bg-opacity-80 rounded-full transition-all duration-200 group'
        >
          <X className='h-6 w-6 text-gray-600 group-hover:text-gray-800' />
        </button>
      </div>
      <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gradient-to-r from-gray-50 to-gray-100'>
              <tr>
                <th className='px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider'>
                  Product
                </th>
                <th className='px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider'>
                  Quantity
                </th>
                <th className='px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider'>
                  Price
                </th>
                <th className='px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider'>
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-100'>
              {items.map((item, index) => (
                <tr key={index} className='hover:bg-gray-50 transition-colors duration-150'>
                  <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                    {item.nama_product || item.name}
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-700'>
                    <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium'>
                      {item.quantity}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                    Rp {parseInt(item.price).toLocaleString('id-ID')}
                  </td>
                  <td className='px-6 py-4 text-sm font-bold text-green-600'>
                    Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

const renderPagination = () => (
  <div className='flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white px-4 py-4 sm:px-6'>
    <div className='flex justify-between w-full sm:hidden mb-4'>
      <button
        onClick={() => fetchPurchases(pagination.current_page - 1)}
        disabled={pagination.current_page === 1}
        className={`relative inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 ${
          pagination.current_page === 1
            ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
            : 'border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 bg-white shadow-sm'
        }`}>
        Previous
      </button>
      <button
        onClick={() => fetchPurchases(pagination.current_page + 1)}
        disabled={pagination.current_page === pagination.last_page}
        className={`relative inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 ${
          pagination.current_page === pagination.last_page
            ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
            : 'border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 bg-white shadow-sm'
        }`}>
        Next
      </button>
    </div>
    <div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-between'>
      <div>
        <p className='text-sm text-gray-700'>
          Showing{' '}
          <span className='font-semibold text-blue-600'>
            {(pagination.current_page - 1) * pagination.per_page + 1}
          </span>{' '}
          to{' '}
          <span className='font-semibold text-blue-600'>
            {Math.min(
              pagination.current_page * pagination.per_page,
              pagination.total
            )}
          </span>{' '}
          of <span className='font-semibold text-blue-600'>{pagination.total}</span> results
        </p>
      </div>
      <div>
        <nav
          className='isolate inline-flex -space-x-px rounded-lg shadow-sm'
          aria-label='Pagination'>
          <button
            onClick={() => fetchPurchases(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            className={`relative inline-flex items-center rounded-l-lg px-3 py-2 transition-all duration-200 ${
              pagination.current_page === 1
                ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                : 'text-gray-500 hover:bg-blue-50 hover:text-blue-700 bg-white'
            }`}>
            <ChevronLeft className='h-5 w-5' />
          </button>
          {[...Array(pagination.last_page)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => fetchPurchases(index + 1)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                pagination.current_page === index + 1
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-900 hover:bg-blue-50 hover:text-blue-700 bg-white'
              }`}>
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => fetchPurchases(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
            className={`relative inline-flex items-center rounded-r-lg px-3 py-2 transition-all duration-200 ${
              pagination.current_page === pagination.last_page
                ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                : 'text-gray-500 hover:bg-blue-50 hover:text-blue-700 bg-white'
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
    <div className='flex justify-center items-center p-12'>
      <div className='flex flex-col items-center space-y-4'>
        <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent'></div>
        <p className='text-gray-600 font-medium'>Loading purchase history...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className='p-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 rounded-xl shadow-sm'>
      <div className='flex items-center space-x-2'>
        <div className='w-5 h-5 bg-red-500 rounded-full flex items-center justify-center'>
          <span className='text-white text-xs font-bold'>!</span>
        </div>
        <span className='font-medium'>{error}</span>
      </div>
    </div>
  );
}

return (
  <div className='bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden'>
    <div className='bg-gradient-to-r from-blue-600 to-indigo-600 p-6'>
      <h2 className='text-2xl font-bold text-white'>Purchase History</h2>
      <p className='text-blue-100 mt-1'>Manage and track all customer orders</p>
    </div>
    
    <div className='p-6'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gradient-to-r from-gray-50 to-gray-100'>
            <tr>
              <th className='px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                No
              </th>
              <th className='px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Customer
              </th>
              <th className='px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Items
              </th>
              <th className='px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Address
              </th>
              <th className='px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Total
              </th>
              <th className='px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Nomor Resi
              </th>
              <th className='px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Jasa Pengiriman
              </th>
              <th className='px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                Shipped
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-100'>
            {purchases.map((purchase, index) => (
              <tr key={purchase.id} className='hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200'>
                <td className='px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs'>
                    {(pagination.current_page - 1) * pagination.per_page + index + 1}
                  </div>
                </td>
                <td className='px-4 py-4 whitespace-nowrap'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center'>
                      <span className='text-white font-bold text-sm'>
                        {purchase.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className='text-sm font-semibold text-gray-900'>
                        {purchase.username}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {purchase.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className='px-4 py-4'>
                  <button
                    onClick={() => setSelectedItems(purchase.items)}
                    className='inline-flex items-center px-3 py-2 border border-transparent text-sm rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 font-medium shadow-sm'>
                    <Eye className='h-4 w-4 mr-2' />
                    View Items
                  </button>
                </td>
                <td className='px-4 py-4 max-w-xs'>
                  <div className='text-sm text-gray-900 truncate'>
                    {purchase.deskripsi_alamat}
                  </div>
                  <div className='text-xs text-gray-500 mt-1'>
                    <span className='bg-gray-100 px-2 py-1 rounded-full'>
                      {purchase.kabupaten}, {purchase.provinsi}
                    </span>
                  </div>
                </td>
                <td className='px-4 py-4 whitespace-nowrap'>
                  <div className='text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg inline-block'>
                    Rp {parseInt(purchase.total).toLocaleString('id-ID')}
                  </div>
                </td>
                <td className='px-4 py-4 whitespace-nowrap'>
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${
                      purchase.status === 'success'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                    {purchase.status}
                  </span>
                </td>
                <td className='px-4 py-4 min-w-[200px]'>
                  {editingTracking === purchase.id ? (
                    <div className='space-y-2'>
                      <input
                        type='text'
                        placeholder='Masukkan nomor resi'
                        className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                        value={trackingData[purchase.id]?.tracking_number || ''}
                        onChange={(e) =>
                          handleTrackingInputChange(
                            purchase.id,
                            'tracking_number',
                            e.target.value
                          )
                        }
                      />
                      <div className='flex space-x-2'>
                        <button
                          onClick={() => handleTrackingUpdate(purchase.id)}
                          className='px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm'>
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditingTracking(null)}
                          className='px-3 py-1 text-xs bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium shadow-sm'>
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-1'>
                      <div className='text-sm text-gray-900 font-medium'>
                        {purchase.tracking_number || (
                          <span className='text-gray-400 italic'>No tracking number</span>
                        )}
                      </div>
                      <button
                        onClick={() => setEditingTracking(purchase.id)}
                        className='text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-200'>
                        {purchase.tracking_number ? 'Edit' : 'Tambah Resi'}
                      </button>
                    </div>
                  )}
                </td>
                <td className='px-4 py-4 min-w-[160px]'>
                  {editingTracking === purchase.id ? (
                    <select
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                      value={trackingData[purchase.id]?.shipping_service || ''}
                      onChange={(e) =>
                        handleTrackingInputChange(
                          purchase.id,
                          'shipping_service',
                          e.target.value
                        )
                      }>
                      <option value=''>Pilih jasa pengiriman</option>
                      <option value='JNE'>JNE</option>
                      <option value='TIKI'>TIKI</option>
                      <option value='POS Indonesia'>POS Indonesia</option>
                      <option value='J&T Express'>J&T Express</option>
                      <option value='SiCepat'>SiCepat</option>
                      <option value='AnterAja'>AnterAja</option>
                      <option value='Ninja Express'>Ninja Express</option>
                      <option value='Wahana'>Wahana</option>
                    </select>
                  ) : (
                    <div className='text-sm text-gray-900'>
                      {purchase.shipping_service ? (
                        <span className='bg-indigo-100 text-indigo-800 px-2 py-1 rounded-lg text-xs font-medium'>
                          {purchase.shipping_service}
                        </span>
                      ) : (
                        <span className='text-gray-400 italic'>Not selected</span>
                      )}
                    </div>
                  )}
                </td>
                <td className='px-4 py-4 whitespace-nowrap text-center'>
                  <div className='flex justify-center'>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        className='sr-only peer'
                        checked={purchase.is_shipped === '1'}
                        onChange={(e) =>
                          handleShippingStatus(purchase.id, e.target.checked)
                        }
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
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
)}

export default PurchaseHistory;