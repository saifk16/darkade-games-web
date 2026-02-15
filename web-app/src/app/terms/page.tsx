'use client';

import { Scale, FileText, AlertCircle, Ban, Check, BadgeCheck } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 mx-auto mb-6">
                        <Scale size={40} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-4">Terms of Service</h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        Please read these terms carefully before using our platform.
                    </p>
                </div>

                <div className="space-y-8">

                    {/* Platform Role */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="text-slate-400 font-normal">01.</span> Platform Role
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                            <strong>Personalised Wallah</strong> operates as a marketplace. We connect buyers with skilled sellers/manufacturers. While we facilitate the transaction, the ultimate responsibility for the product quality lies with the seller. However, we actively assist in resolving specific disputes regarding damage or personalization errors.
                        </p>
                    </div>

                    {/* Accuracy */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="text-slate-400 font-normal">02.</span> Accuracy of Personalisation
                        </h3>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            The product will be printed exactly as per the text or image provided by you.
                        </p>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3 text-sm text-orange-800">
                            <AlertCircle className="shrink-0 mt-0.5" size={18} />
                            <p>
                                We are <strong>not responsible</strong> for spelling mistakes made by the user or low-resolution images uploaded by the user. Please preview your details carefully before ordering.
                            </p>
                        </div>
                    </div>

                    {/* Order Confirmation */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="text-slate-400 font-normal">03.</span> Order Confirmation
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                            An order is considered "Confirmed"  and moves to production <strong>only after</strong> we receive your payment screenshot and verify the transaction manually. Pending payments will not be processed.
                        </p>
                    </div>

                    {/* No Return Policy */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="text-slate-400 font-normal">04.</span> No Return Policy
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                            Due to the personalized nature of our catalog, <strong>all sales are final</strong>. Orders cannot be cancelled, returned, or exchanged once production has started, except in cases of damage or incorrect printing by the seller (requires unboxing video).
                        </p>
                    </div>

                    {/* User Conduct */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="text-slate-400 font-normal">05.</span> User Conduct
                        </h3>
                        <div className="flex gap-4 items-start">
                            <Ban className="text-red-500 shrink-0 mt-1" />
                            <p className="text-slate-600 leading-relaxed">
                                Users are strictly prohibited from uploading images that are illegal, offensive, explicit, or violate the copyright/intellectual property rights of others. We reserve the right to cancel such orders without notice.
                            </p>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="text-slate-400 font-normal">06.</span> Pricing & Shipping
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                            Prices displayed on the platform are subject to change without prior notice. Shipping charges are calculated at checkout based on your location and the weight of the items.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
