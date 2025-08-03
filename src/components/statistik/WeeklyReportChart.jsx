import React from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DollarSign, ShoppingBag, Users, Calendar } from 'lucide-react';
import ChartCard from './ChartCard';

const WeeklyReportChart = ({ data, title }) => {
  return (
    <ChartCard 
      title={title}
      subtitle='Laporan lengkap performa mingguan dengan tren analisis'
    >
      <div className='space-y-6'>
        {/* Multi-line Chart untuk Revenue, Orders, dan Customer */}
        <div className='h-[400px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart data={data || []}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis 
                dataKey='date' 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                yAxisId='revenue'
                orientation='left'
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                yAxisId='count'
                orientation='right'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className='bg-white p-4 rounded-xl shadow-xl border border-gray-200'>
                        <p className='font-semibold text-gray-900 mb-2'>{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className='text-sm flex items-center space-x-2'>
                            <span 
                              className='w-3 h-3 rounded-full'
                              style={{ backgroundColor: entry.color }}
                            ></span>
                            <span>
                              {entry.name === 'value' ? 'Revenue' : 
                               entry.name === 'orders' ? 'Orders' : 
                               entry.name === 'customers' ? 'Customers' : entry.name}: {' '}
                              {entry.name === 'value' ? 
                                new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  minimumFractionDigits: 0,
                                }).format(entry.value) : 
                                entry.value
                              }
                            </span>
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              
              {/* Revenue Area Chart */}
              <Area
                yAxisId='revenue'
                type='monotone'
                dataKey='value'
                stroke='#6366F1'
                strokeWidth={3}
                fill='url(#colorRevenue)'
                fillOpacity={0.2}
                name='Revenue'
              />
              
              {/* Orders Line Chart */}
              <Line
                yAxisId='count'
                type='monotone'
                dataKey='orders'
                stroke='#10B981'
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                name='Orders'
              />
              
              {/* Customers Line Chart */}
              <Line
                yAxisId='count'
                type='monotone'
                dataKey='customers'
                stroke='#F59E0B'
                strokeWidth={3}
                strokeDasharray='5 5'
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#F59E0B', strokeWidth: 2 }}
                name='Customers'
              />
              
              <defs>
                <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#6366F1' stopOpacity={0.3}/>
                  <stop offset='95%' stopColor='#6366F1' stopOpacity={0}/>
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Weekly Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6'>
          <div className='bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-blue-500 rounded-lg'>
                <DollarSign className='w-5 h-5 text-white' />
              </div>
              <div>
                <p className='text-sm font-medium text-blue-700'>Total Revenue</p>
                <p className='text-xl font-bold text-blue-900'>
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(
                    data?.reduce((acc, day) => acc + (day.value || 0), 0) || 0
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className='bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-green-500 rounded-lg'>
                <ShoppingBag className='w-5 h-5 text-white' />
              </div>
              <div>
                <p className='text-sm font-medium text-green-700'>Total Orders</p>
                <p className='text-xl font-bold text-green-900'>
                  {data?.reduce((acc, day) => acc + (day.orders || 0), 0) || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className='bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-yellow-500 rounded-lg'>
                <Users className='w-5 h-5 text-white' />
              </div>
              <div>
                <p className='text-sm font-medium text-yellow-700'>Avg Daily Customers</p>
                <p className='text-xl font-bold text-yellow-900'>
                  {Math.round(
                    (data?.reduce((acc, day) => acc + (day.customers || 0), 0) || 0) / 
                    (data?.length || 1)
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Daily Performance Table */}
        <div className='bg-gray-50 rounded-xl p-4'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2'>
            <Calendar className='w-5 h-5' />
            <span>Performa Harian</span>
          </h3>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-200'>
                  <th className='text-left py-2 px-3 font-semibold text-gray-700'>Hari</th>
                  <th className='text-right py-2 px-3 font-semibold text-gray-700'>Revenue</th>
                  <th className='text-right py-2 px-3 font-semibold text-gray-700'>Orders</th>
                  <th className='text-right py-2 px-3 font-semibold text-gray-700'>Customers</th>
                  <th className='text-right py-2 px-3 font-semibold text-gray-700'>Avg Order</th>
                </tr>
              </thead>
              <tbody>
                {(data || []).map((day, index) => (
                  <tr key={index} className='border-b border-gray-100 hover:bg-white transition-colors'>
                    <td className='py-3 px-3 font-medium text-gray-900'>{day.date}</td>
                    <td className='py-3 px-3 text-right text-gray-700'>
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(day.value || 0)}
                    </td>
                    <td className='py-3 px-3 text-right text-gray-700'>{day.orders || 0}</td>
                    <td className='py-3 px-3 text-right text-gray-700'>{day.customers || 0}</td>
                    <td className='py-3 px-3 text-right text-gray-700'>
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format((day.value || 0) / (day.orders || 1))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ChartCard>
  );
};

export default WeeklyReportChart;
