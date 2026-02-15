import { ShieldCheck, Gift, Truck, Headphones } from 'lucide-react';

export default function FeaturesBanner() {
    const features = [
        {
            icon: <ShieldCheck size={32} className="text-indigo-600" />,
            title: "Zero Risk Buying",
            desc: "100% Secure Payments"
        },
        {
            icon: <Gift size={32} className="text-pink-600" />,
            title: "Custom Made",
            desc: "Personalized with Love"
        },
        {
            icon: <Truck size={32} className="text-emerald-600" />,
            title: "Free Shipping",
            desc: "On Orders Above ₹499"
        },
        {
            icon: <Headphones size={32} className="text-orange-600" />,
            title: "24/7 Support",
            desc: "We're Here to Help"
        }
    ];

    return (
        <div className="bg-white border-y border-slate-100 py-8 mb-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-slate-50 transition-colors duration-300">
                            <div className="mb-3 p-3 bg-slate-50 rounded-full shadow-sm">{feature.icon}</div>
                            <h3 className="font-bold text-slate-800 text-sm md:text-base mb-1">{feature.title}</h3>
                            <p className="text-slate-500 text-xs md:text-sm">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
