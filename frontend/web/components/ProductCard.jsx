'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ id, name, description, file_url, file_type }) {
    const isVideo = file_type === 'mp4';

    return (
        <div className="product-card group">
            {/* Media */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {isVideo ? (
                    <video
                        src={file_url}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        autoPlay
                        loop
                        muted
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => e.currentTarget.pause()}
                    />
                ) : (
                    <img
                        src={file_url}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            </div>

            {/* Content */}
            <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                    {name}
                </h3>

                {description && (
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                        {description}
                    </p>
                )}

                <div className="pt-2">
                    <Link
                        href={`/products/${id}`}
                        className="inline-block px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
}
