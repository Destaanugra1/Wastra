import React from 'react';

const ChartCard = ({ title, children, subtitle }) => (
  <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300'>
    <div className='mb-6'>
      <h2 className='text-xl font-bold text-gray-900 mb-1'>{title}</h2>
      {subtitle && <p className='text-sm text-gray-500'>{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default ChartCard;
