
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-cyan-200 animate-pulse">ANALYZING...</p>
    </div>
  );
};

export default Loader;
