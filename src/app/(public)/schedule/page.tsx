"use client";

import { useState, useEffect } from "react";
import ImageCarousel from "@/components/ImageCarousel";
import { motion } from "framer-motion";
import { BookOpen, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function SchedulePage() {
  const [loading, setLoading] = useState(true);
  const [scheduleImages, setScheduleImages] = useState<{id: string, url: string, term: number}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch local schedule images for term 1 & term 2
        const t1Res = await fetch("/api/local-images?folder=schedule/term-1");
        const t1Data = await t1Res.json();
        const localT1 = t1Data.images || [];

        const t2Res = await fetch("/api/local-images?folder=schedule/term-2");
        const t2Data = await t2Res.json();
        const localT2 = t2Data.images || [];

        const scheduleSnap = await getDoc(doc(db, "school", "schedule"));
        const dbImages = (scheduleSnap.exists() && scheduleSnap.data().images) ? scheduleSnap.data().images : [];

        setScheduleImages([...localT1, ...localT2, ...dbImages]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={64} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center justify-center p-4 bg-primary/20 rounded-full text-primary mb-4 neon-glow border border-primary/30">
          <BookOpen size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">ตารางสอน</h1>
        <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
          ตารางการจัดกิจกรรมการเรียนการสอน (Teaching Schedule)
        </p>
      </motion.div>

      {scheduleImages.length === 0 ? (
        <div className="text-center py-20 bg-white/40 glass rounded-[2rem] border border-white/50">
          <BookOpen size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-foreground mb-2">ยังไม่มีตารางสอน</h2>
          <p className="text-gray-500">กรุณาเพิ่มรูปภาพตารางสอนในระบบแอดมิน</p>
        </div>
      ) : (
        <div className="space-y-16">
          {/* Term 1 */}
          {scheduleImages.filter(img => img.term === 1).length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">1</span>
                ภาคเรียนที่ 1
              </h2>
              <motion.div 
                className="glass p-6 md:p-8 rounded-[2rem] border border-primary/20 bg-white/40 shadow-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <ImageCarousel 
                  images={scheduleImages.filter(img => img.term === 1)} 
                  accentColor="primary" 
                  aspectRatio="aspect-[4/3]" 
                  imageFit="contain" 
                />
              </motion.div>
            </div>
          )}

          {/* Term 2 */}
          {scheduleImages.filter(img => img.term === 2).length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-accent mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]">2</span>
                ภาคเรียนที่ 2
              </h2>
              <motion.div 
                className="glass p-6 md:p-8 rounded-[2rem] border border-accent/20 bg-white/40 shadow-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ImageCarousel 
                  images={scheduleImages.filter(img => img.term === 2)} 
                  accentColor="accent" 
                  aspectRatio="aspect-[4/3]" 
                  imageFit="contain" 
                />
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
