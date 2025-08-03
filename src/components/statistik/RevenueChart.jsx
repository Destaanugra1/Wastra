import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import ChartCard from './ChartCard';
import CustomTooltip from './CustomTooltip';

const RevenueChart = ({ data, formatCurrency }) => {
  return (
    <ChartCard
      title='Revenue Trend'
      subtitle='Daily performance over the week'>
      <div className='h-[320px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={data || []}>
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
            <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
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
  );
};

export default RevenueChart;
