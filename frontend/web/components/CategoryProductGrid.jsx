'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ChevronLeft, ArrowRight } from 'lucide-react';

export default function CategoryProductGrid({ categorySlug, title, description }) {
  const [products, setProducts] = useState([]);
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPhotoIndexes, setCurrentPhotoIndexes] = useState({});
  const [frameMasks, setFrameMasks] = useState({});

  useEffect(() => {
    fetchCategoryProducts();
  }, [categorySlug]);

  const fetchCategoryProducts = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

      const response = await fetch(`${apiUrl}/categories/${categorySlug}/products`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch category products');
      }

      const data = await response.json();

      if (data.success) {
        setProducts(data.products || []);
        setFrames(data.frames || []);
        
        // Initialize photo indexes for frames
        const initialIndexes = {};
        (data.frames || []).forEach((frame) => {
          initialIndexes[frame.id] = 0;
        });
        setCurrentPhotoIndexes(initialIndexes);
      }
    } catch (err) {
      console.error('Error fetching category products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-rotate sample photos for frames
  useEffect(() => {
    if (frames.length === 0) return;
    
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
    }, 3000);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500 text-lg">Loading products...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-32">
            <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-xl text-center max-w-md">
              <p className="font-medium">{error}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Category Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                {title}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {description}
              </p>
              <div className="mt-8 w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
            </div>

            {/* Combined Grid (Frames + Products) */}
            {products.length === 0 && frames.length === 0 ? (
              <div className="flex items-center justify-center py-32">
                <div className="bg-gray-50 border border-gray-200 px-12 py-16 rounded-xl text-center max-w-md">
                  <p className="text-gray-600 text-lg mb-3">No products in this category</p>
                  <p className="text-gray-500 text-sm">Check back soon for new additions!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-16">
                {/* Frames Section */}
                {frames.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {frames.map((frame) => {
                      const currentPhotoIndex = currentPhotoIndexes[frame.id] || 0;
                      const currentPhoto = frame.sample_photos && frame.sample_photos.length > 0
                        ? frame.sample_photos[currentPhotoIndex]
                        : null;

                      return (
                        <div key={`frame-${frame.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 p-4">
                          {/* Inner container to clip the image to the frame's boundary */}
                          <div className="relative bg-gray-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                             {/* The Frame defines the layout/aspect ratio */}
                             <div className="relative w-full">
                               {frame.frame_file ? (
                                 <img 
                                   src={frame.frame_file} 
                                   alt="" 
                                   className="w-full h-auto opacity-0 block" 
                                 />
                               ) : (
                                 <div className="aspect-square w-full" />
                               )}
                               
                               {/* The Absolute Container for content */}
                               <div className="absolute inset-0 flex items-center justify-center p-2 overflow-hidden">
                                  <div className="relative w-full h-full overflow-hidden">
                                     {/* Photo Layer */}
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
                                     
                                     {/* Frame Overlay Layer */}
                                     {frame.frame_file && (
                                       <img 
                                         src={frame.frame_file} 
                                         alt={frame.name}
                                         className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10" 
                                       />
                                     )}
                                  </div>
                               </div>

                               {!currentPhoto && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                    <span className="text-gray-400 text-sm font-medium">Loading...</span>
                                  </div>
                               )}
                             </div>
                          </div>

                          <div className="text-center">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">{frame.name}</h3>
                            <Link href={`/customize/${frame.id}`} className="inline-block w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                              Customize
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Products Section */}
                {products.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {products.map((product) => (
                      <Link
                        key={`prod-${product.id}`}
                        href={`/products/${product.id}`}
                        className="group block"
                      >
                        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                          <div className="relative aspect-square bg-gray-100 overflow-hidden">
                            {product.file_type === 'mp4' ? (
                              <video src={product.file_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" autoPlay loop muted playsInline />
                            ) : (
                              <img src={product.file_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            )}
                          </div>
                          <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                            <span className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm">
                              View Details
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
