'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Plane, MapPin, Star, Clock, DollarSign } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background text-foreground pt-20">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-1000" />
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[100px] animate-pulse delay-2000" />
            </div>

            <div className="container mx-auto px-4 z-10 relative">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8 text-center lg:text-left"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm font-medium text-primary"
                        >
                            <Star className="w-4 h-4 fill-primary" />
                            <span>The Future of Travel Planning</span>
                        </motion.div>

                        <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                            Experience Your <br />
                            <span className="text-gradient">Dream Vacation</span> <br />
                            Before You Go.
                        </h1>

                        <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Immerse yourself in hyper-realistic simulations of your perfect trip.
                            Plan with confidence, explore with wonder, and never settle for less than extraordinary.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link href="/plan">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg shadow-[0_0_20px_rgba(56,189,248,0.5)] hover:shadow-[0_0_30px_rgba(56,189,248,0.7)] transition-all flex items-center gap-2 justify-center"
                                >
                                    Start Your Journey
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </Link>

                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 glass-panel rounded-full font-semibold text-lg flex items-center gap-2 justify-center hover:border-primary/50 transition-all"
                            >
                                <Plane className="w-5 h-5" />
                                View Demo
                            </motion.button>
                        </div>

                        <div className="pt-8 flex items-center gap-8 justify-center lg:justify-start text-slate-500 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-background flex items-center justify-center text-xs text-white">
                                            {/* Placeholder for user avatars */}
                                            U{i}
                                        </div>
                                    ))}
                                </div>
                                <span>10k+ Dreamers</span>
                            </div>
                            <div className="w-px h-8 bg-slate-800" />
                            <div className="flex items-center gap-2">
                                <div className="flex text-accent">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star key={i} className="w-4 h-4 fill-accent" />
                                    ))}
                                </div>
                                <span>5.0 Rating</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Visual Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative w-full aspect-square max-w-lg mx-auto perspective-1000">
                            {/* Main Floating Card */}
                            <motion.div
                                animate={{
                                    y: [0, -20, 0],
                                    rotateX: [0, 5, 0],
                                    rotateY: [0, 5, 0]
                                }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl z-10 backdrop-blur-xl"
                            >
                                {/* Globe Background */}
                                <div className="absolute inset-0 opacity-40">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.2),transparent_70%)]" />
                                    <svg className="w-full h-full animate-[spin_60s_linear_infinite]" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="200" cy="200" r="198" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                        <circle cx="200" cy="200" r="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                                        <path d="M200 0 V400 M0 200 H400" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                    </svg>
                                </div>

                                <div className="p-8 h-full flex flex-col justify-between relative z-20">
                                    <div className="flex justify-between items-start">
                                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 text-white border border-white/10">
                                            <MapPin className="w-4 h-4 text-cyan-400" />
                                            Santorini, Greece
                                        </div>
                                        <div className="bg-green-500/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-green-400 border border-green-500/20">
                                            98% Match
                                        </div>
                                    </div>

                                    {/* Central Visual - Stylized Globe & Plane */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="relative w-64 h-64">
                                            {/* Glowing Core */}
                                            <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />

                                            {/* 3D Globe Representation */}
                                            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.3)] bg-gradient-to-br from-cyan-500/10 to-blue-600/10 backdrop-blur-sm overflow-hidden">
                                                <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover opacity-30 mix-blend-overlay" />
                                            </div>

                                            {/* Orbiting Plane 1 */}
                                            <motion.div
                                                className="absolute inset-0"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            >
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center justify-center z-30">
                                                    <Plane className="w-6 h-6 text-blue-600 transform rotate-45" />
                                                </div>
                                            </motion.div>

                                            {/* Orbiting Plane 2 - Counter direction */}
                                            <motion.div
                                                className="absolute inset-0"
                                                initial={{ rotate: 180 }}
                                                animate={{ rotate: -180 }}
                                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                            >
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)] flex items-center justify-center z-30">
                                                    <Plane className="w-5 h-5 text-cyan-600 transform -rotate-135" />
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Bottom Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                            <div className="text-slate-400 text-xs mb-1">Flight Duration</div>
                                            <div className="text-white font-bold text-lg flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-cyan-400" />
                                                12h 30m
                                            </div>
                                        </div>
                                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                            <div className="text-slate-400 text-xs mb-1">Est. Cost</div>
                                            <div className="text-white font-bold text-lg flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-green-400" />
                                                $1,250
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Elements - Enhanced */}
                            <motion.div
                                animate={{ y: [0, 30, 0], x: [0, 10, 0] }}
                                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -top-8 -right-8 w-48 glass-panel rounded-2xl z-20 p-4 flex flex-col gap-2 border border-white/20 shadow-xl bg-white/80 backdrop-blur-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Plane className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">Flight Found</div>
                                        <div className="text-xs text-slate-500">Direct • SkyHigh Air</div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, -25, 0], x: [0, -10, 0] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                                className="absolute -bottom-6 -left-6 w-auto glass-panel rounded-2xl z-20 p-4 flex items-center gap-4 border border-white/20 shadow-xl bg-white/80 backdrop-blur-xl"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    98
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-800">Dream Score</div>
                                    <div className="text-xs text-slate-500">Perfect Match</div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
