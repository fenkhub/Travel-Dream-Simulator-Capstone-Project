'use client';

import { motion } from 'framer-motion';
import { Search, Sliders, Plane } from 'lucide-react';

const steps = [
    {
        icon: Search,
        title: "1. Dream It",
        description: "Tell us about your ideal trip. Be as specific or vague as you like—our AI understands context."
    },
    {
        icon: Sliders,
        title: "2. Refine It",
        description: "Review the generated plan. Tweak the budget, swap activities, or change the pace instantly."
    },
    {
        icon: Plane,
        title: "3. Experience It",
        description: "Immerse yourself in the simulation. Walk through your itinerary before you book."
    }
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-slate-900/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        From <span className="text-gradient">Thought</span> to <span className="text-gradient-gold">Reality</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Three simple steps to guarantee your next trip is perfect.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="relative flex flex-col items-center text-center"
                        >
                            <div className="w-24 h-24 rounded-full glass-panel flex items-center justify-center mb-6 z-10 bg-background">
                                <step.icon className="w-10 h-10 text-primary" />
                            </div>

                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-slate-400 leading-relaxed max-w-xs">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
