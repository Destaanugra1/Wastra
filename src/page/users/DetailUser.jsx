import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Modaldrop } from '../../components/Menudrop';
import { getUserById } from '../../service/user';

const DetailUser = () => {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [histLoad, setHistLoad] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const itemsPerPage = 5;

  /* ---------- GET USER ---------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await getUserById(id);
        setUser(res.data.data ?? null);
      } catch (e) {
        console.error(e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ---------- GET HISTORY ---------- */
  useEffect(() => {
    if (!user) return;

    (async () => {
      setHistLoad(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/history/${user.id}`
        );
        const json = await res.json();
        setHistory(json.history ?? []); // ← key "history" dari backend
      } catch (e) {
        console.error(e);
      } finally {
        setHistLoad(false);
      }
    })();
  }, [user]);

  /* ---------- FILTER & PAGINATION ---------- */
  const filtered = useMemo(
    () =>
      history.filter(
        (h) =>
          h.order_id?.toLowerCase().includes(search.toLowerCase()) ||
          h.username?.toLowerCase().includes(search.toLowerCase())
      ),
    [history, search]
  );

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  /* ---------- FORMATTERS ---------- */
  const fmtCurrency = (n) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(n ?? 0);

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  /* ---------- LOADING & NOT FOUND ---------- */
  if (loading)
    return (
      <>
        <Navbar />
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full' />
        </div>
      </>
    );

  if (!user)
    return (
      <>
        <Navbar />
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <p className='text-gray-600'>User tidak ditemukan</p>
        </div>
      </>
    );

  /* ---------- UI ---------- */
  return (
    <>
      <Navbar />
      <div className='min-h-screen bg-gray-50'>
        <div className='max-w-6xl mx-auto p-6'>
          {/* USER CARD */}
          <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center'>
                  <span className='text-white font-semibold text-lg'>
                    {user.nama?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                </div>
                <div>
                  <h1 className='text-2xl font-bold'>{user.nama}</h1>
                  <p className='text-gray-600'>{user.email}</p>
                </div>
              </div>
              <div className='flex items-center space-x-4'>
                <span className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'>
                  {user.role}
                </span>
                <Modaldrop />
              </div>
            </div>
          </div>

          {/* HISTORY */}
          <div className='bg-white rounded-lg shadow-sm'>
            {/* Header */}
            <div className='px-6 py-4 border-b border-gray-200 flex justify-between'>
              <div>
                <h2 className='text-xl font-semibold'>Riwayat Pembelian</h2>
                <p className='text-sm text-gray-600'>
                  {filtered.length} transaksi
                </p>
              </div>
              <div className='relative'>
                <input
                  className='pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500'
                  placeholder='Cari order ID atau username...'
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <svg
                  className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400'
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
            </div>

            {/* Content */}
            <div className='p-6'>
              {histLoad ? (
                <div className='text-center py-8'>
                  <div className='animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto' />
                  <p className='mt-2 text-gray-600'>Loading history...</p>
                </div>
              ) : paginated.length === 0 ? (
                <div className='text-center py-12 text-gray-500'>
                  {search ? 'Tidak ada hasil' : 'Belum ada riwayat'}
                </div>
              ) : (
                <div className='space-y-4'>
                  {paginated.map((order) => (
                    <div
                      key={order.id}
                      className='border rounded-lg p-4 hover:shadow-md transition-shadow'>
                      {/* header order */}
                      <div className='flex justify-between mb-3'>
                        <div>
                          <h3 className='font-semibold'>{order.order_id}</h3>
                          <p className='text-sm text-gray-600'>
                            {order.username}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='font-semibold'>
                            {fmtCurrency(order.total)}
                          </p>
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              order.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* details */}
                      <div className='grid md:grid-cols-3 gap-4 mb-3'>
                        <div>
                          <p className='text-xs text-gray-500 uppercase'>
                            Tanggal
                          </p>
                          <p>{fmtDate(order.created_at)}</p>
                        </div>
                        <div>
                          <p className='text-xs text-gray-500 uppercase'>
                            Lokasi
                          </p>
                          <p>
                            {order.provinsi}, {order.kabupaten}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-gray-500 uppercase'>
                            Items
                          </p>
                          <p>{order.items.length} item</p>
                        </div>
                      </div>

                      {/* alamat */}
                      <div className='mb-3'>
                        <p className='text-xs text-gray-500 uppercase'>
                          Alamat
                        </p>
                        <p>{order.deskripsi_alamat}</p>
                      </div>

                      {/* collapsible items */}
                      {order.items.length > 0 && (
                        <details className='group'>
                          <summary className='cursor-pointer text-sm text-blue-600 flex items-center'>
                            Lihat detail item ({order.items.length})
                            <svg
                              className='ml-1 h-4 w-4 transition-transform group-open:rotate-180'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'>
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M19 9l-7 7-7-7'
                              />
                            </svg>
                          </summary>
                          <div className='mt-3 space-y-2'>
                            {order.items.map((it, idx) => (
                              <div
                                key={idx}
                                className='flex justify-between items-center bg-gray-50 rounded py-2 px-3'>
                                <div>
                                  <p className='font-medium'>
                                    {it.nama_product}
                                  </p>
                                  <p className='text-xs text-gray-600'>
                                    Jumlah: {it.quantity ?? it.qty ?? 1}
                                  </p>
                                </div>
                                <p className='font-medium'>
                                  {fmtCurrency(
                                    (it.quantity ?? it.qty ?? 1) *
                                      (it.harga ?? it.price ?? 0)
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='flex justify-between items-center mt-6 pt-4 border-t'>
                  <div className='text-sm text-gray-700'>
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} –{' '}
                    {Math.min(currentPage * itemsPerPage, filtered.length)} dari{' '}
                    {filtered.length}
                  </div>
                  <div className='flex space-x-2'>
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 text-sm rounded ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .slice(
                        Math.max(0, currentPage - 3),
                        Math.min(totalPages, currentPage + 2)
                      )
                      .map((n) => (
                        <button
                          key={n}
                          onClick={() => setCurrentPage(n)}
                          className={`px-3 py-2 text-sm rounded ${
                            currentPage === n
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}>
                          {n}
                        </button>
                      ))}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 text-sm rounded ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}>
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
