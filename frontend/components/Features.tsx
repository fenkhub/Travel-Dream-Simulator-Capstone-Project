'use client';

import { motion } from 'framer-motion';
import { Brain, Globe, Sparkles, Zap } from 'lucide-react';

const features = [
    {
        icon: Brain,
        title: "AI-Powered Itineraries",
        description: "Our advanced AI analyzes your preferences to craft the perfect second-by-second itinerary."
    },
    {
        icon: Globe,
        title: "Hyper-Realistic Simulation",
        description: "Experience the sights, sounds, and vibe of your destination before you book a single ticket."
    },
    {
        icon: Zap,
        title: "Instant Customization",
        description: "Don't like a suggestion? Swap it out instantly. The simulation adapts in real-time."
    },
    {
        icon: Sparkles,
        title: "Hidden Gems Unlocked",
        description: "Discover local secrets and off-the-beaten-path locations that standard guides miss."
    }
];

export default function Features() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold mb-6"
                    >
                        Why <span className="text-gradient">Dream First?</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 text-lg"
                    >
                        Traditional travel planning is a gamble. We turn it into a science—and an art form.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="glass-panel p-8 rounded-3xl relative group overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <feature.icon className="w-6 h-6 text-primary" />
                            </div>

                            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                                {feature.title}
                            </h3>

                            <p className="text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
