import React from 'react';
import { TrendingUp, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import ChartCard from './ChartCard';

const WeeklyInsights = ({ data, formatCurrency }) => {
  return (
    <ChartCard 
      title='Insights & Analisis Mingguan'
      subtitle='Analisis mendalam performa bisnis minggu ini'
    >
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Performance Metrics */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center space-x-2'>
            <BarChart3 className='w-5 h-5 text-blue-500' />
            <span>Metrik Performa</span>
          </h3>
          
          <div className='space-y-3'>
            <div className='bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg'>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium text-blue-700'>Revenue Harian Rata-rata</span>
                <span className='text-lg font-bold text-blue-900'>
                  {formatCurrency(
                    (data?.reduce((acc, day) => acc + (day.value || 0), 0) || 0) / 
                    (data?.length || 1)
                  )}
                </span>
              </div>
            </div>
            
            <div className='bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg'>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium text-green-700'>Orders Harian Rata-rata</span>
                <span className='text-lg font-bold text-green-900'>
                  {Math.round(
                    (data?.reduce((acc, day) => acc + (day.orders || 0), 0) || 0) / 
                    (data?.length || 1)
                  )} orders
                </span>
              </div>
            </div>
            
            <div className='bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg'>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium text-purple-700'>Conversion Rate</span>
                <span className='text-lg font-bold text-purple-900'>
                  {(
                    ((data?.reduce((acc, day) => acc + (day.orders || 0), 0) || 0) /
                    (data?.reduce((acc, day) => acc + (day.customers || 0), 0) || 1)) * 100
                  ).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trend Analysis */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center space-x-2'>
            <TrendingUp className='w-5 h-5 text-green-500' />
            <span>Analisis Tren</span>
          </h3>
          
          <div className='space-y-3'>
            {/* Revenue Trend */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium text-gray-700'>Tren Revenue</span>
                {data && data.length >= 2 && (
                  <span className={`text-sm font-semibold flex items-center space-x-1 ${
                    data[data.length - 1].value > data[0].value 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data[data.length - 1].value > data[0].value 
                      ? <ArrowUp className='w-4 h-4' /> : <ArrowDown className='w-4 h-4' />
                    }
                    <span>
                      {(
                        ((data[data.length - 1].value - data[0].value) / 
                        data[0].value) * 100
                      ).toFixed(1)}%
                    </span>
                  </span>
                )}
              </div>
              <p className='text-xs text-gray-600'>
                {data && data.length >= 2 
                  ? data[data.length - 1].value > data[0].value
                    ? 'Revenue menunjukkan tren positif selama minggu ini'
                    : 'Revenue mengalami penurunan, perlu perhatian khusus'
                  : 'Data tidak cukup untuk analisis tren'
                }
              </p>
            </div>
            
            {/* Orders Trend */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium text-gray-700'>Tren Orders</span>
                {data && data.length >= 2 && (
                  <span className={`text-sm font-semibold flex items-center space-x-1 ${
                    data[data.length - 1].orders > data[0].orders 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data[data.length - 1].orders > data[0].orders 
                      ? <ArrowUp className='w-4 h-4' /> : <ArrowDown className='w-4 h-4' />
                    }
                    <span>
                      {(
                        ((data[data.length - 1].orders - data[0].orders) / 
                        data[0].orders) * 100
                      ).toFixed(1)}%
                    </span>
                  </span>
                )}
              </div>
              <p className='text-xs text-gray-600'>
                {data && data.length >= 2 
                  ? data[data.length - 1].orders > data[0].orders
                    ? 'Jumlah orders mengalami peningkatan yang baik'
                    : 'Orders menurun, evaluasi strategi marketing diperlukan'
                  : 'Data tidak cukup untuk analisis tren'
                }
              </p>
            </div>
            
            {/* Best Performance Day */}
            <div className='bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium text-yellow-700'>Hari Terbaik</span>
                <span className='text-sm font-semibold text-yellow-900'>
                  {data?.reduce((best, current) => 
                    current.value > best.value ? current : best, 
                    data[0] || {}
                  )?.date || 'N/A'}
                </span>
              </div>
              <p className='text-xs text-yellow-600'>
                Revenue: {formatCurrency(
                  data?.reduce((best, current) => 
                    current.value > best.value ? current : best, 
                    data[0] || {}
                  )?.value || 0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ChartCard>
  );
};

export default WeeklyInsights;
