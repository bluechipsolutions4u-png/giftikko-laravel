'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Upload, ArrowLeft, X, Check, Search, RotateCcw } from 'lucide-react';
import Cropper from 'react-easy-crop';

export default function CustomizePage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();

  const [frame, setFrame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [frameMask, setFrameMask] = useState(null);
  const [frameOriginalMask, setFrameOriginalMask] = useState(null);
  const [frameAspectRatio, setFrameAspectRatio] = useState(1);
  const [frameBounds, setFrameBounds] = useState(null);

  // User upload and cropping state
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  // Final preview state
  const [finalCroppedImage, setFinalCroppedImage] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchFrame();
  }, [id]);

  const fetchFrame = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${apiUrl}/frames`);
      const data = await response.json();
      
      if (data.success) {
        // Find the matching frame
        const foundFrame = data.frames.find(f => f.id.toString() === id);
        if (foundFrame) {
          setFrame(foundFrame);
          generateMask(foundFrame.frame_file);
        } else {
          setError('Frame not found');
        }
      } else {
        setError('Failed to load frames');
      }
    } catch (err) {
      setError('An error occurred while loading the frame');
    } finally {
      setLoading(false);
    }
  };

  const generateMask = async (frameUrl) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `/api/proxy-image?url=${encodeURIComponent(frameUrl)}`;
      
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Allow continuation with unmasked image if blocked
      });
      if (!img.complete || img.naturalWidth === 0) return;

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Create exact size mask without shrinking for the internal cropper composite step logic
      const originalMaskCanvas = document.createElement('canvas');
      originalMaskCanvas.width = canvas.width;
      originalMaskCanvas.height = canvas.height;
      const originalMaskCtx = originalMaskCanvas.getContext('2d');
      const originalMaskData = originalMaskCtx.createImageData(canvas.width, canvas.height);
      const omd = originalMaskData.data;

      // For shrunk mask finding bounds
      let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
      let hasVisiblePixels = false;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          if (data[idx + 3] > 0) {
            hasVisiblePixels = true;
            minX = Math.min(minX, x); maxX = Math.max(maxX, x);
            minY = Math.min(minY, y); maxY = Math.max(maxY, y);
          }
          
          if (data[idx + 3] > 5) {
            omd[idx] = 0; omd[idx+1] = 0; omd[idx+2] = 0; omd[idx+3] = 255;
          } else {
            omd[idx+3] = 0;
          }
        }
      }
      originalMaskCtx.putImageData(originalMaskData, 0, 0);
      setFrameOriginalMask(originalMaskCanvas.toDataURL('image/png'));

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
      setFrameMask(maskCanvas.toDataURL('image/png'));
      setFrameAspectRatio(visibleWidth / visibleHeight);
      setFrameBounds({
         minX, maxX, minY, maxY, width: canvas.width, height: canvas.height, hasVisiblePixels
      });
    } catch (e) {
      console.error("Mask generation failed:", e);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      if (!url.startsWith('data:')) {
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      } else {
        image.src = url;
      }
    });

  const getCroppedImg = async () => {
    try {
      const img = await createImage(uploadedImage);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const { width, height, x, y } = croppedAreaPixels;
      
      canvas.width = width;
      canvas.height = height;

      // 1. Draw cropped photo
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

      // 2. Apply tight frame mask
      if (frameMask) {
        const maskImg = await createImage(frameMask);
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(maskImg, 0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
      }

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(URL.createObjectURL(blob));
        }, 'image/png');
      });
    } catch (e) {
      console.error('Error cropping image:', e);
      return null;
    }
  };

  const handleCropSave = async () => {
    const finalImageUrl = await getCroppedImg();
    if (finalImageUrl) {
      setFinalCroppedImage(finalImageUrl);
      setShowCropper(false);
    }
  };

  const drawAspectContain = (ctx, img, canvasSize) => {
    const scale = Math.min(canvasSize / img.width, canvasSize / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (canvasSize - w) / 2;
    const y = (canvasSize - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const canvasSize = 2000; // High quality output
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = canvasSize;
      finalCanvas.height = canvasSize;
      const ctx = finalCanvas.getContext('2d');

      // Transparent background
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      if (finalCroppedImage) {
        const photoImg = await createImage(finalCroppedImage);
        drawAspectContain(ctx, photoImg, canvasSize);
      }

      const link = document.createElement('a');
      link.download = `my-custom-frame-${frame.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = finalCanvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download failed:', e);
      alert('Failed to download image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
         <p className="text-gray-500 font-medium tracking-wide">Loading frame...</p>
      </div>
    );
  }

  if (error || !frame) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-lg mx-auto border border-red-100 shadow-sm">
          <p className="font-semibold text-lg">{error || 'Frame not found'}</p>
          <Link href="/products" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
            Return to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <button 
              onClick={() => router.back()}
              className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl transition-all"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{frame.name}</h1>
              <p className="text-slate-500 font-medium tracking-wide mt-1">Upload your photo to see it in this frame</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Visualizer Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-8 md:p-16">
              <div className="aspect-square bg-slate-50 relative p-8 flex items-center justify-center overflow-visible rounded-[1.5rem] border border-slate-100">
                {/* Visualizer Shadow Group */}
                <div 
                  className="w-full h-full relative flex items-center justify-center pointer-events-none transition-all duration-300"
                  style={{ filter: 'drop-shadow(0 15px 40px rgba(0,0,0,0.5))' }}
                >
                  {/* Background Sample Photo - Clipped to Shape */}
                  {finalCroppedImage && (
                    <div className="absolute inset-0 flex items-center justify-center translate-z-0">
                      <img 
                        src={finalCroppedImage} 
                        className="max-w-full max-h-full object-contain transition-opacity duration-1000" 
                        alt="preview"
                        style={{
                          WebkitMaskImage: frameMask ? `url(${frameMask})` : 'none',
                          maskImage: frameMask ? `url(${frameMask})` : 'none',
                          maskSize: 'contain',
                          WebkitMaskSize: 'contain',
                          maskRepeat: 'no-repeat',
                          WebkitMaskRepeat: 'no-repeat',
                          maskPosition: 'center',
                          WebkitMaskPosition: 'center'
                        }}
                      />
                    </div>
                  )}

                  {/* Frame Overlay */}
                  <img 
                    src={frame.frame_file} 
                    alt={frame.name} 
                    className="relative max-w-full max-h-full object-contain z-10" 
                  />
                </div>

                {!finalCroppedImage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-white/80 backdrop-blur-md px-8 py-6 rounded-2xl shadow-xl border border-white max-w-xs transition-all pointer-events-none">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-white shadow-sm">
                        <Upload size={28} className="text-indigo-600" />
                      </div>
                      <p className="text-slate-700 font-bold mb-1">Your photo goes here</p>
                      <p className="text-slate-500 text-sm font-medium">Upload an image to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Controls */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Customize Tools</h3>
              
              <div className="space-y-4">
                <div className="relative group">
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label 
                    htmlFor="photo-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 cursor-pointer transition-all w-full group-hover:shadow-inner"
                  >
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                      <Upload size={24} />
                    </div>
                    <span className="font-bold text-slate-700">
                      {finalCroppedImage ? 'Change Photo' : 'Upload Photo'}
                    </span>
                    <span className="text-xs text-slate-500 mt-1.5 font-medium tracking-wide">(PNG, JPG, WEBP)</span>
                  </label>
                </div>

                {/* Download option purposely removed at user request */}
              </div>
            </div>

            <div className="bg-[#0d3839] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10">
                 <h4 className="font-bold text-lg mb-2">Pro Tip</h4>
                 <p className="text-teal-50/80 text-sm leading-relaxed">
                   For the best results, use high-resolution images. Our cropping tool ensures your photo gets masked perfectly into the frame's shape so there is no bleeding near the edges.
                 </p>
               </div>
            </div>

          </div>
        </div>

      </div>

      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 z-[999] bg-slate-900/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
          <div className="flex items-center justify-between p-6 bg-slate-900 border-b border-slate-800">
            <h3 className="text-white font-bold text-xl tracking-tight">Adjust Your Photo</h3>
            <button 
              onClick={() => setShowCropper(false)} 
              className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 relative bg-slate-950">
            <Cropper
              image={uploadedImage}
              crop={crop}
              zoom={zoom}
              aspect={frameAspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              showGrid={false}
              style={{
                containerStyle: { background: '#020617' }, // slate-950
                cropAreaStyle: {
                  border: 'none',
                  boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.75)', // slate-900 translucent
                  // Apply mask so the user visually sees what parts are kept
                  maskImage: frameMask ? `url(${frameMask})` : 'none',
                  WebkitMaskImage: frameMask ? `url(${frameMask})` : 'none',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                }
              }}
            />
            {frame?.frame_file && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 p-2">
                  <img 
                    src={frame.frame_file} 
                    className="w-full h-full object-contain opacity-80" 
                    style={{ 
                      maxHeight: '100%',
                      maxWidth: '100%'
                    }}
                    alt="Frame Overlay"
                  />
               </div>
            )}
            <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none z-20">
               <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-2 border border-white/10 text-[10px] text-white font-bold tracking-widest uppercase">
                 Drag to Position • Scroll to Zoom
               </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 border-t border-slate-800">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="flex items-center gap-6 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                <Search className="text-slate-400 shrink-0" size={24} />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={4}
                  step={0.05}
                  onChange={(e) => setZoom(e.target.value)}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                />
                <button 
                  onClick={() => { setZoom(1); setCrop({ x: 0, y: 0 }); }}
                  className="p-3 hover:bg-slate-700 rounded-xl transition-colors text-slate-300 hover:text-white"
                  title="Reset position"
                >
                  <RotateCcw size={20} />
                </button>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowCropper(false)}
                  className="px-8 py-4 bg-slate-800 text-white rounded-xl font-bold tracking-wide hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropSave}
                  className="px-12 py-4 bg-indigo-600 text-white rounded-xl font-bold tracking-wide hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <Check size={22} />
                  Apply & Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
