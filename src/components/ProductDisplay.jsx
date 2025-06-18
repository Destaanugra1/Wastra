import React from 'react';

const VITE_API_URL = import.meta.env.VITE_API_URL;

const ProductDisplay = ({ product }) => {
  const formatCurrency = (number) =>
    Number(number).toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  return (
    <>
      {/* Product Image */}
      <div className="relative mb-6 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white rounded-2xl p-2">
          <img
            src={`${VITE_API_URL}/${product.foto}`}
            alt={product.nama_produk}
            className="w-full h-80 object-cover rounded-xl shadow-lg"
          />
        </div>
      </div>

      {/* Product Title */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-amber-900 mb-2 tracking-wide">
          {product.nama_produk}
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-600 mx-auto rounded-full"></div>
      </div>

      {/* Price & Stock */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl border-2 border-amber-200">
        <div>
          <p className="text-3xl font-bold text-amber-800">
            {formatCurrency(product.harga)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-amber-700 font-medium">Stok Tersedia</p>
          <p className="text-2xl font-bold text-amber-800">{product.stok}</p>
        </div>
      </div>
      
      {/* Description */}
      <div className="mb-8 p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200">
        <h3 className="text-lg font-semibold text-amber-900 mb-3 text-center">Deskripsi Produk</h3>
        <p className="text-amber-800 leading-relaxed whitespace-pre-wrap text-center">
          {product.deskripsi}
        </p>
      </div>
    </>
  );
};

export default ProductDisplay;