"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, Link as LinkIcon, Sparkles } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import MediaPreview from "@/components/MediaPreview";

export default function ResearchPage() {
  const [loading, setLoading] = useState(true);
  const [researches, setResearches] = useState<any[]>([]);

  useEffect(() => {
    const fetchResearches = async () => {
      try {
        const q = query(collection(db, "researches"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data: any[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setResearches(data);
      } catch (error) {
        console.error("Error fetching researches:", error);
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
        <p className="text-foreground/70 max-w-2xl mx-auto">
          แสดงรายการวิจัยในชั้นเรียนและผลงาน สามารถอ่านเอกสารวิจัย PDF และเปิดดูผลงานได้ทันที
        </p>
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
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <span className="font-bold text-xl">{researches.length - i}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{resItem.title}</h2>
                    <p className="text-foreground/60 flex items-center gap-2 mt-1">
                      <FileText size={16} />
                      {resItem.filename || "วิจัย (PDF)"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <a 
                    href={resItem.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2 shadow-md hover:scale-105 transform duration-200"
                  >
                    <FileText size={18} />
                    เปิดดูวิจัย (Google Drive)
                  </a>
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

              {/* Embedded PDF & Work Previewer */}
              <MediaPreview
                pdfUrl={resItem.pdfUrl}
                workLink={resItem.workLink}
                pdfTitle="พรีวิววิจัย (PDF)"
                workTitle="พรีวิวชิ้นงาน/ผลงาน"
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

