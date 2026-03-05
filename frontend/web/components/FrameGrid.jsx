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
        img.src = frame.frame_file;
        
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
        const newImageData = ctx.createImageData(canvas.width, canvas.height);
        const newData = newImageData.data;

        // Create a silhouette mask: any pixel with color/alpha becomes visible
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha > 5) { // Any visible pixel (including semi-transparent) becomes opaque in mask
            newData[i] = 0;
            newData[i + 1] = 0;
            newData[i + 2] = 0;
            newData[i + 3] = 255;
          } else {
            newData[i + 3] = 0;
          }
        }

        ctx.putImageData(newImageData, 0, 0);
        setFrameMasks(prev => ({ ...prev, [frame.id]: canvas.toDataURL() }));
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
          <div key={frame.id} className="group">
            {/* Frame Container - Maintains aspect ratio of frame and clips image overflow */}
            <div className="relative bg-gray-50 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
              <div className="relative w-full">
                {/* Invisible frame to establish aspect ratio */}
                {frame.frame_file ? (
                  <img 
                    src={frame.frame_file} 
                    alt="" 
                    className="w-full h-auto opacity-0 block" 
                  />
                ) : (
                  <div className="aspect-[3/4] w-full" />
                )}

                {/* Content container clipped to frame bounds */}
                <div className="absolute inset-0 flex items-center justify-center p-2 overflow-hidden">
                  {currentPhoto && (
                    <img
                      src={currentPhoto}
                      alt={`${frame.name} sample`}
                      className="w-full h-full object-cover transition-opacity duration-500"
                      style={{
                        WebkitMaskImage: frameMasks[frame.id] ? `url(${frameMasks[frame.id]})` : 'none',
                        maskImage: frameMasks[frame.id] ? `url(${frameMasks[frame.id]})` : 'none',
                        WebkitMaskSize: '100% 100%',
                        maskSize: '100% 100%',
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat'
                      }}
                    />
                  )}
                  
                  {frame.frame_file && (
                    <img
                      src={frame.frame_file}
                      alt={frame.name}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                    />
                  )}
                </div>

                {!currentPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <p className="text-gray-400 font-medium">Upload</p>
                      <p className="text-gray-400 text-sm">Your Photo</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Frame Info */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {frame.name}
              </h3>
              
              <Link
                href={`/customize/${frame.id}`}
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-2.5 rounded transition-colors duration-200"
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
