import React from 'react';

const Alert = ({ message, onClose }) => (
  <div className="rounded-md border border-gray-300 bg-white p-4 shadow-sm fixed top-6 left-1/2 -translate-x-1/2 z-50 min-w-[320px]">
    <div className="flex items-start gap-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-6 text-green-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="flex-1">
        <strong className="font-medium text-gray-900">Login Berhasil</strong>
        <p className="mt-0.5 text-sm text-gray-700">{message}</p>
      </div>
      <button
        className="-m-3 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
        type="button"
        aria-label="Dismiss alert"
        onClick={onClose}
      >
        <span className="sr-only">Dismiss popup</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
);

export default Alert;