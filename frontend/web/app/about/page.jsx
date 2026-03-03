'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Target, Shield, Award, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative bg-gray-900 text-white py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-800 opacity-90 z-0"></div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <Link 
                        href="/" 
                        className="inline-flex items-center text-white hover:text-gray-300 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Home
                    </Link>
                    
                    <div className="text-center sm:text-left">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                            About Us
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl font-light leading-relaxed">
                            We are dedicated to providing the best products with an unwavering commitment to quality and customer satisfaction. crafting experiences that matter.
                        </p>
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <div className="py-16 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                        <p className="text-gray-600 text-lg">
                            To revolutionize the way you shop by combining premium quality products with an effortless digital experience. We believe in transparency, innovation, and putting our customers first.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Target, title: 'Vision', desc: 'To be the global leader in premium retail experiences.' },
                            { icon: Users, title: 'Community', desc: 'Building a family of satisfied customers worldwide.' },
                            { icon: Shield, title: 'Integrity', desc: 'Honest pricing and authentic products, always.' },
                            { icon: Award, title: 'Excellence', desc: 'Striving for perfection in every detail.' },
                        ].map((item, index) => (
                            <div key={index} className="p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-300 border border-gray-100">
                                <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Story Section */}
            <div className="bg-gray-50 py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                        <div className="w-full md:w-1/2">
                            <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden shadow-xl">
                                {/* Placeholder for Story Image - using a gradient for now as a dummy */}
                                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white/20">
                                    <span className="text-9xl font-bold">A</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Story</h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                Founded with a simple idea: that shopping should be seamless and inspiring. What started as a small project has grown into a destination for those who seek quality.
                            </p>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                Every product we curate is selected with care, ensuring it meets our rigorous standards. We are more than just a store; we are a team of passionate individuals working to bring you the best.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
