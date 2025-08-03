import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Activity,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import {
  StatCard,
  WeeklyReportChart,
  WeeklyInsights,
  RevenueChart,
  OrdersChart,
  CategoryChart,
} from '../../components/statistik';

const Laporan = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8080/api/statistics/weekly'
        );
        if (response.data.status === 'success') {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const lineChartData = stats?.weekly_revenue?.map((day) => ({
    date: new Date(day.date).toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric',
    }),
    value: parseFloat(day.daily_revenue),
    orders: parseInt(day.order_count),
    customers: Math.round(parseInt(day.order_count) * 0.8), // Estimasi customers ~ 80% dari orders
  }));

  if (loading) {
    return (
      <div className='flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100'>
        <Sidebar />
        <div className='flex-1 p-8'>
          <div className='max-w-7xl mx-auto'>
            <div className='animate-pulse space-y-6'>
              <div className='h-10 bg-gray-200 rounded-xl w-1/3'></div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className='h-40 bg-gray-200 rounded-2xl'></div>
                ))}
              </div>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div className='h-96 bg-gray-200 rounded-2xl'></div>
                <div className='h-96 bg-gray-200 rounded-2xl'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100'>
      <Sidebar />
      <div className='flex-1 p-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <div className='flex items-center space-x-3 mb-2'>
              <div className='p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl'>
                <Activity className='w-6 h-6 text-white' />
              </div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
                Dashboard Analytics
              </h1>
            </div>
            <p className='text-gray-600'>
              Monitor your business performance in real-time
            </p>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <StatCard
              title='Total Revenue'
              value={formatCurrency(
                stats?.weekly_revenue?.reduce(
                  (acc, day) => acc + parseFloat(day.daily_revenue),
                  0
                ) || 0
              )}
              description='Weekly earnings'
              icon={DollarSign}
              trend={{ direction: 'up', value: '12.5' }}
              color='blue'
            />
            <StatCard
              title='Total Orders'
              value={stats?.weekly_revenue?.reduce(
                (acc, day) => acc + parseInt(day.order_count),
                0
              )}
              description='This week'
              icon={ShoppingBag}
              trend={{ direction: 'up', value: '8.2' }}
              color='green'
            />
            <StatCard
              title='Average Order'
              value={formatCurrency(stats?.analytics?.avg_order_value)}
              description='Per transaction'
              icon={TrendingUp}
              trend={{ direction: 'down', value: '2.1' }}
              color='yellow'
            />
            <StatCard
              title='Unique Customers'
              value={stats?.analytics?.unique_customers}
              description='Active users'
              icon={Users}
              trend={{ direction: 'up', value: '15.3' }}
              color='purple'
            />
          </div>

          {/* Charts Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
            {/* Revenue Trend Chart */}
            <RevenueChart data={lineChartData} formatCurrency={formatCurrency} />

            {/* Orders Bar Chart */}
            <OrdersChart data={lineChartData} />
          </div>

          {/* Weekly Report Chart */}
          <div className='mb-6'>
            <WeeklyReportChart 
              data={lineChartData} 
              title='Laporan Mingguan Lengkap'
            />
          </div>

          {/* Weekly Insights */}
          <div className='mb-6'>
            <WeeklyInsights data={lineChartData} formatCurrency={formatCurrency} />
          </div>

          {/* Category Analysis */}
          <CategoryChart 
            categorySales={stats?.category_sales} 
            formatCurrency={formatCurrency} 
          />
        </div>
      </div>
    </div>
  );
};

export default Laporan;
