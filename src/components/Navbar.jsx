import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ButtoClick } from './Button';
import Logo from '../assets/Logo.png';
import { useCart } from '../context/CartContext'; // <-- IMPORT HOOK

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // Ambil data langsung dari Context. Tidak perlu useEffect atau state lokal.
  const { cartItems, cartCount } = useCart();

  const navigate = useNavigate();
  const handleAuth = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const id = user.id;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    // Refresh halaman untuk memastikan semua state di-reset
    window.location.reload();
  };

  const getUsername = () => {
    if (user.nama) {
      // Jika ada nama, ambil hanya nama depan (kata pertama)
      const firstName = user.nama.split(' ')[0];
      return firstName;
    }
    // Jika tidak ada nama, gunakan bagian depan email atau default 'User'
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.harga) * Number(item.jumlah),
      0
    );
  };

  return (
    <nav className='bg-[#5a3b24] border-gray-200 text-white dark:border-gray-700 sticky top-0 z-50'>
      <div className='max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2'>
        <div className='flex items-center cursor-pointer space-x-3'>
          <img src={Logo} alt='Logo' className='h-10 w-10' />
          <span className='self-center text-2xl font-semibold whitespace-nowrap'>
            {getUsername()}
          </span>
        </div>

        <div className='flex items-center space-x-4'>
          {handleAuth && (
            <div className='relative'>
              <button
                onClick={() => setCartOpen(!cartOpen)}
                className='relative p-2 text-white hover:text-[#dbaa7c] transition-colors'>
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 4.36a1 1 0 00.95 1.64h9.46a1 1 0 00.95-1.64L15 13M7 13v4a2 2 0 002 2h6a2 2 0 002-2v-4'
                  />
                </svg>
                {cartCount > 0 && (
                  <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                    {cartCount}
                  </span>
                )}
              </button>
              {cartOpen && (
                <div className='absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50'>
                  <div className='p-4'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                      Keranjang Belanja
                    </h3>
                    {cartItems.length === 0 ? (
                      <p className='text-gray-500 text-center py-4'>
                        Keranjang kosong
                      </p>
                    ) : (
                      <>
                        <div className='max-h-64 overflow-y-auto'>
                          {cartItems.slice(0, 3).map((item) => (
                            <div
                              key={item.id_item}
                              className='flex items-center gap-3 mb-3 pb-3 border-b border-gray-100'>
                              <img
                                src={`${import.meta.env.VITE_API_URL}/${
                                  item.foto
                                }`}
                                className='w-12 h-12 object-cover rounded'
                                alt={item.nama_produk}
                              />
                              <div className='flex-1'>
                                <p className='text-sm font-medium text-gray-800 truncate'>
                                  {item.nama_produk}
                                </p>
                                <p className='text-xs text-gray-500'>
                                  {item.jumlah}x{' '}
                                  {Number(item.harga).toLocaleString('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                          {cartItems.length > 3 && (
                            <p className='text-xs text-gray-500 text-center'>
                              +{cartItems.length - 3} item lainnya
                            </p>
                          )}
                        </div>
                        <div className='mt-3 pt-3 border-t border-gray-200'>
                          <div className='flex justify-between items-center mb-3'>
                            <span className='font-semibold text-gray-800'>
                              Total:
                            </span>
                            <span className='font-bold text-[#5a3b24]'>
                              {getTotalPrice().toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </span>
                          </div>
                          <Link
                            to='/cart'
                            className='block w-full bg-[#5a3b24] text-white text-center py-2 rounded hover:bg-[#4a2f1f] transition-colors'
                            onClick={() => setCartOpen(false)}>
                            Lihat Keranjang
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hamburger Menu */}
          <button
            type='button'
            className='inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600'
            aria-controls='navbar-dropdown'
            aria-expanded={open}
            onClick={() => setOpen(!open)}>
            <span className='sr-only'>Open main menu</span>
            <svg
              className='w-5 h-5'
              aria-hidden='true'
              fill='none'
              viewBox='0 0 17 14'>
              <path
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M1 1h15M1 7h15M1 13h15'
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div
          className={`${open ? '' : 'hidden'} w-full md:block md:w-auto`}
          id='navbar-dropdown'>
          <ul className='flex flex-col font-medium p-4 md:p-0 mt-4 text-white rounded-lg bg-[#5a3b24] md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0'>
            <li>
              <NavLink
                to='/'
                className={({ isActive }) =>
                  `block py-2 px-3 rounded-sm md:bg-transparent md:p-0 ${
                    isActive
                      ? 'text-[#dbaa7c] bg-blue-100 md:text-[#dbaa7c]'
                      : 'text-[#efe3b8] hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#dbaa7c] md:dark:hover:text-shadow-gray-600 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent'
                  }`
                }
                end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`/user/detail/${id}`}
                className={({ isActive }) =>
                  `block py-2 px-3 rounded-sm md:bg-transparent md:p-0 ${
                    isActive
                      ? 'text-[#dbaa7c] bg-blue-100 md:text-[#dbaa7c]'
                      : 'text-[#efe3b8] hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#dbaa7c] md:dark:hover:text-shadow-gray-600 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent'
                  }`
                }>
                Profile
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/toko'
                className={({ isActive }) =>
                  `block py-2 px-3 rounded-sm md:bg-transparent md:p-0 ${
                    isActive
                      ? 'text-[#dbaa7c] bg-blue-100 md:text-[#dbaa7c]'
                      : 'text-[#efe3b8] hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#dbaa7c] md:dark:hover:text-shadow-gray-600 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent'
                  }`
                }>
                Toko
              </NavLink>
            </li>
            <li>
              {handleAuth ? (
                <button 
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-gradient-to-r from-[#c09064] to-[#8d572c] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center">
                    <svg className="w-4 h-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    Logout
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e06c13] to-[#a03e0d] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              ) : (
                <Link
                  to='/login'
                  className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-gradient-to-r from-[#c09064] to-[#8d572c] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <svg className="w-4 h-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Login
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e06c13] to-[#a03e0d] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>

      {/* Overlay to close cart dropdown */}
      {cartOpen && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setCartOpen(false)}></div>
      )}
    </nav>
  );
};

export default Navbar;
