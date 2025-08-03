import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductById, deleteProduct } from '../../service/Product';
import { generateProductSlug } from '../../lib/productSlug';
import { Eye, Edit, Trash2 } from 'lucide-react';

const ProductTable = ({ products, loading, onDelete, currentPage = 1, itemsPerPage = 8 }) => {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          <span className='ml-3 text-gray-600'>Memuat data...</span>
        </div>
      ) : products.length === 0 ? (
        <div className='px-6 py-12 text-center text-gray-500'>
          <div className='text-lg font-medium mb-2'>Tidak ada produk ditemukan</div>
          <p className='text-sm'>Coba ubah filter pencarian Anda</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className='hidden lg:block overflow-x-auto'>
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
                {products.map((product, idx) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                  
                  return (
                    <tr
                      key={product.id_product}
                      className='hover:bg-gray-50 transition-colors duration-150'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {rowNumber}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-12 w-12'>
                            <img
                              className='h-12 w-12 rounded-lg object-cover border border-gray-200'
                              src={`${import.meta.env.VITE_API_URL}/${product.foto}`}
                              alt={product.nama_produk}
                              onError={(e) => {
                                e.target.src = '/placeholder-image.jpg';
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
                          to={`/product/${generateProductSlug(product.nama_produk, product.id_product)}`}
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className='lg:hidden divide-y divide-gray-200'>
            {products.map((product, idx) => {
              const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
              
              return (
                <div key={product.id_product} className='p-4 hover:bg-gray-50 transition-colors duration-150'>
                  {/* Header with number and actions */}
                  <div className='flex items-center justify-between mb-3'>
                    <span className='text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                      #{rowNumber}
                    </span>
                    <div className='flex items-center space-x-1'>
                      <Link
                        to={`/product/${generateProductSlug(product.nama_produk, product.id_product)}`}
                        className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150'
                        title='Lihat Detail'>
                        <Eye size={18} />
                      </Link>
                      <Link
                        to={`/product/edit/${product.id_product}`}
                        className='p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-150'
                        title='Edit Produk'>
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => onDelete(product.id_product)}
                        className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150'
                        title='Hapus Produk'>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Product info */}
                  <div className='flex items-start space-x-3'>
                    <div className='flex-shrink-0'>
                      <img
                        className='h-16 w-16 rounded-lg object-cover border border-gray-200'
                        src={`${import.meta.env.VITE_API_URL}/${product.foto}`}
                        alt={product.nama_produk}
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-sm font-medium text-gray-900 mb-1 line-clamp-2'>
                        {product.nama_produk}
                      </h3>
                      
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='text-xs text-gray-500'>Kategori:</span>
                          <span className='inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full'>
                            {product.nama_category || '-'}
                          </span>
                        </div>
                        
                        <div className='flex items-center justify-between'>
                          <span className='text-xs text-gray-500'>Harga:</span>
                          <span className='text-sm font-semibold text-gray-900'>
                            {Number(product.harga).toLocaleString('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        </div>
                        
                        <div className='flex items-center justify-between'>
                          <span className='text-xs text-gray-500'>Stok:</span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              product.stok > 10
                                ? 'bg-green-100 text-green-800'
                                : product.stok > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {product.stok} unit
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductTable;
