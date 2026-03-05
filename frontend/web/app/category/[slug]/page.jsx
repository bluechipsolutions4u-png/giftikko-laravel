'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import FrameGrid from '@/components/FrameGrid';
import CategoryProductGrid from '@/components/CategoryProductGrid';

export default function DynamicCategoryPage({ params }) {
  const { slug } = use(params);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategory();
  }, [slug]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      
      const response = await fetch(`${apiUrl}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data = await response.json();
      if (data.success) {
        const found = data.categories.find(c => {
          const pathParts = c.link.split('/').filter(Boolean);
          const lastPart = pathParts[pathParts.length - 1];
          return lastPart === slug;
        });

        if (found) {
          setCategory(found);
        } else {
          setError('Category not found');
        }
      }
    } catch (err) {
      console.error('Error fetching category:', err);
      setError('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-white py-20 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Category not found'}</h1>
        <Link href="/" className="text-blue-600 hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <CategoryProductGrid 
      categorySlug={slug}
      title={category.name}
      description={`Browse our collection of ${category.name.toLowerCase()}.`}
    />
  );
}
