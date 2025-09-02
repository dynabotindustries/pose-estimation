
import React, { useEffect, RefObject } from 'react';
import { Pose } from '../types';
import { drawPose } from '../utils/drawing';
import Loader from './Loader';

interface WebcamFeedProps {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  detectedPose: Pose | null;
  isProcessing: boolean;
  webcamOn: boolean;
}

const WebcamFeed: React.FC<WebcamFeedProps> = ({ videoRef, canvasRef, detectedPose, isProcessing, webcamOn }) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video && video.readyState >= 2) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (detectedPose) {
          drawPose(ctx, detectedPose, canvas.width, canvas.height);
        }
      }
    }
  }, [detectedPose, canvasRef, videoRef]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-0 left-0 w-full h-full object-cover transform -scale-x-100"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-cover transform -scale-x-100"
      />
      {isProcessing && <Loader />}
      {!webcamOn && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          <p className="text-xl text-gray-300">Webcam is off</p>
          <p className="text-gray-400">Click "Start Webcam" to begin</p>
        </div>
      )}
    </>
  );
};

export default WebcamFeed;
