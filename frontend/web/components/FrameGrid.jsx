'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function FrameGrid({ categoryName }) {
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndexes, setCurrentPhotoIndexes] = useState({});

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
            {/* Frame Container - Maintains aspect ratio of cropped images */}
            <div className="relative bg-gray-50 rounded-lg overflow-hidden mb-4">
              <div className="relative w-full p-2">
                {/* Container for photo with proper sizing */}
                <div className="relative w-full">
                  {/* Pre-cropped Sample Photo (Background) - Masked to frame shape */}
                  {currentPhoto ? (
                    <>
                      {/* Photo layer */}
                      <img
                        src={currentPhoto}
                        alt={`${frame.name} sample`}
                        className="w-full h-auto object-cover transition-opacity duration-500 block"
                        style={{
                          WebkitMaskImage: frame.frame_file ? `url(${frame.frame_file})` : 'none',
                          maskImage: frame.frame_file ? `url(${frame.frame_file})` : 'none',
                          WebkitMaskSize: '100% 100%',
                          maskSize: '100% 100%',
                          WebkitMaskRepeat: 'no-repeat',
                          maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center center',
                          maskPosition: 'center center'
                        }}
                      />
                      {/* Frame overlay for visual border */}
                      {frame.frame_file && (
                        <img
                          src={frame.frame_file}
                          alt={frame.name}
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full aspect-[3/4] flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <p className="text-gray-400 font-medium">Upload</p>
                        <p className="text-gray-400 text-sm">Your Photo</p>
                      </div>
                    </div>
                  )}
                </div>
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
