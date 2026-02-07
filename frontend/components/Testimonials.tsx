'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: "Sarah J.",
        role: "Digital Nomad",
        text: "I simulated my Bali trip and realized I needed a quieter area. Saved me a month of stress!",
        rating: 5
    },
    {
        name: "Michael C.",
        role: "Adventure Seeker",
        text: "The hidden gems feature is no joke. Found a waterfall that wasn't on any blog.",
        rating: 5
    },
    {
        name: "Elena R.",
        role: "Luxury Traveler",
        text: "Being able to 'walk' through the hotel before booking is a game changer.",
        rating: 5
    },
    {
        name: "David K.",
        role: "Family Planner",
        text: "My kids loved the preview. Got them excited for the museum visits!",
        rating: 4
    }
];

export default function Testimonials() {
    return (
        <section className="py-24 relative overflow-hidden bg-slate-900/50">
            <div className="container mx-auto px-4 mb-12">
                <h2 className="text-3xl md:text-5xl font-bold text-center mb-6">
                    Real <span className="text-gradient-gold">Dreams</span> Realized
                </h2>
            </div>

            <div className="flex overflow-hidden mask-gradient-x">
                <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="flex gap-8 px-4 w-max"
                >
                    {[...testimonials, ...testimonials].map((t, i) => (
                        <div
                            key={i}
                            className="w-[350px] glass-panel p-6 rounded-2xl flex-shrink-0"
                        >
                            <div className="flex gap-1 mb-4">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                                ))}
                            </div>
                            <p className="text-slate-300 mb-6 italic">"{t.text}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                                    {t.name[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{t.name}</div>
                                    <div className="text-xs text-slate-500">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
