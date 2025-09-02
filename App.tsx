
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
  // FIX: Initialize useRef with null to satisfy type expectations and avoid potential errors.
  const requestRef = useRef<number | null>(null);

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
    if (isProcessing) return;

    const imageBase64 = captureFrame();
    if (!imageBase64) {
      requestRef.current = requestAnimationFrame(processPose);
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const pose = await estimatePose(imageBase64);
      setDetectedPose(pose);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setDetectedPose(null); 
    } finally {
      setIsProcessing(false);
      // Only request next frame if webcam is still on
      if (isWebcamOn) {
         requestRef.current = requestAnimationFrame(processPose);
      }
    }
  }, [captureFrame, isProcessing, isWebcamOn]);

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

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    // FIX: A request ID of 0 is valid but falsy. Check for null instead.
    if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
    }
    setStream(null);
    setIsWebcamOn(false);
    setIsProcessing(false);
    setDetectedPose(null);
  }, [stream]);

  useEffect(() => {
    if (isWebcamOn && videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          requestRef.current = requestAnimationFrame(processPose);
        };
    }
    
    // Cleanup on component unmount
    return () => {
        stopWebcam();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWebcamOn, stream, processPose]);


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
