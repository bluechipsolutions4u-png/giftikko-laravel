'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FrameGrid from '@/components/FrameGrid';

export default function AcrylicPhotoCutoutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Acrylic Photo Cutout</h1>
        <p className="text-gray-600 text-lg mb-8">
          Custom-shaped acrylic photo cutouts for unique displays.
        </p>
        
        <FrameGrid categoryName="Acrylic Photo Cutout" />
      </div>
    </div>
  );
}
