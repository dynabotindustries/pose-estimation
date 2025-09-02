
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Pose } from './types';
import { estimatePose } from './services/geminiService';
import WebcamFeed from './components/WebcamFeed';
import Controls from './components/Controls';
import Header from './components/Header';
import ErrorDisplay from './components/ErrorDisplay';

const App: React.FC = () => {
  const [isWebcamOn, setIsWebcamOn] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [detectedPose, setDetectedPose] = useState<Pose | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false); // Use ref to track state without causing dependency issues

  const captureFrame = useCallback(() => {
    if (!videoRef.current || videoRef.current.readyState < 2) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.7); // Use jpeg for smaller size
  }, []);

  const processPose = useCallback(async () => {
    // Check ref to prevent concurrent API calls
    if (isProcessingRef.current) {
      requestRef.current = requestAnimationFrame(processPose);
      return;
    }

    const imageBase64 = captureFrame();
    if (!imageBase64) {
      // If frame is not ready, try again on the next animation frame
      requestRef.current = requestAnimationFrame(processPose);
      return;
    }

    isProcessingRef.current = true;
    setIsProcessing(true); // Set state for UI feedback
    setError(null);
    try {
      const pose = await estimatePose(imageBase64);
      setDetectedPose(pose);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setDetectedPose(null);
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
      // Always schedule the next frame to keep the loop alive.
      // The loop is stopped by cancelling the animation frame request.
      requestRef.current = requestAnimationFrame(processPose);
    }
  }, [captureFrame]);

  const startWebcam = async () => {
    setError(null);
    setDetectedPose(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
      setStream(mediaStream);
      setIsWebcamOn(true);
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setError("Could not access the webcam. Please grant permission and try again.");
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    // Crucially, cancel the animation frame to stop the loop
    if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
    }
    setStream(null);
    setIsWebcamOn(false);
    isProcessingRef.current = false; // Reset processing ref
    setIsProcessing(false);
    setDetectedPose(null);
  };

  // Effect to handle attaching the media stream to the video element
  useEffect(() => {
    if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => {
          console.error("Video play failed:", e);
          setError("Failed to play video. Please check browser permissions for autoplay.");
        });
    }
  }, [stream]);

  // Effect to start and stop the pose processing loop
  useEffect(() => {
    if (isWebcamOn) {
      requestRef.current = requestAnimationFrame(processPose);
    } else {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    }

    // Cleanup function to stop the loop if the component unmounts
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isWebcamOn, processPose]);


  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 font-sans">
      <Header />
      <main className="w-full max-w-4xl flex flex-col items-center">
        <div className="relative w-full aspect-video bg-black rounded-lg shadow-2xl overflow-hidden border-2 border-gray-700 mb-6">
          <WebcamFeed
            videoRef={videoRef}
            canvasRef={canvasRef}
            detectedPose={detectedPose}
            isProcessing={isProcessing}
            webcamOn={isWebcamOn}
          />
        </div>
        {error && <ErrorDisplay message={error} />}
        <Controls
          isWebcamOn={isWebcamOn}
          isProcessing={isProcessing}
          onStart={startWebcam}
          onStop={stopWebcam}
        />
        <p className="text-gray-500 mt-4 text-center text-sm">
            Pose estimation is performed by capturing frames and sending them to the Gemini API.
            <br />
            This demo showcases functionality but is not intended for high-framerate, real-time applications.
        </p>
      </main>
    </div>
  );
};

export default App;
