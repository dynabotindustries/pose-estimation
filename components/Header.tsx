
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full max-w-4xl mb-6 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500 pb-2">
        Gemini Pose Estimation
      </h1>
      <p className="text-gray-400">A real-time demonstration using your webcam</p>
    </header>
  );
};

export default Header;
