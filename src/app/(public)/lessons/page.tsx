"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, BookOpen, UserCheck, Link as LinkIcon, Calendar } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import MediaPreview from "@/components/MediaPreview";

export default function LessonsPage() {
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<any[]>([]);
  const [activeTerm, setActiveTerm] = useState<"1" | "2" | "all">("1");

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const q = query(collection(db, "lessons"), orderBy("createdAt", "desc"));
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

  const filteredLessons = lessons.filter((lesson) => {
    if (activeTerm === "all") return true;
    const termNum = String(lesson.term || 1);
    return termNum === activeTerm;
  });

  const term1Count = lessons.filter((l) => String(l.term || 1) === "1").length;
  const term2Count = lessons.filter((l) => String(l.term || 1) === "2").length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={64} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center justify-center p-4 bg-accent/20 rounded-full text-accent mb-4 neon-glow border border-accent/30">
          <BookOpen size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">แผนการจัดการเรียนรู้</h1>
      </motion.div>

      {/* Term Selector Tabs */}
      <motion.div 
        className="flex justify-center mb-12"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="inline-flex p-1.5 bg-white/60 glass rounded-2xl border border-white/80 shadow-sm gap-2">
          <button
            onClick={() => setActiveTerm("1")}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTerm === "1"
                ? "bg-primary text-white shadow-md scale-[1.02]"
                : "text-foreground/70 hover:text-foreground hover:bg-white/40"
            }`}
          >
            <Calendar size={18} />
            <span>ภาคเรียนที่ 1</span>
            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTerm === "1" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
              {term1Count} แผน
            </span>
          </button>

          <button
            onClick={() => setActiveTerm("2")}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTerm === "2"
                ? "bg-primary text-white shadow-md scale-[1.02]"
                : "text-foreground/70 hover:text-foreground hover:bg-white/40"
            }`}
          >
            <Calendar size={18} />
            <span>ภาคเรียนที่ 2</span>
            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTerm === "2" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
              {term2Count} แผน
            </span>
          </button>

          <button
            onClick={() => setActiveTerm("all")}
            className={`px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTerm === "all"
                ? "bg-foreground text-background shadow-md scale-[1.02]"
                : "text-foreground/70 hover:text-foreground hover:bg-white/40"
            }`}
          >
            <span>ทั้งหมด</span>
            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTerm === "all" ? "bg-white/20" : "bg-gray-200 text-gray-700"}`}>
              {lessons.length}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Plans List */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-20 bg-white/40 glass rounded-[2rem] border border-white/50">
          <BookOpen size={64} className="mx-auto mb-4 text-gray-400 opacity-60" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            ยังไม่มีแผนการสอน{activeTerm !== "all" ? ` ในภาคเรียนที่ ${activeTerm}` : ""}
          </h2>
          <p className="text-gray-500">กรุณาเพิ่มแผนการสอนในระบบแอดมิน</p>
        </div>
      ) : (
        <div className="space-y-12">
          {filteredLessons.map((lesson, i) => {
            const termNum = lesson.term || 1;

            return (
              <motion.div 
                key={lesson.id}
                className="glass p-6 md:p-8 rounded-[2rem] border border-white/50 bg-white/40 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-gray-200/50 pb-6">
                  <div>
                    {/* Meta badges: Subject & Mentor Teacher */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-primary/15 text-primary text-xs font-bold rounded-lg border border-primary/20">
                        ภาคเรียนที่ {termNum}
                      </span>
                      {lesson.subject && (
                        <span className="px-3 py-1 bg-blue-100/90 text-blue-800 text-xs font-bold rounded-lg border border-blue-200/60 flex items-center gap-1.5">
                          <BookOpen size={13} />
                          วิชา: {lesson.subject}
                        </span>
                      )}
                      {lesson.mentorTeacher && (
                        <span className="px-3 py-1 bg-emerald-100/90 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200/60 flex items-center gap-1.5">
                          <UserCheck size={13} />
                          ครูพี่เลี้ยง: {lesson.mentorTeacher}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {lesson.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <a 
                      href={lesson.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2 shadow-md hover:scale-105 transform duration-200"
                    >
                      <FileText size={18} />
                      เปิดดูแผนการสอน (Google Drive)
                    </a>
                    {lesson.workLink && (
                      <a 
                        href={lesson.workLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent/90 transition-all flex items-center gap-2 shadow-md hover:scale-105 transform duration-200"
                      >
                        <LinkIcon size={18} />
                        ดูชิ้นงาน/สื่อ
                      </a>
                    )}
                  </div>
                </div>

                {/* Embedded Scrollable PDF & Media Viewer */}
                <MediaPreview
                  pdfUrl={lesson.pdfUrl}
                  workLink={lesson.workLink}
                  pdfTitle="พรีวิวแผนการสอน (PDF)"
                  workTitle="พรีวิวชิ้นงาน/สื่อการสอน"
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}


