import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill='white'
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline='central'>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const StatCard = ({ title, value, icon: Icon, description }) => (
  <div className='bg-white rounded-lg p-6 shadow-sm'>
    <div className='flex items-center justify-between'>
      <div>
        <p className='text-sm font-medium text-gray-600'>{title}</p>
        <p className='text-2xl font-bold mt-2'>{value}</p>
        {description && (
          <p className='text-sm text-gray-500 mt-1'>{description}</p>
        )}
      </div>
      <div className='bg-blue-50 p-3 rounded-full'>
        <Icon className='h-6 w-6 text-blue-500' />
      </div>
    </div>
  </div>
);

const Laporan = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/statistics/weekly');
      if (response.data.status === 'success') {
        console.log("DEBUG RAW ITEMS:", response.data.debug.raw_items); // Tambahkan baris ini
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

  if (loading) {
    return (
      <div className='flex min-h-screen bg-gray-50'>
        <Sidebar />
        <div className='flex-1 p-8'>
          <div className='animate-pulse space-y-4'>
            <div className='h-8 bg-gray-200 rounded w-1/4'></div>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className='h-32 bg-gray-200 rounded'></div>
              ))}
            </div>
            <div className='h-96 bg-gray-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 p-8'>
        <div className='max-w-7xl mx-auto'>
          <h1 className='text-2xl font-bold text-gray-900 mb-6'>
            Dashboard Overview
          </h1>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <StatCard
              title='Pendapatan'
              value={formatCurrency(
                stats?.weekly_revenue?.reduce(
                  (acc, day) => acc + parseFloat(day.daily_revenue),
                  0
                ) || 0
              )}
              icon={DollarSign}
            />
            <StatCard
              title='Total Belanja'
              value={stats?.weekly_revenue?.reduce(
                (acc, day) => acc + parseInt(day.order_count),
                0
              )}
              icon={ShoppingBag}
            />
            <StatCard
              title='Mean Order'
              value={formatCurrency(stats?.analytics?.avg_order_value)}
              icon={TrendingUp}
            />
            <StatCard
              title='Unique Customers'
              value={stats?.analytics?.unique_customers}
              icon={Users}
            />
          </div>

          {/* Charts */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Revenue Chart */}
            <div className='bg-white p-6 rounded-lg shadow-sm'>
              <h2 className='text-lg font-semibold mb-4'>Weekly Revenue</h2>
              <div className='h-[300px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={stats?.weekly_revenue}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey='daily_revenue' fill='#3B82F6' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Sales Chart */}
            <div className='bg-white p-6 rounded-lg shadow-sm'>
              <h2 className='text-lg font-semibold mb-4'>Category Sales</h2>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div className='h-[300px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={stats?.category_sales || []}
                        dataKey='category_revenue' // pastikan ini pakai revenue untuk ukuran pie
                        nameKey='nama_category'
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}>
                        {(stats?.category_sales || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [
                          `Rp ${Number(value).toLocaleString('id-ID')}`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className='flex flex-col justify-center space-y-4'>
                  {(stats?.category_sales || []).map((category, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                      <div className='flex items-center space-x-3'>
                        <div
                          className='w-4 h-4 rounded-full'
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className='font-medium'>
                          {category.nama_category}
                        </span>
                      </div>
                      <div className='text-sm text-gray-600'>
                        {category.total_sales} orders
                        <span className='ml-2 text-gray-400'>
                          ({formatCurrency(category.category_revenue || 0)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Laporan;
