import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  Plus,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  X,
  Shirt,
  ChartColumn,
} from 'lucide-react';
import { generateRandomCode } from '../service/RandomUrl';

const Sidebar = () => {
  const url = `/${generateRandomCode()}`;
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Halaman Admin', path: '/utama' },
    { icon: Package, label: 'Produk', path: `${url}` },
    { icon: Plus, label: 'Tambah Produk', path: '/create' },
    { icon: Users, label: 'Pengguna', path: '/users' },
    { icon: ShoppingCart, label: 'Pesanan', path: '/orders' },
    { icon: Shirt, label: 'Category', path: '/category' },
    { icon: ChartColumn, label: 'Laporan Statistik', path: '/laporan' },
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg border border-gray-200'>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className='lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40'
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 min-h-screen bg-white shadow-xl border-r border-gray-200 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:shadow-none w-64`}>
        {/* Header */}
        <div className='p-6 border-b border-gray-200'>
          <Link to="/toko">
            <h1 className='text-xl font-bold text-gray-800'>Admin Panel</h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className='p-4 space-y-2'>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                <Icon size={20} />
                <span className='font-medium'>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        {/* Footer */}
      </div>
    </>
  );
};

export default Sidebar;
