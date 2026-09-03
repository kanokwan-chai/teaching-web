"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WeeklyLogSliderProps {
  images: string[];
  weekNumber: number | string;
}

export default function WeeklyLogSlider({ images, weekNumber }: WeeklyLogSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Auto slide if multiple images
  useEffect(() => {
    if (images.length <= 1 || isHovered || fullscreenImage) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length, isHovered, fullscreenImage]);

  if (!images || images.length === 0) {
    return null;
  }

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newIdx = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(newIdx);
    if (fullscreenImage) setFullscreenImage(images[newIdx]);
  };

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newIdx = (currentIndex + 1) % images.length;
    setCurrentIndex(newIdx);
    if (fullscreenImage) setFullscreenImage(images[newIdx]);
  };

  return (
    <>
      <div 
        className="w-full h-full relative group overflow-hidden select-none bg-black/5 flex items-center justify-center cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setFullscreenImage(images[currentIndex])}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`สัปดาห์ที่ ${weekNumber} รูปที่ ${currentIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-contain"
          />
        </AnimatePresence>

        {/* Counter Badge */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full z-10 shadow-md border border-white/20">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-10 focus:outline-none backdrop-blur-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-10 focus:outline-none backdrop-blur-sm"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Caption Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 pointer-events-none z-10">
          <p className="text-white text-sm font-bold truncate drop-shadow-md">
            ประมวลภาพสัปดาห์ที่ {weekNumber}
          </p>
          <div className="flex items-center gap-1 text-white/80 text-xs">
            <Maximize2 size={14} />
          </div>
        </div>

        {/* Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 p-1 rounded-full bg-black/30 backdrop-blur-sm">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(i);
                }}
                className={`transition-all rounded-full ${
                  i === currentIndex
                    ? "w-4 h-1.5 bg-white shadow-sm"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={() => setFullscreenImage(null)}
          >
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors z-50 focus:outline-none"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-colors z-50 focus:outline-none"
                  aria-label="Previous"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-colors z-50 focus:outline-none"
                  aria-label="Next"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}

            <div 
              className="max-w-5xl max-h-[85vh] relative flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={fullscreenImage}
                src={fullscreenImage}
                alt={`Week ${weekNumber} Fullscreen`}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              />
              <div className="mt-4 text-white font-medium text-sm flex items-center gap-3 bg-black/40 px-4 py-1.5 rounded-full border border-white/10">
                <span>สัปดาห์ที่ {weekNumber}</span>
                {images.length > 1 && <span>({currentIndex + 1} จาก {images.length})</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
