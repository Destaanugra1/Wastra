import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, CheckCircle, XCircle, DollarSign } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md`}>
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>
          <p className="text-sm text-gray-600 mt-2">{description}</p>
        </div>
        <div className={`p-4 bg-${color}-50 rounded-full`}>
          <Icon className={`h-8 w-8 text-${color}-500`} />
        </div>
      </div>
    </div>
    <div className={`h-1 bg-${color}-500`}></div>
  </div>
);

const ProductStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/products/total');
        if (response.data.status === 'success') {
          setStats(response.data.data);
        }
      } catch (err) {
        setError('Failed to load product statistics');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
        {[1].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>

                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-6">
        <div className="flex items-center">
          <XCircle className="h-6 w-6 text-red-500 mr-3" />
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Semua Produk',
      value: stats?.total || 0,
      icon: Package,
      color: 'blue',
      description: 'Produk di data base'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
      {cards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
};

export default ProductStats;