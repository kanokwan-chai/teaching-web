"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, Link as LinkIcon, Sparkles, Presentation } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import MediaPreview from "@/components/MediaPreview";

export default function ResearchPage() {
  const [loading, setLoading] = useState(true);
  const [researches, setResearches] = useState<any[]>([]);

  useEffect(() => {
    const fetchResearches = async () => {
        const defaultResearches = [
          {
            id: "default_research_1",
            title: "การพัฒนาผลสัมฤทธิ์ทางการเรียนวิชาการสร้างเว็บไซต์ด้วยการเรียนรู้แบบใช้โครงงานเป็นฐาน (Project-Based Learning)",
            pdfUrl: "https://drive.google.com",
            workLink: ""
          }
        ];

        try {
          const querySnapshot = await getDocs(collection(db, "researches"));
          const data: any[] = [];
          querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
          });
          setResearches(data.length > 0 ? data : defaultResearches);
        } catch (dbErr) {
          console.warn("Firestore research fetch notice:", dbErr);
          setResearches(defaultResearches);
        } finally {
          setLoading(false);
        }
    };
    fetchResearches();
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
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">วิจัยในชั้นเรียน</h1>
      </motion.div>

      {researches.length === 0 ? (
        <div className="text-center py-20 bg-white/40 glass rounded-[2rem] border border-white/50">
          <FileText size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-foreground mb-2">ยังไม่มีวิจัยในชั้นเรียน</h2>
          <p className="text-gray-500">กรุณาเพิ่มวิจัยในระบบแอดมิน</p>
        </div>
      ) : (
        <div className="space-y-12">
          {researches.map((resItem, i) => (
            <motion.div 
              key={resItem.id}
              className="glass p-6 md:p-8 rounded-[2rem] border border-white/50 bg-white/40 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-gray-200/50 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{resItem.title}</h2>
                  <p className="text-foreground/60 flex items-center gap-2 mt-1">
                    <FileText size={16} />
                    {resItem.filename || "วิจัย (PDF)"}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {resItem.pdfUrl && (
                    <a 
                      href={resItem.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2 shadow-md hover:scale-105 transform duration-200"
                    >
                      <FileText size={18} />
                      เปิดดูวิจัย (Google Drive)
                    </a>
                  )}
                  {resItem.slideUrl && (
                    <a 
                      href={resItem.slideUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-md hover:scale-105 transform duration-200"
                    >
                      <Presentation size={18} />
                      เปิดดูสไลด์นำเสนอ
                    </a>
                  )}
                  {resItem.workLink && (
                    <a 
                      href={resItem.workLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent/90 transition-all flex items-center gap-2 shadow-md hover:scale-105 transform duration-200"
                    >
                      <LinkIcon size={18} />
                      ดูชิ้นงาน/ผลงาน
                    </a>
                  )}
                </div>
              </div>

              {/* Embedded Media Viewer */}
              <MediaPreview
                pdfUrl={resItem.pdfUrl}
                pdfTitle="วิจัย (PDF)"
                slideUrl={resItem.slideUrl}
                slideTitle="สไลด์นำเสนอ"
                workLink={resItem.workLink}
                workTitle="ชิ้นงาน / ผลงาน"
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

