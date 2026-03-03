import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, LayoutGrid, CheckCircle2, XCircle } from 'lucide-react';
import api from '../middleware/apiMiddleware';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    link: '',
    order: 0,
    is_active: true
  });
  const [searchQuery, setSearchQuery] = useState('');

  const iconOptions = ['Home', 'Image', 'Frame', 'Users', 'Clock', 'Grid', 'FileText', 'Eraser', 'Info', 'Mail'];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/categories');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const response = await api.post('/admin/categories', formData);
      if (response.data.success) {
        fetchCategories();
        setShowAddForm(false);
        resetForm();
      }
    } catch (err) {
      console.error('Failed to add category:', err);
      alert('Failed to add category');
    }
  };

  const handleUpdate = async (id) => {
    try {
      const category = categories.find(c => c.id === id);
      const response = await api.put(`/admin/categories/${id}`, category);
      if (response.data.success) {
        fetchCategories();
        setEditingId(null);
      }
    } catch (err) {
      console.error('Failed to update category:', err);
      alert('Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const response = await api.delete(`/admin/categories/${id}`);
      if (response.data.success) {
        fetchCategories();
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert('Failed to delete category');
    }
  };

  const updateCategoryState = (id, field, value) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '',
      link: '',
      order: 0,
      is_active: true
    });
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#0d3839] focus:outline-none focus:ring-1 focus:ring-[#0d3839] transition-all"
          />
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0d3839] text-white rounded-xl hover:bg-[#0a2c2d] shadow-sm transition-all font-medium whitespace-nowrap"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {showAddForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Add New Category</h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Name</label>
              <input
                type="text"
                placeholder="Category Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-[#0d3839] focus:border-[#0d3839] outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Icon</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-[#0d3839] focus:border-[#0d3839] outline-none transition-all appearance-none bg-white"
              >
                <option value="">Select Icon</option>
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Link</label>
              <input
                type="text"
                placeholder="/category/name"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-[#0d3839] focus:border-[#0d3839] outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Order</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-[#0d3839] focus:border-[#0d3839] outline-none transition-all"
                />
                <button
                  onClick={handleAdd}
                  className="bg-[#0d3839] text-white px-6 rounded-xl hover:bg-[#0a2c2d] transition-colors font-semibold"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-[#0d3839] rounded-full animate-spin"></div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
          <LayoutGrid size={48} className="mx-auto mb-4 opacity-20" />
          <p>No categories found</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-widest">Order</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-widest">Category Name</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-widest">Icon</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-widest">Link Path</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      {editingId === category.id ? (
                        <input
                          type="number"
                          value={category.order}
                          onChange={(e) => updateCategoryState(category.id, 'order', parseInt(e.target.value) || 0)}
                          className="w-20 border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-[#0d3839] outline-none"
                        />
                      ) : (
                        <span className="font-mono text-slate-600">{category.order}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === category.id ? (
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => updateCategoryState(category.id, 'name', e.target.value)}
                          className="w-full max-w-[200px] border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-[#0d3839] outline-none"
                        />
                      ) : (
                        <span className="font-bold text-slate-800">{category.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {editingId === category.id ? (
                          <select
                            value={category.icon}
                            onChange={(e) => updateCategoryState(category.id, 'icon', e.target.value)}
                            className="border border-slate-200 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-[#0d3839] outline-none bg-white"
                          >
                            {iconOptions.map(icon => (
                              <option key={icon} value={icon}>{icon}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-bold">
                            {category.icon.charAt(0)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === category.id ? (
                        <input
                          type="text"
                          value={category.link}
                          onChange={(e) => updateCategoryState(category.id, 'link', e.target.value)}
                          className="w-full max-w-[200px] border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-[#0d3839] outline-none"
                        />
                      ) : (
                        <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{category.link}</code>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === category.id ? (
                        <button 
                          onClick={() => updateCategoryState(category.id, 'is_active', !category.is_active)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            category.is_active ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {category.is_active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {category.is_active ? 'Active' : 'Hidden'}
                        </button>
                      ) : (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          category.is_active ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${category.is_active ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        {editingId === category.id ? (
                          <>
                            <button
                              onClick={() => handleUpdate(category.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Save"
                            >
                              <Save size={18} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingId(category.id)}
                              className="p-2 text-slate-400 hover:bg-slate-100 hover:text-[#0d3839] rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="p-6 bg-slate-50 border border-slate-100 rounded-[24px]">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[#0d3839] rounded-xl flex items-center justify-center text-white shrink-0">
            <LayoutGrid size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">About Category Management</h4>
            <p className="text-[14px] text-slate-600 leading-relaxed">
              Define the structure of your website gallery. Static items like Home, About, and Contact are handled automatically. 
              Changes made here reflect instantly on the public website sidebar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
