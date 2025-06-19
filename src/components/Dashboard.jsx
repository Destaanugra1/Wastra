import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, ArcElement } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Users, ShoppingBag, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar'
import ProductStats from './ProductStats';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        // Real API call to backend endpoint
        const response = await axios.get('http://localhost:8080/api/admin/dashboard-stats');
        
        if (response.data && response.data.status === 'success') {
          setStats(response.data.data);
        } else {
          throw new Error('Invalid response format');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data: ' + (err.response?.data?.message || err.message));
        setLoading(false);
        console.error('Dashboard error:', err);
      }
    };

    fetchDashboardStats();
    
    // Optional: Set up interval to refresh data periodically
    const intervalId = setInterval(fetchDashboardStats, 60000); // Refresh every 60 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        padding: 12,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        bodyFont: {
          size: 13
        },
        titleFont: {
          size: 14,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          precision: 0,
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4 // Smoother curves
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 6
      }
    }
  };

  // Bar chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          precision: 0,
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  // Pie chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          font: {
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const chartData = stats ? {
    labels: stats.monthlyData.map(data => data.month),
    datasets: [
      {
        label: 'Successful Purchases',
        data: stats.monthlyData.map(data => data.success),
        borderColor: 'rgb(56, 178, 172)', // Teal
        backgroundColor: 'rgba(56, 178, 172, 0.5)',
        fill: true,
        borderWidth: 2,
      },
      {
        label: 'Pending Purchases',
        data: stats.monthlyData.map(data => data.pending),
        borderColor: 'rgb(246, 173, 85)', // Orange
        backgroundColor: 'rgba(246, 173, 85, 0.5)',
        fill: true,
        borderWidth: 2,
      },
    ],
  } : null;

  // Bar chart data
  const barChartData = stats ? {
    labels: stats.monthlyData.map(data => data.month),
    datasets: [
      {
        label: 'Successful Purchases',
        data: stats.monthlyData.map(data => data.success),
        backgroundColor: 'rgba(56, 178, 172, 0.8)',
        borderColor: 'rgb(56, 178, 172)',
        borderWidth: 1,
      },
      {
        label: 'Pending Purchases',
        data: stats.monthlyData.map(data => data.pending),
        backgroundColor: 'rgba(246, 173, 85, 0.8)',
        borderColor: 'rgb(246, 173, 85)',
        borderWidth: 1,
      },
    ],
  } : null;

  // Pie chart data
  const pieChartData = stats ? {
    labels: ['Successful Purchases', 'Pending Purchases'],
    datasets: [
      {
        data: [stats.successfulTransactions, stats.pendingTransactions],
        backgroundColor: [
          'rgba(56, 178, 172, 0.8)',
          'rgba(246, 173, 85, 0.8)',
        ],
        borderColor: [
          'rgb(56, 178, 172)',
          'rgb(246, 173, 85)',
        ],
        borderWidth: 2,
      },
    ],
  } : null;

  if (loading) {
    return (
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="flex-1 bg-gray-50 p-8">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-500">Welcome to your admin dashboard</p>
          </header>

          <div className="mb-8">
            <ProductStats />
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* User Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Verified Users</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.verifiedUsers}</h3>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Active registered users with verified emails
                </div>
              </div>
              <div className="h-1 bg-blue-500"></div>
            </div>
            
            {/* Successful Transactions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Successful Purchases</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.successfulTransactions}</h3>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Completed purchase transactions
                </div>
              </div>
              <div className="h-1 bg-green-500"></div>
            </div>
            
            {/* Pending Transactions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Purchases</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.pendingTransactions}</h3>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Transactions awaiting completion
                </div>
              </div>
              <div className="h-1 bg-amber-500"></div>
            </div>
            
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {/* Line Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Purchase Trends (Line Chart)</h2>
                <div className="flex space-x-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-teal-500 mr-2"></div>
                    <span className="text-sm text-gray-500">Success</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-400 mr-2"></div>
                    <span className="text-sm text-gray-500">Pending</span>
                  </div>
                </div>
              </div>
              <div className="h-80">
                {chartData && <Line options={chartOptions} data={chartData} />}
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Purchase Comparison (Bar Chart)</h2>
                <div className="flex space-x-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-teal-500 mr-2"></div>
                    <span className="text-sm text-gray-500">Success</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-400 mr-2"></div>
                    <span className="text-sm text-gray-500">Pending</span>
                  </div>
                </div>
              </div>
              <div className="h-80">
                {barChartData && <Bar options={barChartOptions} data={barChartData} />}
              </div>
            </div>
          </div>

          {/* Pie Chart and Summary Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {/* Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Transaction Distribution</h2>
              </div>
              <div className="h-80">
                {pieChartData && <Pie options={pieChartOptions} data={pieChartData} />}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-teal-800">Success Rate</h3>
                      <p className="text-2xl font-bold text-teal-600">
                        {stats.successfulTransactions && stats.pendingTransactions 
                          ? ((stats.successfulTransactions / (stats.successfulTransactions + stats.pendingTransactions)) * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                    <ShoppingBag className="h-8 w-8 text-teal-500" />
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-amber-800">Pending Rate</h3>
                      <p className="text-2xl font-bold text-amber-600">
                        {stats.successfulTransactions && stats.pendingTransactions 
                          ? ((stats.pendingTransactions / (stats.successfulTransactions + stats.pendingTransactions)) * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-amber-500" />
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-800">Total Transactions</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.successfulTransactions + stats.pendingTransactions}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Dashboard Summary</h2>
            <p className="text-gray-600 mb-3">
              This dashboard provides real-time insights into your business operations. The data is automatically refreshed every minute to ensure you always have the latest information.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="font-medium text-gray-700">User Base</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Your platform has {stats.verifiedUsers} verified users ready to make purchases.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="font-medium text-gray-700">Transaction Status</h3>
                <p className="text-gray-500 text-sm mt-1">
                  {stats.successfulTransactions} successful and {stats.pendingTransactions} pending purchases tracked in the system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;