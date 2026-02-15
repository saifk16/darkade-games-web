'use client';

import { AlertTriangle, RefreshCw, FileVideo, CheckCircle } from 'lucide-react';

export default function ReturnsPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                            <RefreshCw size={32} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4">Returns & Refunds</h1>
                    <p className="text-slate-600 text-lg">Our policy on customized products</p>
                </div>

                <div className="space-y-6">
                    {/* Main Policy Card */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-orange-500" />
                            Non-Returnable Policy
                        </h2>
                        <div className="prose prose-slate">
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Due to the personalized nature of our products, <strong>we cannot accept returns or exchanges</strong> for reasons such as "changed mind" or "didn't like the design" once the order has been processed. Each item is uniquely crafted specifically for you.
                            </p>
                            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                                <p className="text-orange-800 text-sm font-bold">
                                    "Customized products are non-returnable."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Replacement Rules */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <CheckCircle className="text-green-500" />
                            Replacement Qualification
                        </h2>
                        <p className="text-slate-600 mb-4">
                            We offer a <strong>free replacement</strong> under the following conditions ONLY:
                        </p>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 font-bold text-xs mt-0.5">1</span>
                                <span className="text-slate-600">The product arrived <strong>physically damaged</strong>.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 font-bold text-xs mt-0.5">2</span>
                                <span className="text-slate-600">There was a <strong>printing error</strong> or spelling mistake from our side (different from what you provided).</span>
                            </li>
                        </ul>
                        <p className="text-sm text-slate-500 italic">
                            Note: You must inform us within <strong>24 hours</strong> of delivery to be eligible for replacement.
                        </p>
                    </div>

                    {/* Mandatory Unboxing Video */}
                    <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <div className="relative z-10">
                            <h2 className="text-xl font-black mb-4 flex items-center gap-3">
                                <FileVideo className="text-red-500" />
                                MANDATORY REQUIREMENT
                            </h2>
                            <p className="text-slate-300 mb-6 leading-relaxed">
                                To claim any damage or missing item, you <strong>MUST provide a complete unboxing video</strong> starting from opening the sealed package.
                            </p>
                            <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                                <p className="font-bold text-center text-red-400">
                                    "Claims for damage will only be accepted if an unboxing video is provided."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
