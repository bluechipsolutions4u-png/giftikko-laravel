import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, Search, RotateCcw } from 'lucide-react';

const SHAPES = [
  { id: 'square', name: 'Square', mask: null },
  { id: 'circle', name: 'Circle', mask: '/masks/circle-mask.png' },
  { id: 'heart', name: 'Heart', mask: '/masks/heart-mask.png' },
  { id: 'star', name: 'Star', mask: '/masks/star-mask.png' },
  { id: 'triangle', name: 'Triangle', mask: '/masks/triangle-mask.png' },
];

export default function ImageShapeCropper({ image, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedShape, setSelectedShape] = useState(SHAPES[0]);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  const onCropChange = (crop) => setCrop(crop);
  const onZoomChange = (zoom) => setZoom(zoom);

  const onCropAreaComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async () => {
    try {
      const img = await createImage(image);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const { width, height, x, y } = croppedAreaPixels;
      canvas.width = width;
      canvas.height = height;

      // 1. Draw the cropped image portion
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

      // 2. If a mask is selected, apply it
      if (selectedShape.mask) {
        const maskImg = await createImage(selectedShape.mask);
        
        // Use destination-in to apply the mask
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(maskImg, 0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
      }

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleDone = async () => {
    const croppedBlob = await getCroppedImg();
    if (croppedBlob) {
      onCropComplete(croppedBlob);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
        <h3 className="text-white font-bold text-lg">Crop Product Image</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative bg-gray-950">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={onCropChange}
          onCropComplete={onCropAreaComplete}
          onZoomChange={onZoomChange}
          showGrid={false}
          style={{
            containerStyle: {
              background: '#0a0a0a',
            },
            cropAreaStyle: {
              border: 'none',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.85)',
              maskImage: selectedShape.mask ? `url(${selectedShape.mask})` : 'none',
              WebkitMaskImage: selectedShape.mask ? `url(${selectedShape.mask})` : 'none',
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
            }
          }}
        />
      </div>

      {/* Controls Area */}
      <div className="bg-gray-900 p-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Shape Selector */}
          <div className="flex flex-wrap justify-center gap-4">
            {SHAPES.map((shape) => (
              <button
                key={shape.id}
                onClick={() => setSelectedShape(shape)}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-200 ${
                  selectedShape.id === shape.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400 ring-offset-2 ring-offset-gray-900'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {shape.name}
              </button>
            ))}
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-6 bg-gray-800/50 p-4 rounded-2xl">
            <Search className="text-gray-400" size={20} />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <button 
              onClick={() => { setZoom(1); setCrop({ x: 0, y: 0 }); }}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={onCancel}
              className="px-8 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDone}
              className="px-12 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Check size={20} />
              Save Cropped Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
