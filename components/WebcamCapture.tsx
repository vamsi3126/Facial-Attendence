import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw } from 'lucide-react';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  isLoading?: boolean;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, isLoading }) => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  const retake = () => {
    setImgSrc(null);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative rounded-xl overflow-hidden shadow-xl border-4 border-slate-200 bg-black w-full max-w-md aspect-video">
        {imgSrc ? (
          <img src={imgSrc} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover"
            videoConstraints={{ facingMode: "user" }}
          />
        )}
        
        {/* Scanning Overlay Animation when loading */}
        {isLoading && !imgSrc && (
          <div className="absolute inset-0 pointer-events-none">
             <div className="scan-line"></div>
             <div className="absolute inset-0 border-2 border-cyan-400 opacity-50 m-8 rounded-lg"></div>
             <p className="absolute bottom-4 w-full text-center text-cyan-400 font-mono text-sm animate-pulse">
               ANALYZING BIOMETRICS...
             </p>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {!imgSrc && (
          <button
            onClick={capture}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors shadow-md disabled:opacity-50"
          >
            <Camera className="w-5 h-5" />
            <span>{isLoading ? 'Processing...' : 'Capture Face'}</span>
          </button>
        )}
        
        {imgSrc && !isLoading && (
          <button
            onClick={retake}
            className="flex items-center space-x-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors shadow-md"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Retake</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
