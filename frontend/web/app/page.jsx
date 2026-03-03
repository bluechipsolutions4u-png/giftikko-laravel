'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ChevronRight, Menu, X, Home, Image, Frame, Users, Clock, Grid, FileText, Eraser, Info, Mail } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState([]);

  // Static navigation items (always visible, non-editable)
  const staticNavItems = [
    { id: 'home', name: 'Home', icon: 'Home', link: '/' },
  ];

  const staticFooterItems = [
    { id: 'about', name: 'About', icon: 'Info', link: '/about' },
    { id: 'contact', name: 'Contact', icon: 'Mail', link: '/contact' },
  ];

  // Fetch dynamic product categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setDynamicCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

      const response = await fetch(`${apiUrl}/products`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();

      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hamburger Menu Button - Top Left */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-50"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sliding Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Categories</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Categories List */}
        <div className="overflow-y-auto h-[calc(100%-64px)]">
          <div className="divide-y divide-gray-100">
            {/* Static Navigation Items */}
            {staticNavItems.map((item) => {
              const iconMap = {
                Home, Image, Frame, Users, Clock, Grid, FileText, Eraser, Info, Mail
              };
              const IconComponent = iconMap[item.icon] || Image;
              
              return (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center px-6 py-4 hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200 mr-4 flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors duration-200" />
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors duration-200">
                    {item.name}
                  </span>
                </Link>
              );
            })}

            {/* Divider */}
            {dynamicCategories.length > 0 && (
              <div className="h-2 bg-gray-100"></div>
            )}

            {/* Dynamic Product Categories from Admin */}
            {dynamicCategories.map((category) => {
              const iconMap = {
                Home, Image, Frame, Users, Clock, Grid, FileText, Eraser, Info, Mail
              };
              const IconComponent = iconMap[category.icon] || Image;
              
              return (
                <Link
                  key={category.id}
                  href={category.link}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center px-6 py-4 hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200 mr-4 flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors duration-200" />
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors duration-200">
                    {category.name}
                  </span>
                </Link>
              );
            })}

            {/* Divider */}
            {staticFooterItems.length > 0 && (
              <div className="h-2 bg-gray-100"></div>
            )}

            {/* Static Footer Items */}
            {staticFooterItems.map((item) => {
              const iconMap = {
                Home, Image, Frame, Users, Clock, Grid, FileText, Eraser, Info, Mail
              };
              const IconComponent = iconMap[item.icon] || Image;
              
              return (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center px-6 py-4 hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200 mr-4 flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors duration-200" />
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors duration-200">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-16 h-16 text-gray-400 animate-spin mb-4" />
            <p className="text-gray-500 text-lg">Loading products...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-32">
            <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-lg text-center max-w-md">
              <p className="font-medium">{error}</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <div className="bg-gray-50 border border-gray-200 px-12 py-16 rounded-lg text-center max-w-md">
              <p className="text-gray-600 text-lg mb-3">No products available</p>
              <p className="text-gray-500 text-sm">Check back soon for new additions!</p>
            </div>
          </div>
        ) : (
          <div>
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`w-full py-16 md:py-20 ${index % 2 === 0 ? 'bg-black' : 'bg-white'
                  }`}
              >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-10 md:gap-16 items-center`}>
                    {/* Product Media */}
                    <div className="w-full md:w-1/2">
                      <div className="relative aspect-square overflow-hidden shadow-xl group bg-gray-800">
                        {product.file_type === 'mp4' ? (
                          <video
                            src={product.file_url}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={product.file_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        )}
                      </div>
                    </div>

                    {/* Product Content */}
                    <div className="w-full md:w-1/2 space-y-6 text-center">
                      <div>
                        <h1 className={`text-2xl md:text-3xl font-bold mb-4 leading-tight ${index % 2 === 0 ? 'text-white' : 'text-gray-900'
                          }`}>
                          {product.name}
                        </h1>
                        {product.description && (
                          <p className={`text-sm md:text-base leading-relaxed ${index % 2 === 0 ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                            {product.description}
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/products/${product.id}`}
                        className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-md font-medium transition-all duration-200 shadow-md hover:shadow-lg group text-sm uppercase tracking-wide ${index % 2 === 0
                          ? 'bg-white text-gray-900 hover:bg-gray-100'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                      >
                        <span>Shop now</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
