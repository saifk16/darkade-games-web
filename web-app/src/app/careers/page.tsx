'use client';

import { Briefcase, ArrowRight, Zap, Coffee, Globe } from 'lucide-react';

const positions = [
    {
        title: "Senior Graphic Designer",
        department: "Design",
        location: "Kanpur (On-site)",
        type: "Full-time",
        tags: ["Photoshop", "Illustrator", "Creative"]
    },
    {
        title: "E-commerce Operations Manager",
        department: "Operations",
        location: "Remote / Hybrid",
        type: "Full-time",
        tags: ["Logistics", "Inventory", "Team Lead"]
    },
    {
        title: "Customer Success Executive",
        department: "Support",
        location: "Remote",
        type: "Full-time",
        tags: ["Communication", "Empathy", "Problem Solving"]
    }
];

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-slate-50">

            {/* Header */}
            <div className="bg-white py-20 px-4 border-b border-slate-100">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm mb-6">We are hiring!</span>
                    <h1 className="text-5xl font-black text-slate-900 mb-6">Join the Revolution in <br />Personalized Gifting.</h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        Work with a passionate team dedicated to creating smiles across India. We are growing fast and looking for extraordinary talent.
                    </p>
                </div>
            </div>

            {/* Benefits */}
            <div className="py-16 max-w-7xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-center mb-12">Why work with us?</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: Zap, title: "Fast Growth", desc: "Join at a pivotal time and grow your career as we scale up." },
                        { icon: Globe, title: "Remote Friendly", desc: "We believe in work output, not just hours. Many roles are remote-first." },
                        { icon: Coffee, title: "Great Culture", desc: "A supportive environment where your ideas are valued and heard." }
                    ].map((perk, i) => (
                        <div key={i} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 mx-auto bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 mb-4">
                                <perk.icon size={24} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">{perk.title}</h3>
                            <p className="text-slate-500 text-sm">{perk.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Job Openings */}
            <div className="py-16 max-w-4xl mx-auto px-4">
                <h2 className="text-3xl font-black mb-8">Open Positions</h2>

                <div className="space-y-4">
                    {positions.map((job, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all group cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="font-bold text-xl text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold uppercase">{job.department}</span>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold uppercase">{job.type}</span>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold uppercase">{job.location}</span>
                                </div>
                            </div>
                            <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl group-hover:bg-indigo-600 transition-colors">
                                Apply Now
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center p-8 bg-indigo-50 rounded-3xl text-indigo-900 border border-indigo-100">
                    <h3 className="font-bold text-xl mb-2">Don't see your role?</h3>
                    <p className="mb-6">We are always looking for talent. Send your resume to <span className="font-bold">careers@personalised-wallah.in</span></p>
                    <button className="inline-flex items-center gap-2 font-bold hover:underline">
                        Email us <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
