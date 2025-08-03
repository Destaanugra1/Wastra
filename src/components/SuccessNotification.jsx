import { useEffect } from 'react';

const SuccessNotification = ({ show, title, message, onClose, autoClose = true }) => {
  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Auto close after 4 seconds

      return () => clearTimeout(timer);
    }
  }, [show, onClose, autoClose]);

  if (!show) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md w-full">
      {/* Notification Card */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 transform transition-all duration-300 ease-out">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {title || 'Berhasil!'}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              {message || 'Operasi berhasil dilakukan!'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
            <div 
              className="bg-green-500 h-1 rounded-full transition-all duration-4000 ease-linear"
              style={{
                width: show ? '0%' : '100%',
                animation: show && autoClose ? 'progress 4s linear forwards' : 'none'
              }}
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default SuccessNotification;
