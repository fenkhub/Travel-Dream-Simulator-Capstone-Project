'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Edit2, Calendar, DollarSign, MapPin, Activity, Sun, Sparkles, RefreshCw, Plane } from 'lucide-react';

interface ClarificationViewProps {
    parameters: any;
    onConfirm: (updatedParameters: any) => void;
    onEdit: () => void;
}

const SUGGESTED_INTERESTS = [
    "Beaches", "Cultural Sites", "Foodie", "Adventure",
    "Shopping", "Nightlife", "Nature", "Relaxation",
    "History", "Art", "Photography"
];

export default function ClarificationView({ parameters, onConfirm, onEdit }: ClarificationViewProps) {
    // Local state for tuning
    const [destination, setDestination] = useState(parameters.destination);
    const [origin, setOrigin] = useState(parameters.origin || '');
    const [duration, setDuration] = useState(parameters.duration_days);
    const [budget, setBudget] = useState(parameters.preferences.budget_range || 'Moderate');
    const [pace, setPace] = useState(parameters.preferences.travel_style || 'Balanced');
    const [interests, setInterests] = useState<string[]>(parameters.preferences.interests || []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleInterest = (interest: string) => {
        if (interests.includes(interest)) {
            setInterests(interests.filter(i => i !== interest));
        } else {
            setInterests([...interests, interest]);
        }
    };

    const handleConfirm = () => {
        setIsSubmitting(true);

        if (!origin || origin.trim() === '') {
            // Don't proceed if origin is missing
            return;
        }

        // Construct updated parameters object
        const updatedParams = {
            ...parameters,
            destination: destination,
            origin: origin,
            duration_days: duration,
            preferences: {
                ...parameters.preferences,
                budget_range: budget,
                travel_style: pace,
                interests: interests
            }
        };
        onConfirm(updatedParams);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-300/30 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "backOut" }}
                className="relative bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden z-10"
            >
                <div className="p-8 md:p-10 space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            Just to confirm...
                            <Sparkles className="text-cyan-500" size={28} />
                        </h2>
                        <p className="text-slate-600 text-lg">Here's what I gathered from your dream trip to <span className="font-bold text-blue-700">{destination || "..."}</span>:</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Destination (Editable) */}
                        <div className="bg-white/50 p-4 rounded-2xl border border-white/60 flex items-start gap-3 group hover:bg-white/80 transition-colors">
                            <div className="p-2 bg-cyan-100 text-cyan-700 rounded-xl">
                                <MapPin size={20} />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Destination</label>
                                <input
                                    type="text"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="w-full mt-1 bg-transparent font-semibold text-slate-800 text-lg focus:outline-none border-b border-transparent focus:border-cyan-500 transition-colors placeholder-slate-400"
                                    placeholder="Where to?"
                                />
                            </div>
                            <Edit2 size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Origin (Editable) - MANDATORY */}
                        <div className={`bg-white/50 p-4 rounded-2xl border ${!origin && isSubmitting ? 'border-red-400 bg-red-50' : 'border-white/60'} flex items-start gap-3 group hover:bg-white/80 transition-colors`}>
                            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                                <Plane size={20} />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Origin <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={origin}
                                    onChange={(e) => setOrigin(e.target.value)}
                                    className="w-full mt-1 bg-transparent font-semibold text-slate-800 text-lg focus:outline-none border-b border-transparent focus:border-indigo-500 transition-colors placeholder-slate-400"
                                    placeholder="Where are you flying from?"
                                />
                                {!origin && isSubmitting && (
                                    <p className="text-xs text-red-500 mt-1">Please enter your origin city.</p>
                                )}
                            </div>
                            <Edit2 size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Duration (Editable) */}
                        <div className="bg-white/50 p-4 rounded-2xl border border-white/60 flex items-start gap-3 group hover:bg-white/80 transition-colors">
                            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                                <Calendar size={20} />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Duration (Days)</label>
                                <div className="flex items-center gap-3 mt-1">
                                    <button
                                        onClick={() => setDuration(Math.max(1, duration - 1))}
                                        className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition"
                                    >-</button>
                                    <span className="text-lg font-semibold text-slate-800 w-8 text-center">{duration}</span>
                                    <button
                                        onClick={() => setDuration(duration + 1)}
                                        className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition"
                                    >+</button>
                                </div>
                            </div>
                        </div>

                        {/* Budget (Editable) */}
                        <div className="bg-white/50 p-4 rounded-2xl border border-white/60 flex items-start gap-3 group hover:bg-white/80 transition-colors">
                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                                <DollarSign size={20} />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Budget Range</label>
                                <select
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    className="w-full mt-1 bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                                >
                                    <option value="Budget">Budget Friendly</option>
                                    <option value="Low Budget">Low Budget</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Luxury">Luxury</option>
                                    <option value="Ultra Luxury">Ultra Luxury</option>
                                </select>
                            </div>
                            <Edit2 size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Pace (Editable) */}
                        <div className="bg-white/50 p-4 rounded-2xl border border-white/60 flex items-start gap-3 group hover:bg-white/80 transition-colors">
                            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                                <Activity size={20} />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pace</label>
                                <select
                                    value={pace}
                                    onChange={(e) => setPace(e.target.value)}
                                    className="w-full mt-1 bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                                >
                                    <option value="Relaxed">Relaxed</option>
                                    <option value="Balanced">Balanced</option>
                                    <option value="Fast-paced">Fast-paced</option>
                                </select>
                            </div>
                            <Edit2 size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    {/* Interests (Interactive Chips) */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                            Interests & Themes
                            <span className="text-xs font-normal text-slate-400 normal-case">(Select all that apply)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {/* Combine current interests with suggestions, remove duplicates */}
                            {Array.from(new Set([...interests, ...SUGGESTED_INTERESTS])).map((interest) => {
                                const isSelected = interests.includes(interest);
                                return (
                                    <button
                                        key={interest}
                                        onClick={() => toggleInterest(interest)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isSelected
                                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 scale-105'
                                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                            }`}
                                    >
                                        {interest}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex gap-4">
                        <button
                            onClick={onEdit}
                            className="flex-1 bg-slate-200/50 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2 backdrop-blur-sm"
                        >
                            <RefreshCw size={20} />
                            Not quite, let me edit
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                            className="flex-[2] bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-cyan-500/30 transition flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Check size={24} />
                                    Looks good! Plan My Trip
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
