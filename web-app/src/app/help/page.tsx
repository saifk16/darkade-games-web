'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
    {
        question: "How do I upload my photo for personalization?",
        answer: "You can upload your photo directly on the product page before adding the item to your cart. Please ensure the photo is high quality for the best printing results."
    },
    {
        question: "How long will it take to deliver my order?",
        answer: "Standard delivery takes 5-7 business days. We also offer express shipping options at checkout which can deliver within 2-3 business days subject to availability."
    },
    {
        question: "Can I change my order after placing it?",
        answer: "Since our products are customized, we start production immediately. If you need to make changes, please contact us within 2 hours of placing the order via WhatsApp or Email."
    },
    {
        question: "What if I receive a damaged product?",
        answer: "If you receive a damaged product, please contact us within 24 hours with an unboxing video. We will happily send a replacement free of charge."
    },
    {
        question: "Do you offer Cash on Delivery (COD)?",
        answer: "Yes, COD is available for select pincodes. However, for some high-value personalized items, a partial advance payment might be required."
    }
];

export default function HelpPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                            <HelpCircle size={32} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4">Help Center</h1>
                    <p className="text-slate-600 text-lg">Frequently asked questions and support</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-200 hover:shadow-md"
                        >
                            <button
                                onClick={() => setOpenIndex(active => active === index ? null : index)}
                                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                            >
                                <span className="font-bold text-slate-800 text-lg">{faq.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp className="text-indigo-600 shrink-0" />
                                ) : (
                                    <ChevronDown className="text-slate-400 shrink-0" />
                                )}
                            </button>

                            <div
                                className={`px-6 text-slate-600 leading-relaxed transition-all duration-200 ease-in-out ${openIndex === index ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                                    }`}
                            >
                                {faq.answer}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-xl text-slate-900 mb-2">Still have questions?</h3>
                    <p className="text-slate-500 mb-6">We're here to help you via WhatsApp or Email.</p>
                    <a href="/contact" className="inline-flex items-center justify-center px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}
