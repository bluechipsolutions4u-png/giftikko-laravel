import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">G</span>
                            </div>
                            <span className="text-2xl font-bold text-white">
                                Giftikko
                            </span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Your trusted partner for quality products and exceptional service.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-sm hover:text-blue-400 transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="text-sm hover:text-blue-400 transition-colors">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-sm hover:text-blue-400 transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm hover:text-blue-400 transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Policies */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Policies</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/privacy-policy" className="text-sm hover:text-blue-400 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms-conditions" className="text-sm hover:text-blue-400 transition-colors">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link href="/refund-policy" className="text-sm hover:text-blue-400 transition-colors">
                                    Refund Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/shipping-policy" className="text-sm hover:text-blue-400 transition-colors">
                                    Shipping Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3">
                                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">support@betty.com</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">+91 1234567890</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">123 Business Street, City, Country</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} Giftikko. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
