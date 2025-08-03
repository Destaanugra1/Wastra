import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import ChartCard from './ChartCard';
import CustomTooltip from './CustomTooltip';

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

const CategoryChart = ({ categorySales, formatCurrency }) => {
  return (
    <ChartCard
      title='Category Performance'
      subtitle='Sales breakdown by product categories'>
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
        {/* Pie Chart */}
        <div className='h-[350px] flex items-center justify-center'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={categorySales || []}
                dataKey='category_revenue'
                nameKey='nama_category'
                cx='50%'
                cy='50%'
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                innerRadius={40}>
                {(categorySales || []).map((entry, index) => (
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
          {(categorySales || []).map((category, index) => (
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
                      categorySales.reduce(
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
  );
};

export default CategoryChart;
