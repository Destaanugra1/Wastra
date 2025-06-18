import { Modaldrop } from '../../components/Menudrop';
import Navbar from '../../components/Navbar';
import { getUserById } from '../../service/user';
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

const DetailUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getUserById(id);
        setUser(res.data.data || null);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      
      setHistoryLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/history/${user.id}`);
        const data = await res.json();
        setHistory(data.history || []);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  // Filter dan pagination dengan useMemo untuk optimasi
  const filteredHistory = useMemo(() => {
    return history.filter(item => 
      item.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [history, searchTerm]);

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistory, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const parseItems = (itemsString) => {
    try {
      return JSON.parse(itemsString || '[]');
    } catch (error) {
      return [];
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">User tidak ditemukan</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* User Info Card - Simplified */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {user.nama?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.nama}
                  </h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {user.role}
                </span>
                <Modaldrop />
              </div>
            </div>
          </div>

          {/* Purchase History - SPA Style */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Riwayat Pembelian
                  </h2>
                  <p className="text-sm text-gray-600">
                    {filteredHistory.length} transaksi
                  </p>
                </div>
                
                {/* Search */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari order ID atau username..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {historyLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading history...</p>
                </div>
              ) : paginatedHistory.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {searchTerm ? 'Tidak ada hasil' : 'Belum ada riwayat'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Coba kata kunci lain' : 'Mulai berbelanja untuk melihat riwayat'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedHistory.map((item, index) => {
                    const items = parseItems(item.items);
                    return (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {item.order_id}
                            </h3>
                            <p className="text-sm text-gray-600">{item.username}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg text-gray-900">
                              {formatCurrency(item.total)}
                            </p>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              item.status === 'completed' ? 'bg-green-100 text-green-800' :
                              item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Tanggal</p>
                            <p className="text-sm text-gray-900">{formatDate(item.created_at)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Lokasi</p>
                            <p className="text-sm text-gray-900">{item.provinsi}, {item.kabupaten}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Items</p>
                            <p className="text-sm text-gray-900">{items.length} item</p>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Alamat</p>
                          <p className="text-sm text-gray-900">{item.deskripsi_alamat}</p>
                        </div>

                        {/* Items - Collapsible */}
                        {items.length > 0 && (
                          <details className="group">
                            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                              <span>Lihat detail item ({items.length})</span>
                              <svg className="ml-1 h-4 w-4 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </summary>
                            <div className="mt-3 space-y-2">
                              {items.map((purchasedItem, itemIndex) => (
                                <div key={itemIndex} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {purchasedItem.name || purchasedItem.nama || 'Item'}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Jumlah: {purchasedItem.quantity || purchasedItem.qty || 1}
                                    </p>
                                  </div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {formatCurrency((purchasedItem.quantity || purchasedItem.qty || 1) * (purchasedItem.price || purchasedItem.harga || 0))}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredHistory.length)} dari {filteredHistory.length} hasil
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailUser;