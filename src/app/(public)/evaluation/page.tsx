"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import MediaPreview from "@/components/MediaPreview";

export default function EvaluationPage() {
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [activeTerm, setActiveTerm] = useState(1);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const q = query(collection(db, "evaluations"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data: any[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setEvaluations(data);
      } catch (error) {
        console.error("Error fetching evaluations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
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
        className="text-center mb-16 flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center justify-center p-4 bg-accent/20 rounded-full text-accent mb-4 neon-glow border border-accent/30">
          <FileText size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">แบบประเมิน</h1>

        <div className="flex bg-white/50 p-1.5 rounded-2xl border border-white shadow-lg backdrop-blur-md">
          <button 
            onClick={() => setActiveTerm(1)}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTerm === 1 ? 'bg-primary text-white shadow-md scale-105' : 'text-foreground/70 hover:bg-white'}`}
          >
            ภาคเรียนที่ 1
          </button>
          <button 
            onClick={() => setActiveTerm(2)}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTerm === 2 ? 'bg-primary text-white shadow-md scale-105' : 'text-foreground/70 hover:bg-white'}`}
          >
            ภาคเรียนที่ 2
          </button>
        </div>
      </motion.div>

      {(() => {
        const currentEvaluations = evaluations.filter(e => (e.term || 1) === activeTerm);
        
        return currentEvaluations.length === 0 ? (
          <div className="text-center py-20 bg-white/40 glass rounded-[2rem] border border-white/50">
            <FileText size={64} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-foreground mb-2">ยังไม่มีแบบประเมินในเทอมนี้</h2>
            <p className="text-gray-500">กรุณาเพิ่มแบบประเมินในระบบแอดมิน</p>
          </div>
        ) : (
          <div className="space-y-12">
            {currentEvaluations.map((evalItem, i) => (
              <motion.div 
                key={evalItem.id}
                className="glass p-6 md:p-8 rounded-[2rem] border border-white/50 bg-white/40 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-gray-200/50 pb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{evalItem.title}</h2>
                    <p className="text-foreground/60 flex items-center gap-2 mt-1">
                      <FileText size={16} />
                      {evalItem.filename || "แบบประเมิน (PDF)"}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <a 
                      href={evalItem.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2 shadow-md hover:scale-105 transform duration-200"
                    >
                      <FileText size={20} />
                      เปิดดูแบบประเมิน (Google Drive)
                    </a>
                  </div>
                </div>

                {/* Embedded PDF Viewer */}
                <MediaPreview
                  pdfUrl={evalItem.pdfUrl}
                  pdfTitle="พรีวิวแบบประเมิน (PDF)"
                />
              </motion.div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

