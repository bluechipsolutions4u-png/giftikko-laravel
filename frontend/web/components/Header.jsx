'use client';

import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">G</span>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Giftikko
                        </span>
                    </Link>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/cart"
                            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Shopping Cart"
                        >
                            <ShoppingCart className="w-6 h-6 text-gray-700" />
                            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                0
                            </span>
                        </Link>

                        <Link
                            href="/login"
                            className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-800 rounded-xl hover:bg-gray-800 hover:text-white transition-all duration-200"
                        >
                            <User className="w-5 h-5" />
                            <span className="font-semibold">Login</span>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
