'use client';

import { Shield, Lock, Eye, Trash2, Truck, CreditCard } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                        <Shield size={40} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-4">Privacy Policy</h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        We value your trust. Here is how we protect your data and privacy.
                    </p>
                </div>

                {/* Short Summary */}
                <div className="bg-emerald-900 text-emerald-50 p-8 rounded-3xl shadow-xl mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <h2 className="text-2xl font-bold mb-4 relative z-10">In Short</h2>
                    <p className="text-lg leading-relaxed relative z-10 opacity-90">
                        We use your photos and personal data <strong>solely for fulfilling your order</strong>. We never sell your data to third parties for marketing purposes.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Data Collection */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                                <Eye size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">1. Data Collection</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    We collect basic information required to process your order:
                                </p>
                                <ul className="list-disc list-inside mt-3 text-slate-600 space-y-1 ml-2">
                                    <li>Name, Delivery Address, and Phone Number.</li>
                                    <li><strong>Personalization Files:</strong> Photos and text you upload for your custom products.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Use of Images */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 shrink-0">
                                <Trash2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">2. Use & Deletion of Images</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Your uploaded photos are used <strong>strictly for printing and manufacturing</strong> purposes.
                                </p>
                                <div className="mt-4 bg-red-50 text-red-800 p-4 rounded-xl border border-red-100 text-sm font-medium">
                                    <strong>Auto-Deletion Policy:</strong> To ensure your privacy, we permanently delete all customer images from our servers <strong>30-45 days</strong> after the order is delivered.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Security */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">3. Data Security</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    We use industry-standard technologies to keep your data safe. Our platform is built on <strong>Next.js</strong> and uses a secure <strong>Supabase (PostgreSQL)</strong> database with Row Level Security (RLS) to ensure data integrity. We do not sell your data to any third-party agencies.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Manual Payments */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">4. Payment Security</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Since we use <strong>Manual UPI Payments</strong>, we <strong>never</strong> ask for your bank login details, credit card numbers, or OTPs. We only request a transaction screenshot to verify your payment manually.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Third-Party Services */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                                <Truck size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">5. Third-Party Sharing</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    We share your Name, Address, and Phone Number <strong>only</strong> with our trusted shipping partners (such as Shiprocket, Delhivery, etc.) to ensure your order reaches you on time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
