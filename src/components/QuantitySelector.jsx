import React from 'react';

const QuantitySelector = ({ quantity, setQuantity, maxStock }) => {
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < maxStock) {
      setQuantity(quantity + 1);
    }
  };
  
  const handleQuantityChange = (e) => {
    let value = parseInt(e.target.value) || 1;
    if (value < 1) value = 1;
    if (value > maxStock) value = maxStock;
    setQuantity(value);
  };

  return (
    <div className="mb-8">
      <label className="block text-amber-900 text-lg font-bold mb-4 text-center">
        Pilih Jumlah
      </label>
      <div className="flex items-center justify-center space-x-4 mb-2">
        <button
          onClick={decreaseQuantity}
          disabled={quantity <= 1}
          className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          −
        </button>
        <input
          type="number"
          min="1"
          max={maxStock}
          value={quantity}
          onChange={handleQuantityChange}
          className="w-20 h-12 text-center text-xl font-bold border-3 border-amber-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-300 focus:border-amber-500 bg-white text-amber-900"
        />
        <button
          onClick={increaseQuantity}
          disabled={quantity >= maxStock}
          className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          +
        </button>
      </div>
      <p className="text-sm text-amber-700 text-center font-medium">
        Maksimal: {maxStock} item
      </p>
    </div>
  );
};

export default QuantitySelector;