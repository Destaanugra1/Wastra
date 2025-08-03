import React from 'react';

const ResponsiveDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-responsive-xl font-bold text-gray-900 mb-8 text-center">
          Responsive Design Demo
        </h1>
        
        {/* Responsive Grid Cards */}
        <div className="grid-responsive-cards mb-8">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mobile-transition hover:shadow-md"
            >
              <div className="w-full h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg mb-4"></div>
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                Product Title {item}
              </h3>
              <p className="text-responsive-sm text-gray-600 line-clamp-2 mb-4">
                This is a sample description that will be truncated on mobile devices 
                to maintain clean layout and readability across different screen sizes.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-responsive-base font-bold text-blue-600">
                  $99.99
                </span>
                <button className="touch-friendly bg-blue-600 text-white px-4 py-2 rounded-lg text-responsive-sm font-medium hover:bg-blue-700 mobile-transition">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Responsive Typography Demo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 container-responsive mb-8">
          <h2 className="text-responsive-xl font-bold text-gray-900 mb-4">
            Typography Scale
          </h2>
          <div className="space-y-3">
            <p className="text-responsive-sm text-gray-600">
              Small responsive text - perfect for captions and details
            </p>
            <p className="text-responsive-base text-gray-700">
              Base responsive text - ideal for body content and descriptions
            </p>
            <p className="text-responsive-lg text-gray-800">
              Large responsive text - great for section headings and emphasis
            </p>
            <p className="text-responsive-xl text-gray-900 font-semibold">
              Extra large responsive text - perfect for main headings
            </p>
          </div>
        </div>

        {/* Touch-Friendly Elements Demo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 container-responsive">
          <h2 className="text-responsive-xl font-bold text-gray-900 mb-4">
            Touch-Friendly Elements
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Save', 'Edit', 'Delete', 'Share', 'Print', 'Export'].map((action) => (
              <button
                key={action}
                className="touch-friendly bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-responsive-sm font-medium mobile-transition focus-mobile"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Breakpoint Indicator */}
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm font-mono">
          <span className="sm:hidden">XS</span>
          <span className="hidden sm:inline lg:hidden">SM</span>
          <span className="hidden lg:inline xl:hidden">LG</span>
          <span className="hidden xl:inline">XL</span>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveDemo;
