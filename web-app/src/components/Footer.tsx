'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, ArrowRight, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();

    // Hide Footer on Seller pages
    // Hide Footer on Seller and Admin pages
    if (pathname?.startsWith('/seller') || pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')) {
        return null;
    }
    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 md:px-6">

                {/* Top Section: Newsletter & Brand */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-center">
                    <div>
                        <Link href="/" className="inline-block mb-6 group">
                            <span className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tighter">
                                Personalised Wallah
                                <span className="text-pink-500 inline-block group-hover:-translate-y-1 transition-transform">.</span>
                            </span>
                        </Link>
                        <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                            Elevate your lifestyle with our curated collection of premium personalized gifts and home decor. Designed for those who appreciate the finer things.
                        </p>
                    </div>

                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                        <h3 className="text-white font-bold text-lg mb-2">Join our Exclusive Club</h3>
                        <p className="text-slate-400 text-sm mb-4">Get early access to new collections and 10% off your first order.</p>
                        <form className="flex gap-2">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-sm"
                                />
                            </div>
                            <button type="submit" className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2">
                                <span>Join</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Middle Section: Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-800 pt-12 mb-12">
                    <div>
                        <h4 className="text-white font-bold mb-6">Shop</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/category/new" className="hover:text-pink-400 transition-colors">New Arrivals</Link></li>
                            <li><Link href="/shops" className="hover:text-pink-400 transition-colors">All Shops</Link></li>
                            <li><Link href="/category/bestsellers" className="hover:text-pink-400 transition-colors">Bestsellers</Link></li>
                            <li><Link href="/category/home-decor" className="hover:text-pink-400 transition-colors">Home Decor</Link></li>
                            <li><Link href="/category/gifts" className="hover:text-pink-400 transition-colors">Personalized Gifts</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Support</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/help" className="hover:text-indigo-400 transition-colors">Help Center</Link></li>
                            <li><Link href="/track-order" className="hover:text-indigo-400 transition-colors">Track Order</Link></li>
                            <li><Link href="/returns" className="hover:text-indigo-400 transition-colors">Returns & Refunds</Link></li>
                            <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="/seller/register" className="hover:text-white transition-colors">Become a Seller</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Connect</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all duration-300">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Copyright */}
                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm font-medium text-slate-500">
                        &copy; {new Date().getFullYear()} Personalised Wallah. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                        <span>Made with</span>
                        <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
                        <span>in India</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
