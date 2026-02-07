'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plane, Map, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

const INTERESTS = [
    { id: 'beaches', label: 'Beaches', color: 'bg-blue-100 text-blue-700' },
    { id: 'culture', label: 'Culture', color: 'bg-amber-100 text-amber-700' },
    { id: 'foodie', label: 'Foodie', color: 'bg-orange-100 text-orange-700' },
    { id: 'adventure', label: 'Adventure', color: 'bg-green-100 text-green-700' },
    { id: 'relaxation', label: 'Relaxation', color: 'bg-purple-100 text-purple-700' },
    { id: 'shopping', label: 'Shopping', color: 'bg-pink-100 text-pink-700' },
];

interface LandingInputProps {
    onSubmit: (description: string, interests: string[]) => void;
    initialValue?: string;
}

export default function LandingInput({ onSubmit, initialValue = '' }: LandingInputProps) {
    const [input, setInput] = useState(initialValue);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    const toggleInterest = (id: string) => {
        setSelectedInterests(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSubmit(input, selectedInterests);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 via-white to-amber-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-3xl text-center space-y-8"
            >
                <div className="space-y-2">
                    <motion.h1
                        className="text-5xl md:text-7xl font-bold text-slate-800 tracking-tight"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Dream. Plan. Go.
                    </motion.h1>
                    <motion.p
                        className="text-xl text-slate-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Describe your perfect trip, and let AI handle the rest.
                    </motion.p>
                </div>

                <motion.form
                    onSubmit={handleSubmit}
                    className="relative w-full"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                        <div className="relative bg-white rounded-2xl shadow-xl p-2 flex items-center">
                            <Search className="w-6 h-6 text-slate-400 ml-4" />
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="e.g., 10-day Japan trip for cherry blossoms, culture, and food under $5,000"
                                className="w-full p-4 text-lg text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Plan
                            </button>
                        </div>
                    </div>
                </motion.form>

                <motion.div
                    className="flex flex-wrap justify-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    {INTERESTS.map((interest) => (
                        <button
                            key={interest.id}
                            onClick={() => toggleInterest(interest.id)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-transparent",
                                interest.color,
                                selectedInterests.includes(interest.id)
                                    ? "ring-2 ring-offset-2 ring-slate-400 scale-105 shadow-sm"
                                    : "hover:scale-105 hover:shadow-sm opacity-80 hover:opacity-100"
                            )}
                        >
                            {interest.label}
                        </button>
                    ))}
                </motion.div>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute top-20 left-20 text-blue-200 opacity-50"
            >
                <Plane size={48} />
            </motion.div>
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 right-20 text-amber-200 opacity-50"
            >
                <Compass size={64} />
            </motion.div>
        </div>
    );
}
