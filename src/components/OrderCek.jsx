import React, {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import { Eye, Package, X, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState(null);
  const [editingTracking, setEditingTracking] = useState(null); // Menyimpan ID purchase yang sedang diedit
  const [trackingData, setTrackingData] = useState({});
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  // --- Data Fetching ---
  const fetchPurchases = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        // Optimalisasi: Minta API untuk memfilter status langsung dari server
        const response = await axios.get(
          `http://localhost:8080/api/history?status=success&page=${page}&limit=${pagination.per_page}`
        );

        if (response.data.status === 'success') {
          setPurchases(response.data.data);
          setPagination(response.data.pagination);
        } else {
          // Handle jika API mengembalikan status 'error' tapi tidak melempar exception
          setPurchases([]);
          setPagination({ current_page: 1, per_page: 10, total: 0, last_page: 1 });
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch data from server.');
        console.error('[Fetch] error', err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.per_page]
  );

  useEffect(() => {
    fetchPurchases(1); // Fetch halaman pertama saat komponen mount
  }, [fetchPurchases]);

  // --- Event Handlers ---
  const handleShippingStatus = async (id, newStatus) => {
    try {
      // Optimistic UI update
      setPurchases(prev => 
        prev.map(p => p.id === id ? { ...p, is_shipped: newStatus ? '1' : '0' } : p)
      );
      await axios.put(`http://localhost:8080/api/history/${id}/shipping`, {
        is_shipped: newStatus,
      });
      // Fetch ulang untuk sinkronisasi data (opsional, tergantung kebutuhan)
      // fetchPurchases(pagination.current_page);
    } catch (err) {
      console.error('Failed to update shipping status:', err);
      // Rollback jika gagal
      fetchPurchases(pagination.current_page);
    }
  };

  const handleEditClick = (purchase) => {
    setEditingTracking(purchase.id);
    // Pre-populate state dengan data yang sudah ada saat tombol edit diklik
    setTrackingData(prev => ({
      ...prev,
      [purchase.id]: {
        tracking_number: purchase.tracking_number || '',
        shipping_service: purchase.shipping_service || '',
      },
    }));
  };
  
  const handleTrackingUpdate = async (id) => {
    const data = trackingData[id];
    if (!data || !data.tracking_number || !data.shipping_service) {
      alert('Nomor resi dan jasa pengiriman harus diisi.');
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/history/${id}/tracking`, data);
      setEditingTracking(null);
      fetchPurchases(pagination.current_page); // Refresh data
    } catch (err) {
      console.error('Failed to update tracking information:', err);
      alert('Gagal menyimpan informasi pengiriman.');
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

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.last_page) {
      fetchPurchases(newPage);
    }
  };

  // --- Sub-Components / Render Helpers ---
  const ItemsModal = ({ items, onClose }) => (
    <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col'>
        <div className='flex justify-between items-center p-5 border-b border-gray-200'>
          <h3 className='text-lg font-bold text-gray-800'>Detail Pesanan</h3>
          <button onClick={onClose} className='p-2 rounded-full hover:bg-gray-100 transition-colors'>
            <X className='h-6 w-6 text-gray-500' />
          </button>
        </div>
        <div className='p-5 overflow-y-auto'>
          <div className='-mx-5'>
            <table className='min-w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Produk</th>
                  <th className='px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>Jumlah</th>
                  <th className='px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>Harga Satuan</th>
                  <th className='px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>Subtotal</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className='px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{item.nama_product || item.name}</td>
                    <td className='px-5 py-4 whitespace-nowrap text-sm text-gray-700 text-center'>{item.quantity}</td>
                    <td className='px-5 py-4 whitespace-nowrap text-sm text-gray-700 text-right'>Rp {parseInt(item.price).toLocaleString('id-ID')}</td>
                    <td className='px-5 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right'>Rp {(item.quantity * item.price).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const PaginationControls = () => (
    <div className='flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg'>
      <div className='text-sm text-gray-700 mb-2 sm:mb-0'>
        Menampilkan{' '}
        <span className='font-medium'>{(pagination.current_page - 1) * pagination.per_page + (purchases.length > 0 ? 1 : 0)}</span>{' '}
        -{' '}
        <span className='font-medium'>{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span>{' '}
        dari <span className='font-medium'>{pagination.total}</span> hasil
      </div>
      <div className='inline-flex -space-x-px rounded-md shadow-sm' aria-label='Pagination'>
        <button onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1} className='relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition'>
          <ChevronLeft className='h-5 w-5' />
        </button>
        {/* Simple page numbers for demonstration */}
        <span className='relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-y border-gray-300'>
          Halaman {pagination.current_page} / {pagination.last_page}
        </span>
        <button onClick={() => handlePageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page} className='relative inline-flex items-center rounded-r-md px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition'>
          <ChevronRight className='h-5 w-5' />
        </button>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gray-50'>
        <div className='flex flex-col items-center space-y-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent'></div>
          <p className='text-gray-600 font-medium'>Memuat Riwayat Pembelian...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='m-4 p-6 bg-red-50 border border-red-200 text-red-800 rounded-lg'>
        <h3 className='font-bold'>Terjadi Kesalahan</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900'>Riwayat Pembelian</h1>
          <p className='text-gray-600 mt-1'>Kelola dan lacak semua pesanan dari pelanggan.</p>
        </div>

        <div className='bg-white rounded-lg shadow-md border border-gray-200'>
          {/* Table for Desktop */}
          <div className='hidden md:block'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>No</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Pelanggan</th>
                    <th className='px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>Items</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]'>Alamat</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Total</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[220px]'>Nomor Resi</th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[180px]'>Jasa Kirim</th>
                    <th className='px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>Dikirim</th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {purchases.length > 0 ? (
                    purchases.map((purchase, index) => (
                    <tr key={purchase.id} className='hover:bg-gray-50 transition-colors duration-150'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500'>
                        {(pagination.current_page - 1) * pagination.per_page + index + 1}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-semibold text-gray-900'>{purchase.username}</div>
                        <div className='text-xs text-gray-500'>{purchase.email}</div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        <button onClick={() => setSelectedItems(purchase.items)} className='p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-full transition'>
                          <Eye className='h-5 w-5' />
                        </button>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-700'>
                        {purchase.kabupaten}, {purchase.provinsi}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600'>
                        Rp {parseInt(purchase.total).toLocaleString('id-ID')}
                      </td>
                      <td className='px-6 py-4'>
                        {editingTracking === purchase.id ? (
                          <div className='flex items-center space-x-2'>
                            <input
                              type='text'
                              placeholder='Masukkan nomor resi'
                              className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                              value={trackingData[purchase.id]?.tracking_number || ''}
                              onChange={(e) => handleTrackingInputChange(purchase.id, 'tracking_number', e.target.value)}
                            />
                          </div>
                        ) : (
                          <div className='flex items-center justify-between group'>
                            <span className={`text-sm font-medium ${purchase.tracking_number ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                              {purchase.tracking_number || 'Belum ada resi'}
                            </span>
                            <button onClick={() => handleEditClick(purchase)} className='text-xs text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity'>
                              {purchase.tracking_number ? 'Ubah' : 'Tambah'}
                            </button>
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4'>
                         {editingTracking === purchase.id ? (
                           <div className='flex items-center space-x-2'>
                            <select
                              className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                              value={trackingData[purchase.id]?.shipping_service || ''}
                              onChange={(e) => handleTrackingInputChange(purchase.id, 'shipping_service', e.target.value)}>
                              <option value=''>Pilih Jasa</option>
                              <option value='JNE'>JNE</option>
                              <option value='TIKI'>TIKI</option>
                              <option value='POS Indonesia'>POS Indonesia</option>
                              <option value='J&T Express'>J&T Express</option>
                              <option value='SiCepat'>SiCepat</option>
                            </select>
                            <button onClick={() => handleTrackingUpdate(purchase.id)} className='px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700'>Simpan</button>
                            <button onClick={() => setEditingTracking(null)} className='px-3 py-1.5 text-xs bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300'>Batal</button>
                           </div>
                         ) : (
                          <span className={`text-sm font-medium ${purchase.shipping_service ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                            {purchase.shipping_service || 'Belum dipilih'}
                          </span>
                         )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input type='checkbox' className='sr-only peer' checked={purchase.is_shipped === '1'} onChange={(e) => handleShippingStatus(purchase.id, e.target.checked)} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </td>
                    </tr>
                  ))) : (
                    <tr>
                      <td colSpan="8" className="text-center py-16">
                        <div className="flex flex-col items-center text-gray-500">
                          <Inbox className="w-16 h-16 mb-4" />
                          <h3 className="text-xl font-semibold">Tidak Ada Pesanan</h3>
                          <p className="mt-1">Saat ini tidak ada riwayat pembelian yang berhasil.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {pagination.total > 0 && <PaginationControls />}
          </div>

          {/* Cards for Mobile */}
          <div className='md:hidden divide-y divide-gray-200'>
             {purchases.length > 0 ? (
                purchases.map((purchase, index) => (
                <div key={purchase.id} className='p-4'>
                  <div className='flex justify-between items-start mb-3'>
                    <div>
                      <div className='font-bold text-gray-900'>{purchase.username}</div>
                      <div className='text-sm text-gray-500'>{purchase.email}</div>
                      <div className='text-sm text-gray-500 mt-1'>{purchase.kabupaten}, {purchase.provinsi}</div>
                    </div>
                    <div className='text-right'>
                       <div className='font-bold text-green-600'>Rp {parseInt(purchase.total).toLocaleString('id-ID')}</div>
                       <span className='mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                        {purchase.status}
                       </span>
                    </div>
                  </div>

                  {editingTracking === purchase.id ? (
                    <div className='bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3'>
                       <div>
                         <label className='text-xs font-medium text-gray-600'>Jasa Pengiriman</label>
                         <select className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2' value={trackingData[purchase.id]?.shipping_service || ''} onChange={(e) => handleTrackingInputChange(purchase.id, 'shipping_service', e.target.value)}>
                            <option value=''>Pilih Jasa</option>
                            <option value='JNE'>JNE</option>
                            <option value='TIKI'>TIKI</option>
                            <option value='POS Indonesia'>POS Indonesia</option>
                            <option value='J&T Express'>J&T Express</option>
                         </select>
                       </div>
                       <div>
                         <label className='text-xs font-medium text-gray-600'>Nomor Resi</label>
                         <input type='text' placeholder='Masukkan nomor resi' className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2' value={trackingData[purchase.id]?.tracking_number || ''} onChange={(e) => handleTrackingInputChange(purchase.id, 'tracking_number', e.target.value)} />
                       </div>
                       <div className='flex items-center space-x-2'>
                          <button onClick={() => handleTrackingUpdate(purchase.id)} className='w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700'>Simpan Perubahan</button>
                          <button onClick={() => setEditingTracking(null)} className='w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>Batal</button>
                       </div>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                       <div className='flex justify-between items-center'>
                         <div>
                            <div className='text-xs text-gray-500'>Jasa Kirim</div>
                            <div className='text-sm font-semibold'>{purchase.shipping_service || <span className='italic text-gray-400'>Belum dipilih</span>}</div>
                         </div>
                         <div>
                            <div className='text-xs text-gray-500'>Nomor Resi</div>
                            <div className='text-sm font-semibold'>{purchase.tracking_number || <span className='italic text-gray-400'>Belum ada</span>}</div>
                         </div>
                       </div>
                        <div className='grid grid-cols-2 gap-2 items-center'>
                          <button onClick={() => handleEditClick(purchase)} className='w-full text-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>
                            {purchase.tracking_number ? 'Ubah Resi' : 'Tambah Resi'}
                          </button>
                           <button onClick={() => setSelectedItems(purchase.items)} className='w-full text-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center space-x-2'>
                            <Eye className='h-4 w-4' />
                            <span>Lihat Item</span>
                          </button>
                        </div>
                    </div>
                  )}

                  <div className='mt-4 flex justify-between items-center border-t border-gray-200 pt-3'>
                      <span className='text-sm font-medium text-gray-700'>Status Pengiriman</span>
                      <label className='relative inline-flex items-center cursor-pointer'>
                          <input type='checkbox' className='sr-only peer' checked={purchase.is_shipped === '1'} onChange={(e) => handleShippingStatus(purchase.id, e.target.checked)} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          <span className='ml-3 text-sm font-medium text-gray-900'>{purchase.is_shipped === '1' ? 'Dikirim' : 'Menunggu'}</span>
                      </label>
                  </div>

                </div>
              ))) : (
                 <div className="text-center py-16">
                    <div className="flex flex-col items-center text-gray-500">
                      <Inbox className="w-16 h-16 mb-4" />
                      <h3 className="text-xl font-semibold">Tidak Ada Pesanan</h3>
                      <p className="mt-1">Belum ada riwayat pembelian yang berhasil.</p>
                    </div>
                  </div>
              )}
             {pagination.total > 0 && <PaginationControls />}
          </div>

        </div>
      </div>

      {selectedItems && <ItemsModal items={selectedItems} onClose={() => setSelectedItems(null)} />}
    </div>
  );
};

export default PurchaseHistory;