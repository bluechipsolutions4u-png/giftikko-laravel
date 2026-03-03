import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileVideo, ImageIcon, Search, Filter } from 'lucide-react';
import api from '../middleware/apiMiddleware';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    file: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid file (JPG, PNG, WEBP, or MP4)');
        e.target.value = '';
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert('File size must be less than 20MB');
        e.target.value = '';
        return;
      }
      setFormData({ ...formData, file });
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Product name is required');
    if (!editingProduct && !formData.file) return alert('Please select a file');

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      if (formData.description) data.append('description', formData.description);
      if (formData.file) data.append('file', formData.file);

      let response;
      if (editingProduct) {
        response = await api.post(`/products/${editingProduct.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        setShowModal(false);
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      file: null
    });
    setPreviewUrl(product.file_url);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await api.delete(`/products/${id}`);
      if (response.data.success) fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', file: null });
    setEditingProduct(null);
    setPreviewUrl(null);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search products..."
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
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#0d3839] rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <ImageIcon size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">No products found</h3>
          <p className="text-slate-500 mt-1 max-w-xs mx-auto">
            {searchQuery ? "Try a different search term" : "Get started by adding your first product to the gallery"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-200 transition-all duration-300"
            >
              {/* Media Preview */}
              <div className="aspect-square bg-slate-50 relative overflow-hidden">
                {product.file_type === 'mp4' ? (
                  <video
                    src={product.file_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={product.file_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                {product.file_type === 'mp4' && (
                  <div className="absolute top-1.5 right-1.5 bg-black/50 backdrop-blur-md text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <FileVideo size={10} />
                    Video
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3">
                <div className="mb-1">
                  <h3 className="text-[14px] font-bold text-slate-800 line-clamp-1">
                    {product.name}
                  </h3>
                </div>
                {product.description && (
                  <p className="text-[12px] text-slate-500 mb-2 line-clamp-1 leading-tight">
                    {product.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-[9px]">
                    {formatFileSize(product.file_size)}
                  </span>
                  <div className="flex gap-0.5">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1.5 text-slate-600 hover:bg-slate-50 hover:text-[#0d3839] rounded-lg transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 text-slate-600 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <Plus size={24} className="rotate-45 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-[#0d3839] focus:border-[#0d3839] outline-none transition-all placeholder:text-slate-400"
                    placeholder="Enter descriptive name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-[#0d3839] focus:border-[#0d3839] outline-none transition-all placeholder:text-slate-400 resize-none"
                    placeholder="Add more details about this product..."
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Media File {!editingProduct && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      id="product-file"
                      onChange={handleFileChange}
                      accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4"
                      className="hidden"
                      required={!editingProduct}
                    />
                    <label 
                      htmlFor="product-file"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/30 group-hover:bg-slate-50 group-hover:border-slate-300 cursor-pointer transition-all"
                    >
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#0d3839] mb-3">
                        <Plus size={24} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {formData.file ? formData.file.name : 'Click to upload media'}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        JPG, PNG, WEBP, or MP4 (Max 20MB)
                      </span>
                    </label>
                  </div>
                </div>

                {previewUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 aspect-video relative">
                    {formData.file?.type?.startsWith('video/') || editingProduct?.file_type === 'mp4' ? (
                      <video src={previewUrl} controls className="w-full h-full object-contain" />
                    ) : (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-semibold"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3.5 bg-[#0d3839] text-white rounded-xl hover:bg-[#0a2c2d] transition-all shadow-lg hover:shadow-[#0d3839]/20 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
