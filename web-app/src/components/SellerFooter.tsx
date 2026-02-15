'use client';

import Link from 'next/link';

export default function SellerFooter() {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 py-12 md:py-20 text-slate-400">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-2">
                        <Link href="/seller" className="text-2xl font-black text-white mb-6 inline-block">
                            Personalised<span className="text-orange-500">Wallah</span> Seller
                        </Link>
                        <p className="text-lg mb-8 max-w-sm">Join thousands of artists and creators building their dreams with us.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Support</h4>
                        <ul className="space-y-4">
                            <li><Link href="/seller/help" className="hover:text-white transition-colors">Seller Help Desk</Link></li>
                            <li><Link href="/seller/vendor-policy" className="hover:text-white transition-colors">Vendor Agreement</Link></li>
                            <li><Link href="/seller/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/seller/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Contact</h4>
                        <ul className="space-y-4">
                            <li><a href="mailto:sellers@personalisedwallah.com" className="hover:text-white transition-colors">sellers@personalisedwallah.com</a></li>
                            <li><span className="text-slate-500">Mon-Sat, 10am - 7pm</span></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-slate-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>&copy; {new Date().getFullYear()} Personalised Wallah. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
