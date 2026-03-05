'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function FrameGrid({ categoryName }) {
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndexes, setCurrentPhotoIndexes] = useState({});
  const [frameMasks, setFrameMasks] = useState({});

  useEffect(() => {
    fetchFrames();
  }, []);

  // Auto-rotate sample photos every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhotoIndexes((prev) => {
        const newIndexes = { ...prev };
        frames.forEach((frame) => {
          if (frame.sample_photos && frame.sample_photos.length > 0) {
            const currentIndex = prev[frame.id] || 0;
            newIndexes[frame.id] = (currentIndex + 1) % frame.sample_photos.length;
          }
        });
        return newIndexes;
      });
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [frames]);

  // Generate silhouettes for a perfect mask on irregular shapes
  useEffect(() => {
    if (frames.length === 0) return;

    frames.forEach(async (frame) => {
      if (!frame.frame_file || frameMasks[frame.id]) return;

      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = `/api/proxy-image?url=${encodeURIComponent(frame.frame_file)}`;
        
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });

        if (!img.complete || img.naturalWidth === 0) return;

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Find visible bounds to avoid bleeding with transparent padding
        let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
        let hasVisiblePixels = false;
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            if (data[(y * canvas.width + x) * 4 + 3] > 0) {
              hasVisiblePixels = true;
              minX = Math.min(minX, x); maxX = Math.max(maxX, x);
              minY = Math.min(minY, y); maxY = Math.max(maxY, y);
            }
          }
        }

        const visibleWidth = hasVisiblePixels ? (maxX - minX + 1) : canvas.width;
        const visibleHeight = hasVisiblePixels ? (maxY - minY + 1) : canvas.height;
        
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = visibleWidth;
        maskCanvas.height = visibleHeight;
        const mctx = maskCanvas.getContext('2d');
        
        const maskData = mctx.createImageData(visibleWidth, visibleHeight);
        const md = maskData.data;

        for (let y = 0; y < visibleHeight; y++) {
          for (let x = 0; x < visibleWidth; x++) {
            const srcX = (hasVisiblePixels ? minX : 0) + x;
            const srcY = (hasVisiblePixels ? minY : 0) + y;
            const srcIdx = (srcY * canvas.width + srcX) * 4;
            const destIdx = (y * visibleWidth + x) * 4;
            
            if (data[srcIdx + 3] > 5) {
              md[destIdx] = 0; md[destIdx+1] = 0; md[destIdx+2] = 0; md[destIdx+3] = 255;
            } else {
              md[destIdx+3] = 0;
            }
          }
        }
        mctx.putImageData(maskData, 0, 0);
        setFrameMasks(prev => ({ ...prev, [frame.id]: maskCanvas.toDataURL() }));
      } catch (e) {
        console.error("Failed to generate mask for frame:", frame.id, e);
      }
    });
  }, [frames]);

  const fetchFrames = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      
      const response = await fetch(`${apiUrl}/frames`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch frames');
      }

      const data = await response.json();
      
      if (data.success) {
        // Filter frames by category if specified
        let filteredFrames = data.frames || [];
        if (categoryName) {
          filteredFrames = filteredFrames.filter(
            (frame) => frame.category?.name === categoryName
          );
        }
        
        setFrames(filteredFrames);
        
        // Initialize photo indexes
        const initialIndexes = {};
        filteredFrames.forEach((frame) => {
          initialIndexes[frame.id] = 0;
        });
        setCurrentPhotoIndexes(initialIndexes);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (frames.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">Products coming soon...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
      {frames.map((frame) => {
        const currentPhotoIndex = currentPhotoIndexes[frame.id] || 0;
        const currentPhoto = frame.sample_photos && frame.sample_photos.length > 0
          ? frame.sample_photos[currentPhotoIndex]
          : null;

        return (
          <div key={frame.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
            {/* Image Section - Matching Admin aspect and padding */}
            <div className="aspect-square bg-slate-50 relative p-8 flex items-center justify-center overflow-visible">
               {/* The Shared Shadow Container */}
               <div 
                 className="w-full h-full relative flex items-center justify-center pointer-events-none"
                 style={{ filter: 'drop-shadow(0 8px 25px rgba(0,0,0,0.5))' }}
               >
                  {/* Photo Layer */}
                  {currentPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center translate-z-0">
                      <img
                        src={currentPhoto}
                        alt={`${frame.name} sample`}
                        className="max-w-full max-h-full object-contain transition-opacity duration-1000"
                        style={{
                          WebkitMaskImage: frameMasks[frame.id] ? `url(${frameMasks[frame.id]})` : 'none',
                          maskImage: frameMasks[frame.id] ? `url(${frameMasks[frame.id]})` : 'none',
                          WebkitMaskSize: 'contain',
                          maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat',
                          maskRepeat: 'no-repeat',
                          maskPosition: 'center',
                          WebkitMaskPosition: 'center'
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Frame Overlay Layer */}
                  <img
                    src={frame.frame_file}
                    alt={frame.name}
                    className="relative max-w-full max-h-full object-contain z-10"
                  />
               </div>

               {!currentPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-[2px]">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Preview...</span>
                  </div>
               )}
            </div>

            {/* Frame Info Section - Same as Admin Card */}
            <div className="p-6 border-t border-slate-50">
              <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-1">
                {frame.name}
              </h3>
              
              <Link
                href={`/customize/${frame.id}`}
                className="inline-flex w-full items-center justify-center bg-[#0d3839] text-white py-3 rounded-xl font-bold hover:bg-[#0a2c2d] transition-all shadow-md hover:shadow-lg"
              >
                Customise
              </Link>

              {/* Photo rotation indicator dots */}
              {frame.sample_photos && frame.sample_photos.length > 1 && (
                <div className="flex justify-center gap-1 mt-3">
                  {frame.sample_photos.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentPhotoIndex
                          ? 'w-6 bg-red-600'
                          : 'w-1.5 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
