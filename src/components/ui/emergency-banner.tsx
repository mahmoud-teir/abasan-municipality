'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AlertTriangle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function EmergencyBanner() {
    const activeAlert = useQuery(api.emergency.getActive);
    const [isVisible, setIsVisible] = useState(true);

    // Re-show banner if a new alert comes in
    useEffect(() => {
        if (activeAlert) {
            setIsVisible(true);
        }
    }, [activeAlert?._id]);

    if (!activeAlert || !isVisible) return null;

    const isCritical = activeAlert.level === 'critical';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`w-full overflow-hidden relative shadow-lg z-[100] border-b ${isCritical
                    ? 'bg-gradient-to-r from-red-700 via-rose-600 to-red-700 border-red-800'
                    : 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 border-orange-700'
                    }`}
            >
                <div className="flex items-center h-14">
                    {/* Fixed Label Section - Styled with glassmorphism */}
                    <div className={`shrink-0 z-20 h-full flex items-center px-6 backdrop-blur-md shadow-[4px_0_15px_rgba(0,0,0,0.2)] border-e ${isCritical ? 'bg-red-900/40 border-red-500/30' : 'bg-orange-900/40 border-orange-500/30'
                        }`}>
                        <div className="relative me-3">
                            <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
                            <AlertTriangle className="relative w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-white text-sm uppercase tracking-wider whitespace-nowrap drop-shadow-md">
                            {activeAlert.title}
                        </span>
                    </div>

                    {/* Scrolling Text Section */}
                    <div className="flex-1 overflow-hidden relative h-full flex items-center bg-black/10">
                        <motion.div
                            className="whitespace-nowrap flex items-center"
                            animate={{ x: ["100%", "-100%"] }}
                            transition={{
                                repeat: Infinity,
                                ease: "linear",
                                duration: 12, // Much faster speed (was 25)
                                repeatType: "loop"
                            }}
                        >
                            <span className="text-white font-semibold text-lg px-4 drop-shadow-sm tracking-wide">
                                {activeAlert.message}
                            </span>
                        </motion.div>
                    </div>

                    {/* Close Button */}
                    <div className={`shrink-0 z-20 h-full flex items-center px-4 transition-colors backdrop-blur-md cursor-pointer border-s ${isCritical ? 'bg-red-900/30 hover:bg-red-900/50 border-red-500/30' : 'bg-orange-900/30 hover:bg-orange-900/50 border-orange-500/30'
                        }`}
                        onClick={() => setIsVisible(false)}
                    >
                        <X className="w-5 h-5 text-white/90 hover:text-white transition-transform hover:scale-110" />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
