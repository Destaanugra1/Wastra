import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

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

export default StatCard;
