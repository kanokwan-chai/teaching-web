"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface ImageCarouselProps {
  images: any[];
  accentColor?: "primary" | "accent";
  aspectRatio?: string;
  imageFit?: "cover" | "contain";
  itemWidth?: string;
}

export default function ImageCarousel({ 
  images, 
  accentColor = "primary",
  aspectRatio = "aspect-square md:aspect-[4/3]",
  imageFit = "cover",
  itemWidth = "w-[80vw] md:w-[60vw] max-w-3xl"
}: ImageCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-scroll logic
  useEffect(() => {
    if (images.length <= 1 || isHovering) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const maxScroll = scrollWidth - clientWidth;
        
        // If reached the end, scroll back to start, else scroll right
        if (scrollLeft >= maxScroll - 10) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollContainerRef.current.scrollBy({ left: clientWidth * 0.8, behavior: "smooth" });
        }
      }
    }, 3000); // Auto scroll every 3 seconds

    return () => clearInterval(interval);
  }, [images.length, isHovering]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount = direction === "left" ? -(clientWidth * 0.8) : clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const shadowColor = accentColor === "primary" ? "rgba(16,185,129,0.2)" : "rgba(249,115,22,0.2)";
  const buttonHoverBg = accentColor === "primary" ? "hover:bg-primary" : "hover:bg-accent";

  if (images.length === 0) {
    return <p className="text-foreground/50 italic">ยังไม่มีรูปภาพ</p>;
  }

  if (images.length === 1) {
    return (
      <div className="w-full flex justify-center pt-2 pb-6">
        <div className={`${itemWidth} ${aspectRatio} rounded-3xl overflow-hidden glass border border-white/50 relative shadow-sm`}>
          <img 
            src={images[0].url} 
            alt="Single Image" 
            className={`w-full h-full object-${imageFit} bg-black/5`}
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative group pt-2 pb-6"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Navigation Buttons */}
      <button 
        onClick={() => scroll("left")}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -ml-2 md:-ml-6 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white text-foreground shadow-[0_5px_20px_rgba(0,0,0,0.15)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 ${buttonHoverBg} hover:text-white border border-gray-100 focus:outline-none`}
        aria-label="Previous"
      >
        <ChevronLeft size={28} />
      </button>
      
      <button 
        onClick={() => scroll("right")}
        className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-2 md:-mr-6 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white text-foreground shadow-[0_5px_20px_rgba(0,0,0,0.15)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 ${buttonHoverBg} hover:text-white border border-gray-100 focus:outline-none`}
        aria-label="Next"
      >
        <ChevronRight size={28} />
      </button>

      {/* Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-4 md:gap-6 pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
      >
        {images.map((img: any, i) => (
          <motion.div 
            key={`${img.id}-${i}`} 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`flex-none ${itemWidth} ${aspectRatio} rounded-3xl overflow-hidden glass border border-white/50 group/item relative shadow-sm hover:shadow-[0_15px_40px_-10px_${shadowColor}] transition-all snap-center`}
          >
            <img 
              src={img.url} 
              alt="Gallery Image" 
              className={`w-full h-full object-${imageFit} ${imageFit === 'cover' ? 'group-hover/item:scale-110 transition-transform duration-700' : 'bg-black/5'}`} 
            />
            {imageFit === 'cover' && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex items-end p-5">
                <span className="text-white font-medium drop-shadow-md">ดูรูปภาพ</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
