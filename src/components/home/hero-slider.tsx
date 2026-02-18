'use client';

import { useState, useEffect } from 'react';
import { HeroSlide } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
    slides: HeroSlide[];
    defaultTitle: string;
    defaultSubtitle: string;
    locale: string;
};

export function HeroSlider({ slides, defaultTitle, defaultSubtitle, locale }: Props) {
    const [current, setCurrent] = useState(0);

    const activeSlides = slides && slides.length > 0 ? slides : [];

    useEffect(() => {
        if (activeSlides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % activeSlides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [activeSlides.length]);

    const next = () => setCurrent((prev) => (prev + 1) % activeSlides.length);
    const prev = () => setCurrent((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);

    // Default Content Render (if no slides)
    if (activeSlides.length === 0) {
        return (
            <section className="relative bg-gradient-to-br from-primary/90 to-primary py-20 md:py-32 overflow-hidden h-[300px] sm:h-[500px] md:h-[700px] flex items-center justify-center">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="container mx-auto px-4 text-center text-white relative z-10">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
                        {defaultTitle}
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl mb-10 opacity-90 font-light max-w-2xl mx-auto">
                        {defaultSubtitle}
                    </p>

                </div>
            </section>
        );
    }

    const currentSlide = activeSlides[current];
    const title = locale === 'ar' ? currentSlide.titleAr : currentSlide.titleEn;
    const subtitle = locale === 'ar' ? currentSlide.subtitleAr : currentSlide.subtitleEn;

    return (
        <section className="relative h-[300px] sm:h-[500px] md:h-[700px] w-full overflow-hidden bg-slate-900">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <Image
                        src={currentSlide.imageUrl}
                        alt={title || "Hero Image"}
                        fill
                        className="object-cover opacity-60"
                        priority
                        unoptimized
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/30" />

                    {/* Content */}
                    <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight max-w-4xl drop-shadow-lg">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-lg sm:text-xl md:text-2xl mb-10 opacity-90 font-light max-w-2xl mx-auto drop-shadow-md">
                                    {subtitle}
                                </p>
                            )}
                        </motion.div>


                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {activeSlides.length > 1 && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 sm:w-12 sm:h-12"
                        onClick={prev}
                    >
                        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 sm:w-12 sm:h-12"
                        onClick={next}
                    >
                        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                    </Button>

                    {/* Dots */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
                        {activeSlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrent(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${index === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
