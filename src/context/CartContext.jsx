import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  getCartByUser,
  addToCart as addToCartService,
  updateCartQuantity as updateCartQuantityService,
  deleteCartItem as deleteCartItemService,
  clearCart as clearCartService,
} from '../service/Cart';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    const user = localStorage.getItem('user');
    if (!user) {
      setCartItems([]);
      setCartCount(0);
      return;
    }
    try {
      const userData = JSON.parse(user);
      const res = await getCartByUser(userData.id);
      const items = res.data.items || res.data.data?.items || [];

      console.log(`[FETCH] Menerima ${items.length} item dari server.`); // Debugger
      setCartItems(items);

      const total = items.reduce((sum, item) => sum + Number(item.jumlah), 0);
      setCartCount(total);
    } catch (error) {
      console.error('Gagal mengambil keranjang:', error);
    }
  };

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await fetchCart();
      setLoading(false);
    };
    initialLoad();
  }, []);

  const runCartAction = async (action) => {
    try {
      await action();
      await fetchCart(); // Selalu fetch ulang setelah aksi
    } catch (error) {
      console.error('Aksi keranjang gagal:', error);
      alert('Terjadi kesalahan, silakan coba lagi.');
    }
  };

  const handleAddToCart = async (product) => {
    runCartAction(async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) throw new Error('User tidak login.');

      const existingItem = cartItems.find(
        (item) => item.product_id === product.id_product
      );
      if (existingItem) {
        if (Number(existingItem.jumlah) + 1 > product.stok) {
          alert(`Stok hanya tersisa ${product.stok}.`);
          return;
        }
        await updateCartQuantityService(existingItem.id_item, {
          jumlah: Number(existingItem.jumlah) + 1,
        });
      } else {
        if (product.stok < 1) {
          alert('Stok produk habis.');
          return;
        }
        await addToCartService({
          user_id: user.id,
          product_id: product.id_product,
          jumlah: 1,
        });
      }
    });
  };

  const handleRemoveItem = (itemId) =>
    runCartAction(() => deleteCartItemService(itemId));
  const handleClearCart = () =>
    runCartAction(() => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.id && window.confirm('Kosongkan keranjang?')) {
        return clearCartService(user.id);
      }
    });
  const handleQuantityChange = (item, newQuantity) => {
    const qty = Number(newQuantity); // PASTIKAN ANGKA!
    if (qty < 1) return handleRemoveItem(item.id_item);
    if (qty > item.stok) {
      alert(`Stok tersedia hanya ${item.stok}.`);
      return;
    }
    runCartAction(() =>
      updateCartQuantityService(item.id_item, { jumlah: qty })
    );
  };

  const value = {
    cartItems,
    cartCount,
    loading,
    handleAddToCart,
    handleRemoveItem,
    handleQuantityChange,
    handleClearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
