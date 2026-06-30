"use client";

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { CameraIcon, FlipHorizontal, RefreshCw } from "lucide-react";
import { Button } from "./ui/Button";

interface CameraProps {
  onCapture: (imageSrc: string) => void;
}

export function Camera({ onCapture }: CameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isMirrored, setIsMirrored] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);

  const capture = useCallback(() => {
    if (countdown !== null) return;
    
    setCountdown(3);
    let count = 3;
    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(timer);
        setCountdown(null);
        setFlash(true);
        
        setTimeout(() => {
          setFlash(false);
          const imageSrc = webcamRef.current?.getScreenshot();
          if (imageSrc) {
            onCapture(imageSrc);
          }
        }, 150); // slight delay for flash effect
      }
    }, 1000);
  }, [countdown, onCapture]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full max-w-2xl mx-auto rounded-3xl overflow-hidden bg-gray-900 shadow-xl border-4 border-pink-100">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode }}
        mirrored={isMirrored}
        className="w-full h-full object-cover"
      />

      {/* Flash Effect */}
      {flash && (
        <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-300" />
      )}

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/40">
          <span className="text-8xl font-bold text-white drop-shadow-2xl animate-pulse">
            {countdown}
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-between items-center z-30">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 border-none"
          onClick={() => setIsMirrored(!isMirrored)}
          disabled={countdown !== null}
        >
          <FlipHorizontal className="h-5 w-5" />
        </Button>

        <Button
          size="lg"
          className="rounded-full h-16 w-16 p-0 border-4 border-pink-300 bg-white hover:bg-pink-100 text-pink-500 shadow-lg"
          onClick={capture}
          disabled={countdown !== null}
        >
          <CameraIcon className="h-8 w-8" />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 border-none"
          onClick={() =>
            setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
          }
          disabled={countdown !== null}
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
