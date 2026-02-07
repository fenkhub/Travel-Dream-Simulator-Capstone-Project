'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';

export default function Navbar() {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none"
        >
            <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between gap-8 pointer-events-auto shadow-lg shadow-primary/5">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white">
                        <Plane className="w-4 h-4" />
                    </div>
                    <span>DreamSim</span>
                </Link>

                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
                    <Link href="/#how-it-works" className="hover:text-white transition">How it Works</Link>
                    <Link href="/#features" className="hover:text-white transition">Features</Link>
                    <Link href="/#reviews" className="hover:text-white transition">Reviews</Link>
                </div>

                <Link href="/plan">
                    <button className="bg-white text-slate-900 px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-200 transition">
                        Start Planning
                    </button>
                </Link>
            </div>
        </motion.nav>
    );
}
