'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, ShoppingCart, Check } from 'lucide-react';

export default function ProductDetailPage({ params }) {
    const { id } = use(params);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
            const response = await fetch(`${apiUrl}/products/${id}`);
            
            if (!response.ok) {
                if (response.status === 404) throw new Error('Product not found');
                throw new Error('Failed to fetch product');
            }

            const data = await response.json();
            if (data.success) {
                setProduct(data.product);
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-white py-20 px-4 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Product not found'}</h1>
                <Link href="/" className="text-blue-600 hover:underline">Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link href="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Gallery
                </Link>

                <div className="flex flex-col md:flex-row gap-12 items-start">
                    {/* Media Section */}
                    <div className="w-full md:w-1/2 rounded-2xl overflow-hidden bg-gray-50 shadow-lg border border-gray-100">
                        {product.file_type === 'mp4' ? (
                            <video
                                src={product.file_url}
                                controls
                                autoPlay
                                loop
                                className="w-full h-full object-contain aspect-square"
                            />
                        ) : (
                            <img
                                src={product.file_url}
                                alt={product.name}
                                className="w-full h-full object-contain aspect-square"
                            />
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="w-full md:w-1/2 space-y-8">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                                {product.name}
                            </h1>
                            <div className="h-1 w-20 bg-blue-600 rounded-full mb-6"></div>
                            <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {product.description || 'No description available for this product.'}
                            </p>
                        </div>

                        <div className="pt-6 border-t border-gray-100 italic text-gray-400 text-sm">
                            Product ID: {product.id} • Added on {new Date(product.created_at).toLocaleDateString()}
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                                addedToCart 
                                ? 'bg-green-600 text-white shadow-green-200' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:-translate-y-1'
                            }`}
                        >
                            {addedToCart ? (
                                <>
                                    <Check className="w-6 h-6" />
                                    Added to Cart
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-6 h-6" />
                                    Add to Cart
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
