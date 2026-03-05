import React, { useState, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Plus, Edit2, Trash2, Search, Frame, CheckCircle2, XCircle, Info, X, ChevronRight, UploadCloud, Scissors } from 'lucide-react';
import api from '../middleware/apiMiddleware';

const FrameManager = () => {
  const [frames, setFrames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFrame, setEditingFrame] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    frame_file: null,
    sample_photo: null,
    category_id: '',
    order: 0,
    isActive: true
  });
  const [previews, setPreviews] = useState({
    frame: null,
    photo: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [frameAspectRatio, setFrameAspectRatio] = useState(3/4);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [frameMask, setFrameMask] = useState(null);
  const [frameListMasks, setFrameListMasks] = useState({});
  const [currentPhotoIndexes, setCurrentPhotoIndexes] = useState({});

  // Cropping states
  const [showCropper, setShowCropper] = useState(false);
  const [currentCropField, setCurrentCropField] = useState(null);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Track which photos to delete
  const [deleteSamplePhoto, setDeleteSamplePhoto] = useState(false);

  useEffect(() => {
    fetchFrames();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (frames.length === 0) return;
    
    // Auto-rotate logic removed as we are simplifying to a single image
  }, [frames]);

  // Generate masks for all frames in the list for a perfect clipped preview
  useEffect(() => {
    if (frames.length === 0) return;

    frames.forEach(async (frame) => {
      if (!frame.frame_file || frameListMasks[frame.id]) return;

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
        setFrameListMasks(prev => ({ ...prev, [frame.id]: maskCanvas.toDataURL() }));
      } catch (e) {
        console.error("Failed to generate mask for frame list:", frame.id, e);
      }
    });
  }, [frames]);

  const fetchFrames = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/frames');
      if (response.data.success) {
        setFrames(response.data.frames);
      }
    } catch (error) {
      console.error('Error fetching frames:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(cropImage, croppedAreaPixels, frameMask);
      const file = new File([croppedImage], `sample-photo.png`, { type: 'image/png' });
      setFormData({ ...formData, sample_photo: file });
      const url = URL.createObjectURL(croppedImage);
      setPreviews({ ...previews, photo: url });
      setShowCropper(false);
      setCropImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (e) {
      console.error('Error creating cropped image:', e);
      alert('Failed to crop image');
    }
  };

  const getCroppedImg = (imageSrc, pixelCrop, maskSrc) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        // 1. Draw the cropped photo
        ctx.drawImage(
          image,
          pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
          0, 0, pixelCrop.width, pixelCrop.height
        );

        // 2. Apply the frame silhouette as a mask if available
        if (maskSrc) {
          const mask = new Image();
          mask.src = maskSrc;
          try {
            await new Promise((resolve, reject) => {
              mask.onload = resolve;
              mask.onerror = reject;
            });
            
            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(mask, 0, 0, pixelCrop.width, pixelCrop.height);
            ctx.globalCompositeOperation = 'source-over';
          } catch (err) {
            console.error("Mask failed to load in getCroppedImg", err);
          }
        }

        canvas.toBlob((blob) => resolve(blob), 'image/png');
      };
      image.onerror = reject;
    });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (field === 'frame_file' && file.type !== 'image/png') return alert('Frame must be a PNG file');
      if (field.startsWith('sample') && !file.type.startsWith('image/')) return alert('Sample photos must be image files');
      if (file.size > 5 * 1024 * 1024) return alert('File size must be less than 5MB');

      if (field === 'frame_file') {
        setFormData({ ...formData, [field]: file });
        const url = URL.createObjectURL(file);
        setPreviews({ ...previews, frame: url });
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
          let hasTransparency = false;
          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              if (data[(y * canvas.width + x) * 4 + 3] > 0) {
                hasTransparency = true;
                minX = Math.min(minX, x); maxX = Math.max(maxX, x);
                minY = Math.min(minY, y); maxY = Math.max(maxY, y);
              }
            }
          }
          const ratio = hasTransparency ? (maxX - minX) / (maxY - minY) : img.width / img.height;
          setFrameAspectRatio(ratio);

          // Generate the binary mask for cropping preview, CROPPED to visible bounds
          const visibleWidth = hasTransparency ? (maxX - minX + 1) : canvas.width;
          const visibleHeight = hasTransparency ? (maxY - minY + 1) : canvas.height;
          
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = visibleWidth;
          maskCanvas.height = visibleHeight;
          const mctx = maskCanvas.getContext('2d');
          
          const maskData = mctx.createImageData(visibleWidth, visibleHeight);
          const md = maskData.data;

          for (let y = 0; y < visibleHeight; y++) {
            for (let x = 0; x < visibleWidth; x++) {
              const srcX = (hasTransparency ? minX : 0) + x;
              const srcY = (hasTransparency ? minY : 0) + y;
              const srcIdx = (srcY * canvas.width + srcX) * 4;
              const destIdx = (y * visibleWidth + x) * 4;
              
              const alpha = data[srcIdx + 3];
              if (alpha > 5) {
                md[destIdx] = 0; md[destIdx+1] = 0; md[destIdx+2] = 0; md[destIdx+3] = 255;
              } else {
                md[destIdx+3] = 0;
              }
            }
          }
          mctx.putImageData(maskData, 0, 0);
          setFrameMask(maskCanvas.toDataURL());
        };
        img.src = url;
      } else {
        if (!formData.frame_file && !editingFrame) return alert('Please upload the Frame PNG file first!');
        const url = URL.createObjectURL(file);
        setCropImage(url);
        setShowCropper(true);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Frame name is required');
    if (!editingFrame && !formData.frame_file) return alert('Please select a frame PNG file');

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      if (formData.frame_file) data.append('frame_file', formData.frame_file);
      if (editingFrame && deleteSamplePhoto) data.append('delete_sample_photo_1', '1');
      if (formData.sample_photo) data.append('sample_photo_1', formData.sample_photo);
      if (formData.category_id) data.append('category_id', formData.category_id);
      data.append('order', formData.order);
      data.append('is_active', formData.isActive ? '1' : '0');

      let response = editingFrame 
        ? await api.post(`/admin/frames/${editingFrame.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await api.post('/admin/frames', data, { headers: { 'Content-Type': 'multipart/form-data' } });

      if (response.data.success) {
        setShowModal(false);
        resetForm();
        fetchFrames();
      }
    } catch (error) {
      console.error('Error saving frame:', error);
      alert(error.response?.data?.message || 'Failed to save frame');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (frame) => {
    setEditingFrame(frame);
    setFormData({
      name: frame.name,
      frame_file: null,
      sample_photo_1: null,
      sample_photo_2: null,
      sample_photo_3: null,
      category_id: frame.category_id || '',
      order: frame.order,
      isActive: frame.is_active
    });
    setPreviews({
      frame: frame.frame_file,
      photo: frame.sample_photo_1
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this frame?')) return;
    try {
      const response = await api.delete(`/admin/frames/${id}`);
      if (response.data.success) fetchFrames();
    } catch (error) {
      console.error('Error deleting frame:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', frame_file: null, sample_photo: null,
      category_id: '', order: 0, isActive: true
    });
    setEditingFrame(null);
    setPreviews({ frame: null, photo: null });
    setFrameAspectRatio(3/4);
    setFrameMask(null);
    setDeleteSamplePhoto(false);
  };

  const filteredFrames = frames.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || String(f.category_id) === String(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search frames..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#0d3839] focus:outline-none focus:ring-1 focus:ring-[#0d3839] transition-all"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0d3839] text-white rounded-xl hover:bg-[#0a2c2d] shadow-sm transition-all font-medium whitespace-nowrap"
        >
          <Plus size={18} />
          Add Frame
        </button>
      </div>

      {/* Category Filter Pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#0d3839] text-white border-[#0d3839]'
                : 'bg-white text-slate-500 border-slate-200 hover:border-[#0d3839] hover:text-[#0d3839]'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(String(cat.id))}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                selectedCategory === String(cat.id)
                  ? 'bg-[#0d3839] text-white border-[#0d3839]'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-[#0d3839] hover:text-[#0d3839]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#0d3839] rounded-full animate-spin"></div>
        </div>
      ) : filteredFrames.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
          <Frame size={48} className="mx-auto mb-4 opacity-20" />
          <p>No frames found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredFrames.map((frame) => {
              const currentPhoto = frame.sample_photo_1;

              return (
                <div key={frame.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                  <div className="aspect-square bg-slate-50 relative p-8 flex items-center justify-center overflow-visible">
                    {/* Common inner container for perfect alignment - Apply shadow here for true silhouette depth */}
                    <div 
                      className="w-full h-full relative flex items-center justify-center pointer-events-none"
                      style={{ filter: 'drop-shadow(0 8px 25px rgba(0,0,0,0.5))' }}
                    >
                      {/* Background Sample Photo - Clipped to Shape */}
                      {currentPhoto && (
                        <div className="absolute inset-0 flex items-center justify-center translate-z-0">
                          <img 
                            src={currentPhoto} 
                            className="max-w-full max-h-full object-contain transition-opacity duration-1000" 
                            alt="preview"
                            style={{
                              WebkitMaskImage: frameListMasks[frame.id] ? `url(${frameListMasks[frame.id]})` : 'none',
                              maskImage: frameListMasks[frame.id] ? `url(${frameListMasks[frame.id]})` : 'none',
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
                  </div>
                  <div className="p-5 border-t border-slate-50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 line-clamp-1">{frame.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{frame.category?.name || 'General'}</p>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${frame.is_active ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                        {frame.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(frame)} className="flex-1 py-2 text-slate-600 bg-slate-50 hover:bg-[#0d3839] hover:text-white rounded-lg transition-all text-sm font-semibold">Edit</button>
                      <button onClick={() => handleDelete(frame.id)} className="px-4 py-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Main Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-slate-900">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="p-10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-bold">{editingFrame ? 'Edit Frame' : 'Create New Frame'}</h2>
                  <p className="text-slate-500 mt-1 text-sm font-medium">Configure frame behavior and sample photos</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Frame Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#0d3839] outline-none transition-all font-medium"
                        placeholder="e.g. Minimalist Oak Square"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Parent Category</label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#0d3839] outline-none transition-all font-medium"
                      >
                        <option value="">None (General)</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Frame Source (PNG) {!editingFrame && '*'}</label>
                    <div className="relative">
                      <input type="file" id="frame-src" onChange={(e) => handleFileChange(e, 'frame_file')} accept="image/png" className="hidden" />
                      <label htmlFor="frame-src" className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[28px] p-10 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer">
                        {previews.frame ? (
                          <img src={previews.frame} className="h-28 w-28 object-contain mb-2" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0d3839] mb-4">
                            <UploadCloud size={28} />
                          </div>
                        )}
                        <span className="font-bold text-slate-800">{formData.frame_file ? formData.frame_file.name : 'Choose Frame PNG'}</span>
                        <span className="text-xs text-slate-400 mt-1">Must have a transparent center area</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-6 ml-1">
                    <Scissors size={20} className="text-[#0d3839]" />
                    <h3 className="text-lg font-bold">Sample Photo</h3>
                    <div className="ml-auto text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Info size={14} />
                      Image will be auto-cropped to fit the frame shape
                    </div>
                  </div>

                  <div className="max-w-md mx-auto">
                    <div className="relative group">
                       <input type="file" id="sample_photo" onChange={(e) => handleFileChange(e, 'sample_photo')} accept="image/*" className="hidden" />
                       <label htmlFor="sample_photo" className="block aspect-[4/3] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 hover:border-slate-200 overflow-hidden cursor-pointer transition-all relative">
                          {previews.photo ? (
                            <div className="w-full h-full flex items-center justify-center p-4">
                              <img src={previews.photo} className="max-w-full max-h-full object-contain drop-shadow-md" />
                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                              <Plus size={24} />
                              <span className="text-xs font-bold uppercase tracking-widest">Select Sample Photo</span>
                            </div>
                          )}
                       </label>
                       {previews.photo && (
                         <button 
                           type="button" 
                           onClick={() => {
                             setPreviews({ ...previews, photo: null });
                             setFormData({ ...formData, sample_photo: null });
                             if (editingFrame) setDeleteSamplePhoto(true);
                           }}
                           className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
                         >
                           <X size={14} />
                         </button>
                       )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-6">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                        className={`flex items-center gap-3 px-5 py-2.5 rounded-xl font-bold transition-all ${
                          formData.isActive ? 'bg-[#0d3839] text-white' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                         {formData.isActive ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                         {formData.isActive ? 'Visible on Store' : 'Hidden from Store'}
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sort Order</label>
                      <input 
                        type="number" 
                        value={formData.order} 
                        onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                        className="w-24 px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-1 focus:ring-[#0d3839] transition-all font-bold text-center"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3.5 text-slate-400 font-bold hover:text-slate-600">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-10 py-3.5 bg-[#0d3839] text-white rounded-2xl hover:bg-[#0a2c2d] shadow-xl hover:shadow-[#0d3839]/20 font-bold transition-all disabled:opacity-50">
                      {submitting ? 'Saving...' : editingFrame ? 'Save Changes' : 'Create Frame'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-[200] p-4 text-white">
          <div className="bg-slate-800 rounded-[40px] shadow-2xl max-w-4xl w-full flex flex-col h-[85vh]">
            <div className="p-10 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Crop to Frame Shape</h3>
                <p className="text-slate-400 text-sm mt-1">Position the image inside the frame boundary</p>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => setShowCropper(false)} className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
                   <X size={24} />
                 </button>
              </div>
            </div>
            <div className="flex-1 relative bg-[#020617]">
               <div className="absolute inset-0">
                  <Cropper
                    image={cropImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={frameAspectRatio}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    cropShape="rect"
                    showGrid={false}
                    style={{
                      containerStyle: { backgroundColor: '#020617' },
                      cropAreaStyle: { 
                        border: 'none', 
                        boxShadow: '0 0 0 9999em rgba(0,0,0,0.85)',
                        WebkitMaskImage: frameMask ? `url(${frameMask})` : 'none',
                        maskImage: frameMask ? `url(${frameMask})` : 'none',
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
               
               {previews.frame && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 p-2">
                    <img 
                      src={previews.frame} 
                      className="w-full h-full object-contain opacity-80" 
                      style={{ 
                        // Ensure overlay matches the cropper's internal logic
                        maxHeight: '100%',
                        maxWidth: '100%'
                      }}
                    />
                 </div>
               )}

               <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none z-20">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-2 border border-white/10 text-[10px] font-bold tracking-widest uppercase">
                    Drag to Position • Scroll to Zoom
                  </div>
               </div>
            </div>
            <div className="p-10 bg-slate-900 grid grid-cols-1 md:grid-cols-2 gap-10 items-center rounded-b-[40px]">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Precision Zoom</label>
                  <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white" />
               </div>
               <div className="flex gap-4">
                 <button onClick={() => setShowCropper(false)} className="flex-1 py-4 text-white/50 font-bold hover:text-white transition-all text-lg">Discard</button>
                 <button onClick={createCroppedImage} className="flex-1 py-4 bg-white text-slate-900 rounded-[20px] font-bold text-lg hover:bg-teal-400 transition-all shadow-xl">Apply Crop</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrameManager;
