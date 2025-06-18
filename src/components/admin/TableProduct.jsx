import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Eye, Trash2 } from 'lucide-react';

const ProductTable = ({ products, loading, onDelete }) => {
  // Debug props yang diterima
  console.log('Props received in ProductTable:', {
    products,
    loading,
    onDelete,
  });

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          <span className='ml-3 text-gray-600'>Memuat data...</span>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  No
                </th>
                <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Produk
                </th>
                <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Kategori
                </th>
                <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Harga
                </th>
                <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Stok
                </th>
                <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-12 text-center text-gray-500'>
                    Tidak ada produk yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                products.map((product, idx) => (
                  <tr
                    key={product.id_product}
                    className='hover:bg-gray-50 transition-colors duration-150'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {idx + 1}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-12 w-12'>
                          <img
                            className='h-12 w-12 rounded-lg object-cover border border-gray-200'
                            src={`${import.meta.env.VITE_API_URL}/${
                              product.foto
                            }`}
                            alt={product.nama_produk}
                            onError={(e) => {
                              e.target.src = '/placeholder-image.jpg'; // fallback image
                            }}
                          />
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>
                            {product.nama_produk}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='inline-flex px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full'>
                        {product.nama_category || '-'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {Number(product.harga).toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          product.stok > 10
                            ? 'bg-green-100 text-green-800'
                            : product.stok > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {product.stok} unit
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2'>
                      <Link
                        to={`/product/${product.id_product}`}
                        className='inline-flex items-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-150'
                        title='Lihat Detail'>
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/product/edit/${product.id_product}`}
                        className='inline-flex items-center p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-150'
                        title='Edit Produk'>
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => onDelete(product.id_product)}
                        className='inline-flex items-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-150'
                        title='Hapus Produk'>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
