"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function LessonsPage() {
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const q = query(collection(db, "lessons"), orderBy("unit", "asc"));
        const querySnapshot = await getDocs(q);
        const data: any[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setLessons(data);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
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
        <div className="inline-flex items-center justify-center p-4 bg-accent/20 rounded-full text-accent mb-4 neon-glow border border-accent/30">
          <FileText size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">แผนการจัดการเรียนรู้</h1>
      </motion.div>

      {lessons.length === 0 ? (
        <div className="text-center py-20 bg-white/40 glass rounded-[2rem] border border-white/50">
          <FileText size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-foreground mb-2">ยังไม่มีแผนการสอน</h2>
          <p className="text-gray-500">กรุณาเพิ่มแผนการสอนในระบบแอดมิน</p>
        </div>
      ) : (
        <div className="space-y-12">
          {lessons.map((lesson, i) => (
            <motion.div 
              key={lesson.id}
              className="glass p-6 md:p-8 rounded-[2rem] border border-white/50 bg-white/40 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <span className="font-bold text-xl">หน่วยที่ {lesson.unit}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{lesson.title}</h2>
                    <p className="text-foreground/60 flex items-center gap-2 mt-1">
                      <FileText size={16} />
                      {lesson.filename}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <a 
                  href={lesson.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-lg hover:scale-105 transform duration-200"
                >
                  <FileText size={24} />
                  เปิดดูแผนการสอน (Google Drive)
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
