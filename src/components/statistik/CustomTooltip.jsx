import React from 'react';

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

export default CustomTooltip;
