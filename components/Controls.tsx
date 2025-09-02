
import React from 'react';

interface ControlsProps {
  isWebcamOn: boolean;
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
}

const Controls: React.FC<ControlsProps> = ({ isWebcamOn, isProcessing, onStart, onStop }) => {
  return (
    <div className="flex space-x-4">
      {!isWebcamOn ? (
        <button
          onClick={onStart}
          disabled={isProcessing}
          className="px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition duration-200 ease-in-out disabled:bg-gray-500"
        >
          Start Webcam
        </button>
      ) : (
        <button
          onClick={onStop}
          className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition duration-200 ease-in-out"
        >
          Stop Webcam
        </button>
      )}
    </div>
  );
};

export default Controls;
