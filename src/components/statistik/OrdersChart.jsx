import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import ChartCard from './ChartCard';
import CustomTooltip from './CustomTooltip';

const OrdersChart = ({ data }) => {
  return (
    <ChartCard
      title='Daily Orders'
      subtitle='Order volume throughout the week'>
      <div className='h-[320px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={data || []}>
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
  );
};

export default OrdersChart;
