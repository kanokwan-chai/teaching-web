"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { BookOpen, Calendar, MapPin, Award, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import ImageCarousel from "@/components/ImageCarousel";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  useEffect(() => {
    // Fetch settings and gallery
    const fetchData = async () => {
      try {
        const docRef = doc(db, "settings", "profile");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }

        // Fetch profile local image
        const profRes = await fetch("/api/local-images?folder=profile");
        const profData = await profRes.json();
        let localProfileUrl = "";
        if (profData.images && profData.images.length > 0) {
          localProfileUrl = profData.images[0].url;
        }

        // Fetch local gallery images for term 1 & term 2
        const t1Res = await fetch("/api/local-images?folder=gallery/term-1");
        const t1Data = await t1Res.json();
        const localT1 = t1Data.images || [];

        const t2Res = await fetch("/api/local-images?folder=gallery/term-2");
        const t2Data = await t2Res.json();
        const localT2 = t2Data.images || [];

        const gallerySnap = await getDoc(doc(db, "gallery", "images"));
        const dbItems = gallerySnap.exists() ? (gallerySnap.data().items || []) : [];
        setGalleryImages([...localT1, ...localT2, ...dbItems]);

        if (localProfileUrl) {
          setSettings((prev: any) => ({ ...prev, imageUrl: localProfileUrl }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const term1Images = galleryImages.filter(img => img.term === 1);
  const term2Images = galleryImages.filter(img => img.term === 2);

  // Handle scroll to dismiss intro
  useEffect(() => {
    const handleScroll = (e: WheelEvent | TouchEvent) => {
      if (!showIntro) return;

      if (e instanceof WheelEvent && e.deltaY > 100) {
        setShowIntro(false);
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      if (touchStartY - touchEndY > 100 && showIntro) setShowIntro(false);
    };

    if (showIntro) {
      window.addEventListener("wheel", handleScroll);
      window.addEventListener("touchstart", handleTouchStart);
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [showIntro]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-[100] bg-white/40 backdrop-blur-3xl flex flex-col items-center justify-center overflow-hidden"
            initial={{ y: 0 }}
            exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
          >
            {/* Animated Background Elements for Intro */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[
                { color: "bg-primary/20", size: 400, top: "10%", left: "15%", duration: 15, delay: 0 },
                { color: "bg-accent/20", size: 500, top: "60%", left: "70%", duration: 18, delay: 2 },
                { color: "bg-primary/10", size: 300, top: "70%", left: "10%", duration: 20, delay: 5 },
                { color: "bg-accent/15", size: 450, top: "5%", left: "80%", duration: 22, delay: 1 },
              ].map((shape, i) => (
                <motion.div
                  key={i}
                  className={`absolute rounded-full mix-blend-multiply filter blur-3xl ${shape.color}`}
                  style={{
                    width: shape.size,
                    height: shape.size,
                    top: shape.top,
                    left: shape.left,
                  }}
                  animate={{
                    x: [0, 50, -50, 0],
                    y: [0, -50, 50, 0],
                    scale: [1, 1.2, 0.9, 1],
                  }}
                  transition={{
                    duration: shape.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: shape.delay,
                  }}
                />
              ))}
            </div>

            <motion.div
              className="z-10 text-center flex flex-col items-center px-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white flex items-center justify-center text-white text-5xl font-bold mb-8 neon-glow overflow-hidden border-4 border-primary/20 p-2">
                <img src="/system-logo.png" className="w-full h-full object-contain rounded-full" alt="System Logo" id="system-logo-intro" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">รายงานการฝึกสอน</h1>
              <p className="text-xl md:text-2xl text-foreground/70 mb-12 max-w-2xl leading-relaxed">
                สาขาวิชา{settings?.major || "..."}<br />
                คณะ{settings?.faculty || "..."}<br />
                {settings?.university || "..."}
              </p>

              <motion.button
                onClick={() => setShowIntro(false)}
                className="flex flex-col items-center text-foreground/50 hover:text-primary transition-colors cursor-pointer group"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <span className="mb-2 text-sm uppercase tracking-widest">เลื่อนขึ้นเพื่อเข้าสู่เว็บไซต์</span>
                <ChevronUp className="w-8 h-8 group-hover:-translate-y-2 transition-transform" />
                <ChevronUp className="w-8 h-8 -mt-6 opacity-50 group-hover:-translate-y-2 transition-transform delay-75" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10 pt-20">
        <motion.div
          className="glass rounded-3xl p-8 md:p-12 mb-16 flex flex-col md:flex-row items-center gap-12 border-t border-l border-white/10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 50 : 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-white flex-shrink-0 flex items-center justify-center shadow-2xl neon-glow border-4 border-primary/20 relative overflow-hidden group p-3">
            <img src={settings?.imageUrl || ""} className="w-full h-full object-cover rounded-full relative z-10 bg-gray-100" alt="Profile" />
            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 -skew-x-12 z-20 pointer-events-none"></div>
          </div>

          <div className="flex-grow text-center md:text-left">
            <h2 className="text-xl md:text-2xl text-primary font-bold mb-3 tracking-wide">รายงานการฝึกประสบการณ์วิชาชีพครู</h2>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-dark to-accent">{settings?.name}</h1>
            <p className="text-lg text-foreground/80 mb-8 max-w-2xl leading-relaxed">
              วิทยาลัยอาชีวศึกษาสุราษฎร์ธานี<br />
              {settings?.term}
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link href="/school" className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary-dark hover:scale-105 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2">
                <MapPin size={20} />
                ข้อมูลสถานศึกษา
              </Link>
              <Link href="/logs" className="px-8 py-4 glass text-foreground font-medium rounded-full hover:bg-white/50 hover:scale-105 transition-all flex items-center gap-2 border border-primary/20 hover:border-primary/50 shadow-sm">
                <BookOpen size={20} />
                บันทึกการฝึกสอน
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={showIntro ? "hidden" : "visible"}
          className="space-y-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">ภาพรวมกิจกรรมการฝึกสอน</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
          </div>
          
          <div className="space-y-12">
            {/* Term 1 */}
            <div>
              <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">1</span>
                ภาคเรียนที่ 1
              </h3>
                <ImageCarousel 
                  images={term1Images} 
                  accentColor="primary" 
                  aspectRatio="aspect-square" 
                  imageFit="contain" 
                  itemWidth="w-[280px] md:w-[320px]"
                />
            </div>

            {/* Term 2 */}
            <div>
              <h3 className="text-2xl font-bold text-accent mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]">2</span>
                ภาคเรียนที่ 2
              </h3>
              <ImageCarousel 
                images={term2Images} 
                accentColor="accent" 
                aspectRatio="aspect-square" 
                imageFit="contain" 
                itemWidth="w-[280px] md:w-[320px]"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
