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
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Activity,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const COLORS = [
  '#6366F1',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
];
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
      dominantBaseline='central'
      className='text-xs font-semibold'>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const StatCard = ({ title, value, description, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className='group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100'>
      <div
        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full transform translate-x-8 -translate-y-8`}></div>
      <div className='relative'>
        <div className='flex items-center justify-between mb-4'>
          {trend && (
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend.direction === 'up'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
              {trend.direction === 'up' ? (
                <ArrowUp className='w-3 h-3' />
              ) : (
                <ArrowDown className='w-3 h-3' />
              )}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        <div>
          <p className='text-sm font-medium text-gray-600 mb-1'>{title}</p>
          <p className='text-2xl font-bold text-gray-900 mb-1'>{value}</p>
          {description && (
            <p className='text-sm text-gray-500'>{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, children, subtitle }) => (
  <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300'>
    <div className='mb-6'>
      <h2 className='text-xl font-bold text-gray-900 mb-1'>{title}</h2>
      {subtitle && <p className='text-sm text-gray-500'>{subtitle}</p>}
    </div>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white p-4 rounded-xl shadow-xl border border-gray-200'>
        <p className='font-semibold text-gray-900 mb-2'>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className='text-sm' style={{ color: entry.color }}>
            {`${entry.name}: ${
              formatter ? formatter(entry.value) : entry.value
            }`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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
            <ChartCard
              title='Revenue Trend'
              subtitle='Daily performance over the week'>
              <div className='h-[320px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={lineChartData || []}>
                    <defs>
                      <linearGradient
                        id='colorRevenue'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'>
                        <stop
                          offset='5%'
                          stopColor='#6366F1'
                          stopOpacity={0.3}
                        />
                        <stop
                          offset='95%'
                          stopColor='#6366F1'
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                    <XAxis
                      dataKey='date'
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `${(value / 1000000).toFixed(1)}M`
                      }
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <Tooltip
                      content={<CustomTooltip formatter={formatCurrency} />}
                    />
                    <Area
                      type='monotone'
                      dataKey='value'
                      stroke='#6366F1'
                      strokeWidth={3}
                      fillOpacity={1}
                      fill='url(#colorRevenue)'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Orders Bar Chart */}
            <ChartCard
              title='Daily Orders'
              subtitle='Order volume throughout the week'>
              <div className='h-[320px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={lineChartData || []}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                    <XAxis
                      dataKey='date'
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey='orders'
                      fill='url(#barGradient)'
                      radius={[8, 8, 0, 0]}
                    />
                    <defs>
                      <linearGradient
                        id='barGradient'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'>
                        <stop offset='0%' stopColor='#10B981' />
                        <stop offset='100%' stopColor='#059669' />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Category Analysis */}
          <ChartCard
            title='Category Performance'
            subtitle='Sales breakdown by product categories'>
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
              {/* Pie Chart */}
              <div className='h-[350px] flex items-center justify-center'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={stats?.category_sales || []}
                      dataKey='category_revenue'
                      nameKey='nama_category'
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={120}
                      innerRadius={40}>
                      {(stats?.category_sales || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={
                        <CustomTooltip
                          formatter={(value) => formatCurrency(value)}
                        />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend & Stats */}
              <div className='flex flex-col justify-center space-y-4'>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Category Breakdown
                </h3>
                {(stats?.category_sales || []).map((category, index) => (
                  <div
                    key={index}
                    className='group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-200 cursor-pointer'>
                    <div className='flex items-center space-x-4'>
                      <div
                        className='w-4 h-4 rounded-full shadow-sm'
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <div>
                        <span className='font-semibold text-gray-900 group-hover:text-gray-700'>
                          {category.nama_category}
                        </span>
                        <p className='text-sm text-gray-500'>
                          {category.total_sales} orders
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='font-bold text-gray-900'>
                        {formatCurrency(category.category_revenue || 0)}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {(
                          (category.category_revenue /
                            stats.category_sales.reduce(
                              (acc, cat) => acc + cat.category_revenue,
                              0
                            )) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Laporan;
